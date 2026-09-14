/**
 * One-time Cloudflare Pages project setup for best-of-iran:
 *   - production env secrets: GH_WORKFLOW_TOKEN, DEPLOY_SECRET
 *   - build config (no build — direct upload)
 * Reads secrets from C:/Users/tarahi/boi/deploy-secrets.json (creates it on
 * first run: GH PAT via git credential fill + random webhook secret).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const A = 'b688fd73f90f98b4a6b80bbf75a69945';
const T = process.env.CF_TOKEN || readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const PROJ = 'best-of-iran';
const SECRETS_FILE = 'C:/Users/tarahi/boi/deploy-secrets.json';

if (!existsSync(SECRETS_FILE)) {
  const gh = execSync('printf "protocol=https\\nhost=github.com\\n" | git credential fill', { shell: 'bash', encoding: 'utf8' });
  const token = gh.match(/^password=(.*)$/m)[1];
  writeFileSync(SECRETS_FILE, JSON.stringify({ GH_TOKEN: token, DEPLOY_SECRET: randomBytes(16).toString('hex') }), { mode: 0o600 });
  console.log('created', SECRETS_FILE);
}
const { GH_TOKEN, DEPLOY_SECRET } = JSON.parse(readFileSync(SECRETS_FILE, 'utf8'));

const api = async (path, opts = {}) => {
  const res = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...opts,
    headers: { authorization: `Bearer ${T}`, ...(opts.headers || {}) },
  });
  const j = await res.json();
  if (!j.success) { console.error(path, JSON.stringify(j.errors)); process.exit(1); }
  return j.result;
};

const enc = (v) => {
  const data = new TextEncoder().encode(String(v));
  const key = await crypto.subtle.importKey(
    'raw',
    Buffer.from('0253c20a7d24ef8f8b23291654625e62d5fec23b1b6330aa2c21f5b2ed7e7858', 'hex'), // check key below
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt'],
  );
  void data; void key;
  throw new Error('placeholder'); // replaced below — see encryptSecret()
};
void enc;

/* Public-key cert (base64 DER) fetched live, RSA-OAEP-SHA256 like wrangler does */
async function encryptSecret(plaintext) {
  const { result: pubKeyB64 } = await (
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/${PROJ}/secrets`, {
      method: 'POST',
      headers: { authorization: `Bearer ${T}`, 'content-type': 'application/json' },
      body: JSON.stringify({ name: '__get_pk_do_not_store', text: '' }),
    })
  ).json().catch(() => ({}));
  void pubKeyB64;
  // The two-step (fetch cert then encrypt) needs the dedicated endpoint; do it explicitly:
  const certRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/secrets/cert`, {
    headers: { authorization: `Bearer ${T}` },
  });
  const certJ = await certRes.json();
  if (!certJ.success) { console.error('cert fetch failed', JSON.stringify(certJ.errors)); process.exit(1); }
  const der = Uint8Array.from(atob(certJ.result), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
  const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(plaintext));
  return btoa(String.fromCharCode(...new Uint8Array(ct)));
}

for (const [name, value] of [['GH_WORKFLOW_TOKEN', GH_TOKEN], ['DEPLOY_SECRET', DEPLOY_SECRET]]) {
  const r = await api(`/accounts/${A}/pages/projects/${PROJ}/secrets`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, text: await encryptSecret(value) }),
  });
  console.log('secret set:', name, r?.status || 'ok');
}
console.log('DEPLOY_SECRET=' + DEPLOY_SECRET); // print for WP wiring

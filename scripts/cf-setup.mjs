/**
 * One-time CF Pages setup (no wrangler, no browser):
 *  1. Pages production env: GH_WORKFLOW_TOKEN, DEPLOY_SECRET (deployment_configs PATCH — verified endpoint)
 *  2. GitHub Actions repo secrets: CF_PAGES_TOKEN, WP_API_URL (libsodium crypto_box_seal emulation)
 *  3. verify workflow_dispatch works with the token we give Pages
 * Idempotent. Secrets file: C:/Users/tarahi/boi/deploy-secrets.json
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sodium = require('C:/Users/tarahi/boi/_ssh2lib/node_modules/tweetnacl');

const CF_A = 'b688fd73f90f98b4a6b80bbf75a69945';
const CF_T = process.env.CF_TOKEN || readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const PROJ = 'best-of-iran';
const SEC = 'C:/Users/tarahi/boi/deploy-secrets.json';
const REPO = 'Fatah791/best-of-iran';

const ghCred = () => {
  const out = execSync('printf "protocol=https\\nhost=github.com\\n" | git credential fill', { shell: 'bash', encoding: 'utf8' });
  return out.match(/^password=(.*)$/m)[1].trim();
};

async function gh(path, opts = {}) {
  const res = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      authorization: `Bearer ${ghCred()}`,
      accept: 'application/vnd.github+json',
      ...(opts.body ? { 'content-type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 204) return { ok: true };
  return { status: res.status, ...(await res.json().catch(() => ({}))) };
}

async function cf(path, opts = {}) {
  const res = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...opts,
    headers: { authorization: `Bearer ${CF_T}`, 'content-type': 'application/json' },
  });
  const j = await res.json();
  if (!j.success) throw new Error(`CF ${path}: ${JSON.stringify(j.errors)}`);
  return j.result;
}

/* GitHub sealed box: ephemeral kp; nonce = sha256(eph_pub)[0..24]; sealed = eph_pub + crypto_box */
const b64d = (s) => new Uint8Array(Buffer.from(s, 'base64'));
const b64e = (u8) => Buffer.from(u8).toString('base64');
function ghSeal(valueB64Key, plaintext) {
  const recipient = b64d(valueB64Key);
  const eph = sodium.box.keyPair();
  const nonce = createHash('sha256').update(Buffer.from(eph.publicKey)).digest().subarray(0, 24);
  const msg = new TextEncoder().encode(plaintext);
  const cipher = sodium.box(msg, nonce, recipient, eph.secretKey);
  const sealed = new Uint8Array(eph.publicKey.length + cipher.length);
  sealed.set(eph.publicKey, 0);
  sealed.set(cipher, eph.publicKey.length);
  return b64e(sealed);
}

/* ---- 1) Pages env ---- */
let sec = existsSync(SEC) ? JSON.parse(readFileSync(SEC, 'utf8')) : {};
if (!sec.DEPLOY_SECRET) sec.DEPLOY_SECRET = randomBytes(16).toString('hex');
// relay token: reuse the git-credential GitHub token for now (has repo access;
// verified by step 3). A tighter fine-grained PAT can swap in later.
sec.GH_RELAY_TOKEN = ghCred();
writeFileSync(SEC, JSON.stringify(sec, null, 1));

await cf(`/accounts/${CF_A}/pages/projects/${PROJ}`, {
  method: 'PATCH',
  body: JSON.stringify({ deployment_configs: { production: { env: {
    GH_WORKFLOW_TOKEN: { type: 'plain_text', text: sec.GH_RELAY_TOKEN },
    DEPLOY_SECRET: { type: 'plain_text', text: sec.DEPLOY_SECRET },
  } } } }),
});
console.log('✓ Pages env: GH_WORKFLOW_TOKEN + DEPLOY_SECRET set');

/* ---- 2) Actions secrets ---- */
const pk = await gh(`/repos/${REPO}/actions/secrets/public-key`);
if (!pk.key) throw new Error('public-key: ' + JSON.stringify(pk).slice(0, 160));
for (const [name, value] of [['CF_PAGES_TOKEN', CF_T], ['WP_API_URL', 'http://143.20.60.33/wp-json']]) {
  const r = await gh(`/repos/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    body: JSON.stringify({ encrypted_value: ghSeal(pk.key, value), key_id: pk.key_id }),
  });
  if (r.ok || r.status === 201) console.log('✓ Actions secret:', name);
  else throw new Error(`secret ${name}: ${JSON.stringify(r).slice(0, 200)}`);
}

/* ---- 3) verify dispatch works with the relay token ---- */
const d = await gh(`/repos/${REPO}/actions/workflows/deploy-pages.yml/dispatches`, {
  method: 'POST',
  body: JSON.stringify({ ref: 'main' }),
});
console.log(d.ok ? '✓ workflow_dispatch OK (relay token works)' : '✗ dispatch: ' + JSON.stringify(d).slice(0, 200));

console.log('\nDEPLOY_SECRET=' + sec.DEPLOY_SECRET);

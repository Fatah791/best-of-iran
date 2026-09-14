/**
 * Local deploy: build (WP source) → inject secrets into _worker.js
 * → zip dist → upload to Cloudflare Pages (Direct Upload).
 * Run from repo root. Secrets live in C:/Users/tarahi/boi/deploy-secrets.json
 * (gitignored) or are created on first run.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

const A = 'b688fd73f90f98b4a6b80bbf75a69945';
const T = process.env.CF_TOKEN || readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const PROJ = 'best-of-iran';
const SECRETS_FILE = 'C:/Users/tarahi/boi/deploy-secrets.json';

/* ---- secrets (create once, reuse) ---- */
if (!existsSync(SECRETS_FILE)) {
  // GitHub PAT with repo+workflow scope, from git credential store
  const gh = execSync('printf "protocol=https\\nhost=github.com\\n" | git credential fill', { shell: 'bash', encoding: 'utf8' });
  const token = gh.match(/^password=(.*)$/m)[1];
  writeFileSync(SECRETS_FILE, JSON.stringify({ GH_TOKEN: token, DEPLOY_SECRET: randomBytes(16).toString('hex') }));
}
const { GH_TOKEN, DEPLOY_SECRET } = JSON.parse(readFileSync(SECRETS_FILE, 'utf8'));

/* ---- build with WP as content source ---- */
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, WP_API_URL: 'http://143.20.60.33/wp-json', WP_TIMEOUT_MS: '20000', WP_RETRIES: '3' },
});

/* ---- inject secrets into the copy that gets uploaded (repo file stays placeholder) ---- */
const w = join('dist', '_worker.js');
writeFileSync(w, readFileSync(w, 'utf8')
  .replace('[_GH_TOKEN_]', GH_TOKEN)
  .replace('[_DEPLOY_SECRET_]', DEPLOY_SECRET));

/* ---- zip dist ---- */
if (existsSync('pages-deploy.zip')) rmSync('pages-deploy.zip');
execSync('powershell -NoProfile -Command "Compress-Archive -Path dist/* -DestinationPath pages-deploy.zip -Force"');

/* ---- upload ---- */
const zip = readFileSync('pages-deploy.zip');
console.log(`zip: ${(zip.length / 1e6).toFixed(2)} MB`);
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify({ branch: 'main' })], { type: 'application/json' }));
form.append('data', new Blob([zip.buffer], { type: 'application/zip' }));
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/${PROJ}/deployments`, {
  method: 'POST',
  headers: { authorization: `Bearer ${T}` },
  body: form,
});
const j = await res.json();
if (!j.success) { console.error('UPLOAD_FAILED', j.errors); process.exit(1); }
const d = j.result;
console.log('deployment:', d.id, d.url, d.stage || 'queued');

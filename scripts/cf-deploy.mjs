/**
 * Local deploy: build (WP source) → zip dist → upload to Cloudflare Pages
 * (Direct Upload). Pages env secrets (GH_WORKFLOW_TOKEN, DEPLOY_SECRET) are
 * managed by scripts/cf-setup.mjs — this script never touches source files.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const A = process.env.CF_ACCOUNT || 'b688fd73f90f98b4a6b80bbf75a69945';
const T = process.env.CF_TOKEN || readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const PROJ = 'best-of-iran';

/* ---- build with WP as content source (fallback to seed is automatic) ---- */
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, WP_API_URL: 'http://143.20.60.33/wp-json', WP_TIMEOUT_MS: '20000', WP_RETRIES: '3' },
});

/* ---- zip dist (worker + _headers ride along from public/) ---- */
if (existsSync('pages-deploy.zip')) rmSync('pages-deploy.zip');
execSync('powershell -NoProfile -Command "Compress-Archive -Path dist/* -DestinationPath pages-deploy.zip -Force"');

/* ---- upload ---- */
const zip = readFileSync('pages-deploy.zip');
console.log(`zip: ${(zip.length / 1e6).toFixed(2)} MB`);
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify({ branch: 'main' })], { type: 'application/json' }));
form.append('data', new Blob([zip], { type: 'application/zip' }), 'pages-deploy.zip');
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/${PROJ}/deployments`, {
  method: 'POST',
  headers: { authorization: `Bearer ${T}` },
  body: form,
});
const j = await res.json();
if (!j.success) { console.error('UPLOAD_FAILED', JSON.stringify(j.errors)); process.exit(1); }
const d = j.result;
console.log('deployment:', d.id);
console.log('url:', d.url);
console.log('alias:', d.alias);

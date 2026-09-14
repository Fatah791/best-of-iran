/**
 * Cloudflare Pages deploy (direct upload, wrangler-style manifest protocol).
 *   1. astro build with WP content source (seed fallback automatic)
 *   2. sha256 manifest of dist/, gzip blob upload (skips existing)
 *   3. create deployment → prints url/alias
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const A = 'b688fd73f90f98b4a6b80bbf75a69945';
const T = process.env.CF_TOKEN || readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const PROJ = 'best-of-iran';
const BASE = `https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/${PROJ}`;
const dist = 'dist';

/* ---- 1. build ---- */
execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, WP_API_URL: 'http://143.20.60.33/wp-json', WP_TIMEOUT_MS: '20000', WP_RETRIES: '3' },
});

/* ---- 2. manifest ---- */
const hashFile = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const manifest = {};
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else manifest['/' + relative(dist, p).replace(/\\/g, '/')] = hashFile(p);
  }
})(dist);

const blobs = new Map();
for (const [path, hash] of Object.entries(manifest)) {
  if (!blobs.has(hash)) blobs.set(hash, join(dist, path.slice(1)));
}
console.log(`files: ${Object.keys(manifest).length}, unique blobs: ${blobs.size}`);

/* ---- 3. deploy: one multipart POST — manifest + every file keyed by hash ---- */
const form = new FormData();
form.append('manifest', JSON.stringify(manifest));
/* Pages hashes the bytes it receives — send RAW files (gzip → hash mismatch → 500) */
for (const [hash, file] of blobs) {
  form.append(hash, new Blob([readFileSync(file)], { type: 'application/octet-stream' }), hash);
}
const res = await fetch(`${BASE}/deployments?branch=main`, {
  method: 'POST',
  headers: { authorization: `Bearer ${T}` },
  body: form,
});
const j = await res.json().catch(() => null);
if (!j || !j.success) { console.error('DEPLOY_FAILED', res.status, JSON.stringify(j?.errors ?? j?.message ?? '').slice(0, 300)); process.exit(1); }
console.log('deployment:', j.result.id);
console.log('url:  ', j.result.url);
console.log('alias:', j.result.alias ?? '— (alias updates asynchronously)');

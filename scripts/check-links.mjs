/**
 * Static link + content audit for dist/.
 * Fails the build if any internal href points to a missing page,
 * or if known-broken patterns (empty tel:, bare wa.me/) reappear.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, posix } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/(\w:\/)/, '$1');

function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = htmlFiles(dist);
const pages = new Set();
for (const f of files) {
  const rel = '/' + f.slice(dist.length).replace(/\\/g, '/');
  pages.add(rel.endsWith('/index.html') ? rel.slice('index.html'.length) : rel.replace(/\.html$/, ''));
}

/** Resolve an href the way a static host would. */
function resolveTarget(href) {
  let path = href.split('#')[0].split('?')[0];
  if (path === '') return path; // in-page anchor
  if (!path.startsWith('/')) return null; // external, skip
  path = path.replace(/\/+$/, '') || '/';
  return path;
}

const problems = [];
const checked = new Set();

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    const href = m[1];
    const t = resolveTarget(href);
    if (t === null) continue;

    if (t !== '' && !pages.has(t) && !existsSync(join(dist, t.replace(/^\//, '')))) {
      const key = `${href}`;
      if (!checked.has(key)) {
        checked.add(key);
        problems.push(`DEAD LINK  ${href}  (from ${f.slice(dist.length)})`);
      }
    }

    if (href === 'tel:' || href === 'tel:') problems.push(`EMPTY tel:  in ${f.slice(dist.length)}`);
    if (/^https:\/\/wa\.me\/?$/.test(href)) problems.push(`BARE wa.me  in ${f.slice(dist.length)}`);
  }
}

// every page should carry a canonical + og:title
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const rel = f.slice(dist.length);
  if (rel.includes('404')) continue;
  if (!/<link rel="canonical"/.test(html)) problems.push(`NO CANONICAL  ${rel}`);
  if (!/property="og:title"/.test(html)) problems.push(`NO OG TITLE  ${rel}`);
}

if (problems.length) {
  console.error(`✗ link audit: ${problems.length} problem(s)\n` + [...new Set(problems)].join('\n'));
  process.exit(1);
}
console.log(`✓ link audit passed — ${files.length} pages, ${checked.size} patterns checked, 0 dead links`);

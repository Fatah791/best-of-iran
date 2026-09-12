/**
 * Generates dist/sitemap.xml + dist/og.png after astro build.
 * (Hand-rolled instead of @astrojs/sitemap so we control Persian
 * entries, ordering, and the OG image without extra deps.)
 */
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SITE = 'https://best-of-iran.vercel.app';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

function pages(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) pages(p, acc);
    else if (name.endsWith('.html')) {
      let rel = '/' + p.slice(dist.length).replace(/\\/g, '/');
      rel = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
      if (rel.length > 1) rel = rel.replace(/\/$/, '');
      acc.push(rel === '' ? '/' : rel);
    }
  }
  return acc;
}

// query-variants of category pages are canonical'd to the base page, so dedupe them
const urls = [...new Set(pages(dist))].filter((u) => !u.includes('/404'));

const now = new Date().toISOString().split('T')[0];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE}${u}</loc><lastmod>${now}</lastmod></url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml — ${urls.length} urls`);

// ------------------------------------------------------------------ og.png
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b1b1d"/>
      <stop offset="1" stop-color="#0e0e10"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.2" r="0.9">
      <stop offset="0" stop-color="#f5b841" stop-opacity="0.25"/>
      <stop offset="0.6" stop-color="#f5b841" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="100" y="220" font-size="84" font-weight="bold" fill="#ffd99a" font-family="DejaVu Sans, sans-serif">Best-of Iran</text>
  <text x="100" y="320" font-size="52" fill="#e5e1e4" font-family="DejaVu Sans, sans-serif" direction="rtl" unicode-bidi="bidi-override">بهترین کسب‌وکارهای ایران</text>
  <text x="100" y="400" font-size="32" fill="#d4c4af" font-family="DejaVu Sans, sans-serif">بررسی میدانی • رتبه‌بندی شفاف • نظرات واقعی</text>
  <rect x="100" y="470" width="120" height="6" rx="3" fill="#f5b841"/>
</svg>`;

if (existsSync(join(dist, 'og.png'))) {
  console.log('✓ og.png already present — skipping');
} else {
  try {
    await sharp(Buffer.from(svg)).png().toFile(join(dist, 'og.png'));
    console.log('✓ og.png generated');
  } catch (e) {
    console.warn(`⚠ og.png skipped (${e.message.split('\n')[0]})`);
  }
}

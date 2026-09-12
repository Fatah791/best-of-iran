/**
 * Generates the OG image → public/og.png (committed artifact so it is
 * always served, and never part of the build race).
 *   node scripts/make-og.mjs
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dest = fileURLToPath(new URL('../public/og.png', import.meta.url));

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
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
  <text x="100" y="320" font-size="52" fill="#e5e1e4" font-family="DejaVu Sans, sans-serif">بهترین کسب‌وکارهای ایران</text>
  <text x="100" y="400" font-size="32" fill="#d4c4af" font-family="DejaVu Sans, sans-serif">بررسی میدانی • رتبه‌بندی شفاف • نظرات واقعی</text>
  <rect x="100" y="470" width="120" height="6" rx="3" fill="#f5b841"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(dest);
console.log(`✓ public/og.png ${existsSync(dest) ? 'written' : 'FAILED'}`);

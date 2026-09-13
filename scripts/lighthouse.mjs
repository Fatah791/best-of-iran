/**
 * Lighthouse CI runner: audits key pages and fails on perf regressions.
 *   node scripts/lighthouse.mjs            (all pages)
 *   node scripts/lighthouse.mjs /          (single path)
 * Requires Chrome/Edge installed; uses local `astro preview` if a
 * BASE_URL env is not provided.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const BASE = process.env.BASE_URL ?? 'http://localhost:4335';
const PAGES = process.argv[2] ? [process.argv[2]] : ['/', '/articles/best-car-wash-isfahan', '/cities/isfahan', '/register'];

const THRESHOLDS = {
  performance: 90,
  'cumulative-layout-shift': 0.05, // fraction via audit score proxy
  'total-blocking-time': 250, // ms
  'largest-contentful-paint': 2500, // ms
};

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

if (!existsSync('reports')) mkdirSync('reports');

const rows = [];
let failed = false;
for (const path of PAGES) {
  try {
    const result = await lighthouse(BASE + path, {
      port: chrome.port,
      output: 'json',
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2 },
      throttlingMethod: 'simulate',
    });
    const { lhr } = result;
    const perf = Math.round(lhr.categories.performance.score * 100);
    const m = lhr.audits;
    const row = {
      page: path,
      perf,
      lcp: m['largest-contentful-paint'].numericValue | 0,
      cls: +m['cumulative-layout-shift'].numericValue.toFixed(3),
      tbt: m['total-blocking-time'].numericValue | 0,
      weightKB: (lhr.audits['total-byte-weight'].numericValue / 1024) | 0,
    };
    rows.push(row);
    writeFileSync(`reports/lh-${path.replace(/\W/g, '_') || 'root'}.json`, JSON.stringify(lhr));

    if (perf < THRESHOLDS.performance || row.lcp > THRESHOLDS['largest-contentful-paint'] || row.cls > THRESHOLDS['cumulative-layout-shift'] || row.tbt > THRESHOLDS['total-blocking-time']) {
      failed = true;
      console.error(`✗ ${path} below thresholds`, row);
    }
  } catch (e) {
    failed = true;
    console.error(`✗ ${path}: ${e.message.split('\n')[0]}`);
  }
}

try {
  await chrome.kill();
} catch {
  /* Windows sometimes denies cleanup of chrome's temp dir — harmless */
}

console.table(rows);
console.log(failed ? '✗ Lighthouse: thresholds not met' : '✓ Lighthouse: all pages pass');
process.exit(failed ? 1 : 0);

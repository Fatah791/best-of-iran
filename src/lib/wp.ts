/**
 * WordPress REST client for headless builds.
 *
 * Reads the CMS at WP_API_URL (default: the origin server) and hands
 * normalized JSON to src/data/cms.ts. Every call is guarded by a hard
 * timeout + retries and a build-time memory cache; on total failure the
 * caller falls back to the static TS seeds — the site can never break
 * because the CMS is down.
 */

const WP_BASE = (process.env.WP_API_URL ?? 'http://143.20.60.33/wp-json').replace(/\/$/, '');
const TIMEOUT_MS = +(process.env.WP_TIMEOUT_MS ?? 8000);
const RETRIES = +(process.env.WP_RETRIES ?? 2);
const ENABLED = (process.env.WP_SOURCE ?? 'auto') !== 'off'; // 'off' forces local data

const cache = new Map<string, unknown>();

export interface WpTerm {
  id: number;
  name: string;
  slug: string;
  link?: string;
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string; protected?: boolean };
  featured_media?: number;
  acf?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  boi_city?: number[];
  boi_cat?: number[];
  _embedded?: {
    'https://api.w.org/featuredmedia'?: Array<{ id: number; source_url: string }>;
    'https://api.w.org/term'?: WpTerm[];
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
  } finally {
    clearTimeout(t);
  }
}

/** GET a WP REST path (e.g. '/wp/v2/business?per_page=50&_embed'). */
export async function wp<T>(path: string): Promise<T | null> {
  if (!ENABLED) return null;
  if (cache.has(path)) return cache.get(path) as T;
  const url = WP_BASE + path;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        // 404 = route genuinely missing (e.g. old mu-plugin) → don't retry
        if (res.status === 404) return null;
        throw new Error(`WP ${res.status} ${path}`);
      }
      const data = (await res.json()) as T;
      cache.set(path, data);
      return data;
    } catch {
      /* network flake / timeout — next attempt */
    }
  }
  console.warn(`[wp] unreachable: ${path} — falling back to local seed data`);
  return null;
}

/**
 * Parse Gutenberg block comments from post_content into our ArticleBlock
 * shapes. Editor blocks save `null`, so attributes live entirely in the
 * comment delimiter:  <!-- wp:boi/ranked {"title":…,"items":[…]} /-->
 */
const BLOCK_RE = /<!--\s+wp:(boi\/[\w-]+)\s+(\{[\s\S]*?\})?\s*\/-->/g;

export interface RawBlock {
  name: string; // 'boi/ranked'
  attrs: Record<string, unknown>;
}

export function parseBoiBlocks(rawContent: string | undefined): RawBlock[] {
  if (!rawContent) return [];
  const out: RawBlock[] = [];
  for (const m of rawContent.matchAll(BLOCK_RE)) {
    let attrs: Record<string, unknown> = {};
    if (m[2]) {
      try {
        attrs = JSON.parse(m[2]);
      } catch {
        continue; // malformed block comment → skip (never crash the build)
      }
    }
    out.push({ name: m[1], attrs });
  }
  return out;
}

/** Persian digits + calendar helpers (full ICU in Node). */
export function faDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const wpEnabled = () => ENABLED;

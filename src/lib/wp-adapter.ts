/**
 * CMS adapter: WordPress → the typed models the site already renders.
 *
 * This is the ONLY module pages should import data from (via src/data/cms.ts).
 * Every loader:
 *   1. tries WP (src/lib/wp.ts) — env WP_API_URL, default origin server,
 *   2. converts REST payloads into the exact TS shapes (Business,
 *      FullArticle, cities/categories from shared taxonomies),
 *   3. falls back to the static seed in src/data/* on any failure,
 *      so a dead CMS can never break a build.
 */
import { wp, wpEnabled, parseBoiBlocks, faDate, type WpPost, type WpTerm } from './wp';
import {
  businesses as seedBusinesses,
  byCity as seedByCity,
  byCategory as seedByCategory,
  getBusiness as seedGetBusiness,
  topTrending as seedTopTrending,
  type Business,
} from '../data/businesses';
import {
  getAllArticles as seedAllArticles,
  articlesBySlug as seedBySlug,
  type ArticleBlock,
  type FullArticle,
} from '../data/articles';
import { cities as seedCities, directoryCategories as seedCategories } from '../data/site';
import { citySeo as seedCitySeo, categorySeo as seedCategorySeo } from '../data/seo';

/**
 * Educational/long-form guides (WP plain `post`). Roundup/ranking pages
 * (e.g. «بهترین کارواش‌های اصفهان») are the `boi_ranking` CPT in the admin
 * and keep the structured FullArticle template — two content models, two
 * templates, never mixed:
 *   post        → /guides/<slug>    (prose layout, TOC from headings)
 *   boi_ranking → /articles/<slug>  (block layout — visual identity unchanged)
 */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  isoDate: string;
  author: string;
  readTime: string;
  html: string; // WP-rendered body, ids injected on h2/h3
  toc: { id: string; label: string; level: number }[];
  image?: string;
}

/** Site-level shapes (same as data/site.ts). */
export interface City { slug: string; label: string; }
export interface Category { slug: string; label: string; icon: string; }

/* ------------------------------------------------------------------ *
 * Term helpers (boi_city / boi_cat slugs are identical to the site's)
 * ------------------------------------------------------------------ */

function termsToCities(terms: WpTerm[]): City[] {
  return terms
    .filter((t) => t.slug !== 'uncategorized')
    .map((t) => ({ slug: t.slug, label: t.name }));
}

function termsToCategories(terms: WpTerm[]): Category[] {
  // icon comes from the site seed if the name matches; fallback to a generic one
  const iconFor = (slug: string) =>
    seedCategories.find((c) => c.slug === slug)?.icon ?? 'category';
  return terms
    .filter((t) => t.slug !== 'uncategorized')
    .map((t) => ({ slug: t.slug, label: t.name, icon: iconFor(t.slug) }));
}

async function loadTerms(restBase: string): Promise<WpTerm[] | null> {
  return wp<WpTerm[]>(`/wp/v2/${restBase}?per_page=100&orderby=name&order=asc`);
}

/* ------------------------------------------------------------------ *
 * Businesses
 * ------------------------------------------------------------------ */

/**
 * Meta lookup across mu-plugin naming generations:
 * boi-content-schema.php registers `biz_rating` / `seo_title`,
 * the older boi-core.php used `_boi_rating` / `_boi_seo_title`.
 */
function metaVal(p: WpPost, key: string): unknown {
  const m = (p.meta ?? {}) as Record<string, unknown>;
  if (key in m) return m[key];
  const alt = {
    biz_rating: '_boi_rating', biz_reviews: '_boi_reviews', biz_tagline: '_boi_tagline',
    biz_description: '_boi_description', biz_address: '_boi_address', biz_neighborhood: '_boi_neighborhood',
    biz_phone: '_boi_phone', biz_whatsapp: '_boi_whatsapp', biz_website: '_boi_website',
    biz_price_tier: '_boi_price_tier', biz_verified: '_boi_verified', biz_hours: '_boi_hours',
    biz_tags: '_boi_tags', biz_weekly_calls: '_boi_weekly_calls',
    seo_title: '_boi_seo_title', seo_description: '_boi_seo_description', seo_noindex: '_boi_noindex',
    read_time: '_boi_read_time', iso_date: '_boi_iso_date', author: '_boi_author',
  } as Record<string, string>;
  const k2 = alt[key];
  return k2 ? m[k2] : undefined;
}

function stripHtml(s: string | undefined): string {
  return (s ?? '').replace(/<[^>]*>/g, '').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).trim();
}

function toBusiness(p: BizTerms, cities: WpTerm[], cats: WpTerm[]): Business {
  const emb = p._embedded ?? {};
  const mv = (k: string) => metaVal(p, k);
  const termOf = (ids: number[], terms: WpTerm[]) =>
    terms.find((t) => ids.includes(t.id))?.slug ?? '';
  const tagsRaw = String(mv('biz_tags') ?? '');
  const reviewRaw = String(mv('biz_review') ?? '');
  const [rAuthor, rWhen, ...rText] = reviewRaw.split('|').map((s) => s.trim());

  return {
    slug: fixSlug(p.slug),
    name: stripHtml(p.title?.rendered) || p.slug,
    category: termOf(catIds(p), cats),
    city: termOf(cityIds(p), cities),
    tagline: String(mv('biz_tagline') ?? ''),
    description: String(mv('biz_description') ?? '') || stripHtml(p.excerpt?.rendered),
    address: String(mv('biz_address') ?? ''),
    neighborhood: String(mv('biz_neighborhood') ?? '') || undefined,
    phone: String(mv('biz_phone') ?? '') || undefined,
    whatsapp: String(mv('biz_whatsapp') ?? '') || undefined,
    website: String(mv('biz_website') ?? '') || undefined,
    rating: Number(mv('biz_rating') ?? 0),
    reviews: Number(mv('biz_reviews') ?? 0),
    priceTier: (['؜', '﷼', '﷼﷼'].includes(String(mv('biz_price_tier')))
      ? String(mv('biz_price_tier'))
      : '﷼') as Business['priceTier'],
    verified: mv('biz_verified') === '1' || mv('biz_verified') === 1 || mv('biz_verified') === true,
    hours: String(mv('biz_hours') ?? '') || undefined,
    tags: tagsRaw ? tagsRaw.split(/[،,]/).map((s) => s.trim()).filter(Boolean) : [],
    image: emb['https://api.w.org/featuredmedia']?.[0]?.source_url,
    weeklyCalls: Number(mv('biz_weekly_calls') ?? 0),
    review: rAuthor && rText.length
      ? { author: rAuthor, when: rWhen ?? '', text: rText.join('|').trim() }
      : undefined,
  };
}

/* ------------------------------------------------------------------ *
 * Articles (block parser: boi/<slug> attrs → ArticleBlock union)
 * ------------------------------------------------------------------ */

const BLOCK_MAP: Record<string, string> = {
  'boi/quick-answer': 'quickAnswer',
  'boi/educational': 'educational',
  'boi/tip': 'tip',
  'boi/cards': 'cards',
  'boi/prose': 'prose',
  'boi/ranked': 'ranked',
  'boi/comparison': 'comparison',
  'boi/methodology-note': 'methodologyNote',
  'boi/faq': 'faq',
};

function list(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
}
const str = (v: unknown) => String(v ?? '');
const num = (v: unknown) => Number(v ?? 0);
const bool = (v: unknown) => v === true || v === 1 || v === '1';

function toBlock(name: string, a: Record<string, unknown>): ArticleBlock | null {
  switch (BLOCK_MAP[name]) {
    case 'quickAnswer':
      return { type: 'quickAnswer', items: list(a.items).map((i) => ({ rank: num(i.rank), name: str(i.name), note: str(i.note) })) };
    case 'educational':
      return {
        type: 'educational',
        title: str(a.title),
        features: list(a.features).map((i) => ({ title: str(i.title), body: str(i.body) })),
        criteria: {
          panelTitle: str(a.panelTitle),
          items: list(a.criteria).map((i) => ({ label: str(i.label), percent: num(i.percent), note: str(i.note) })),
        },
      };
    case 'tip':
      return { type: 'tip', title: str(a.title), bodyHtml: str(a.body) };
    case 'cards':
      return { type: 'cards', title: str(a.title), items: list(a.items).map((i) => ({ title: str(i.title), body: str(i.body) })) };
    case 'prose': {
      const html = str(a.html);
      return html ? { type: 'prose', html } : null;
    }
    case 'ranked':
      return {
        type: 'ranked',
        title: str(a.title),
        items: list(a.items).map((i) => {
          const badges = str(i.badges).split(/[،,]/).map((s) => s.trim()).filter(Boolean)
            .map((label) => ({ label, tone: /بدون|ندارد|خطا|error/i.test(label) ? ('error' as const) : undefined }));
          const rv = str(i.review).split('|').map((s) => s.trim());
          return {
            rank: num(i.rank), name: str(i.name), tagline: str(i.tagline),
            rating: str(i.rating), reviews: str(i.reviews), badges,
            address: str(i.address), hours: str(i.hours), priceTier: str(i.priceTier),
            image: str(i.image) || undefined, phone: str(i.phone) || undefined,
            whatsapp: str(i.whatsapp) || undefined,
            editorPick: bool(i.editorPick) || undefined,
            review: rv.length >= 3 ? { author: rv[0], when: rv[1], text: rv.slice(2).join(' ') } : undefined,
          };
        }),
      };
    case 'comparison':
      return {
        type: 'comparison',
        title: str(a.title),
        columns: str(a.columns).split(/[،,]/).map((s) => s.trim()).filter(Boolean),
        rows: list(a.rows).map((i) => ({
          name: str(i.name), score: str(i.score), price: str(i.price),
          nano: bool(i.nano), lounge: bool(i.lounge),
        })),
      };
    case 'methodologyNote':
      return { type: 'methodologyNote', title: str(a.title), body: str(a.body) };
    case 'faq':
      return { type: 'faq', title: str(a.title), items: list(a.items).map((i) => ({ q: str(i.q), a: str(i.a) })) };
    default:
      return null; // unknown block → skip, never fail the build
  }
}

function toArticle(p: BizTerms, cities: WpTerm[], cats: WpTerm[]): FullArticle {
  const mv = (k: string) => metaVal(p, k);
  // Prefer the parsed `boi_blocks` REST field (mu-plugin v2); fall back to
  // scanning block comments in content.rendered (older schema).
  const raw = (p as { boi_blocks?: RawBlock[] }).boi_blocks;
  const parsed: RawBlock[] = Array.isArray(raw) && raw.length
    ? raw.map((b) => ({ name: b.name, attrs: (b.attrs ?? {}) as Record<string, unknown> }))
    : parseBoiBlocks(p.content?.rendered);
  const blocks = parsed
    .map((b) => toBlock(b.name, b.attrs))
    .filter((b): b is ArticleBlock => b !== null);
  const citySlug = cities.find((t) => cityIds(p).includes(t.id))?.slug;
  const catSlug = cats.find((t) => catIds(p).includes(t.id))?.slug;
  const toc = blocks
    .map((b) => ({ id: blockAnchor(b), label: blockTitle(b) }))
    .filter((t) => t.id);

  return {
    slug: fixSlug(p.slug),
    title: stripHtml(p.title?.rendered) || p.slug,
    h1: String(mv('seo_h1') ?? mv('_boi_seo_h1') ?? '') || stripHtml(p.title?.rendered) || p.slug,
    description: String(mv('seo_description') ?? '') || stripHtml(p.excerpt?.rendered),
    updated: faDate(p.modified || p.date),
    isoDate: (String(mv('iso_date') ?? '') || (p.date || '')).slice(0, 10) || new Date().toISOString().slice(0, 10),
    author: String(mv('author') ?? 'تیم تحریریه Best-of Iran'),
    readTime: String(mv('read_time') ?? '') || '۵ دقیقه',
    breadcrumb: [
      { label: 'خانه', href: '/' },
      ...(citySlug ? [{ label: cities.find((c) => c.slug === citySlug)?.name ?? citySlug, href: `/cities/${citySlug}` }] : []),
      ...(catSlug ? [{ label: cats.find((c) => c.slug === catSlug)?.name ?? catSlug, href: `/categories/${catSlug}` }] : []),
    ],
    toc,
    blocks,
    related: [],
  };
}

/* ------------------------------------------------------------------ *
 * Guide (educational post) parser: WP body → prose HTML + TOC
 * ------------------------------------------------------------------ */

/** slugify for heading ids keeps Persian letters (URL fragment-safe enough). */
function headingId(text: string, i: number): string {
  const base = stripHtml(text)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48);
  return (base || `h-${i + 1}`).toLowerCase();
}

function toGuide(p: WpPost): Guide | null {
  const mv = (k: string) => metaVal(p, k);
  const html = (p.content?.rendered ?? '').trim();
  if (!html) return null;
  const toc: Guide['toc'] = [];
  let hi = 0;
  const withIds = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (_all, lvl, attrs, inner) => {
    const id = /id="/.test(attrs) ? attrs.match(/id="([^"]+)"/)![1] : headingId(String(inner), hi);
    hi += 1;
    toc.push({ id, label: stripHtml(String(inner)), level: Number(lvl) });
    return `<h${lvl} id="${id}"${attrs}>${inner}</h${lvl}>`;
  });
  const media = p._embedded?.['https://api.w.org/featuredmedia']?.[0]?.source_url;
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(2, Math.round(words / 220));
  return {
    slug: fixSlug(p.slug),
    title: stripHtml(p.title?.rendered) || p.slug,
    description: String(mv('seo_description') ?? '') || stripHtml(p.excerpt?.rendered).trim(),
    updated: faDate(p.modified || p.date),
    isoDate: (String(mv('iso_date') ?? '') || (p.date || '')).slice(0, 10) || new Date().toISOString().slice(0, 10),
    author: String(mv('author') ?? 'تیم تحریریه Best-of Iran'),
    readTime: String(mv('read_time') ?? '') || `${'۰۱۲۳۴۵۶۷۸۹'[Math.floor(mins / 10)] ?? ''}${'۰۱۲۳۴۵۶۷۸۹'[mins % 10]} دقیقه`,
    html: withIds,
    toc,
    image: media,
  };
}

function blockAnchor(b: ArticleBlock): string {
  if (b.type === 'prose' || b.type === 'tip' || b.type === 'cards') return '';
  return {
    quickAnswer: 'quick-answer', educational: 'educational', ranked: 'ranked-list',
    comparison: 'comparison', methodologyNote: 'methodology', faq: 'faq',
  }[b.type] ?? '';
}
function blockTitle(b: ArticleBlock): string {
  if ('title' in b && typeof b.title === 'string' && b.title) return b.title;
  return { quickAnswer: 'پاسخ سریع', cards: 'نکات کلیدی' }[b.type] ?? '';
}

/* ------------------------------------------------------------------ *
 * Public loader API (called once per build, memoized)
 * ------------------------------------------------------------------ */

interface Cms {
  source: 'wp' | 'seed';
  businesses: Business[];
  articles: FullArticle[];
  guides: Guide[];
  cities: City[];
  categories: Category[];
  citySeo: typeof seedCitySeo;
  categorySeo: typeof seedCategorySeo;
}

/** Taxonomy field may arrive as boi_city (new) or city/category_boi (old mu-plugin). */
type BizTerms = WpPost & { city?: number[]; category_boi?: number[] };

function cityIds(p: BizTerms): number[] {
  return p.boi_city ?? p.city ?? [];
}

/** WP stores non-ASCII slugs percent-encoded; Astro can't build a route from
 *  '%d9%be…'. Decode once at the adapter boundary so paths are clean unicode. */
function fixSlug(slug: string): string {
  if (!slug) return slug;
  try { return /%[0-9a-f]{2}/i.test(slug) ? decodeURIComponent(slug) : slug; }
  catch { return slug; }
}
function catIds(p: BizTerms): number[] {
  return (p as { boi_cat?: number[] }).boi_cat ?? p.category_boi ?? [];
}

let memo: Promise<Cms> | null = null;

async function build(): Promise<Cms> {
  if (!wpEnabled()) return fallback('off');

  const [bizPosts, rankingPosts, postList, cityTerms, catTerms] = await Promise.all([
    wp<WpPost[]>('/wp/v2/business?per_page=100&_embed'),
    wp<WpPost[]>('/wp/v2/boi_ranking?per_page=100&_embed'), // roundup/ranking articles
    wp<WpPost[]>('/wp/v2/posts?per_page=100&_embed'),       // educational guides
    loadTerms('boi_city'),
    loadTerms('boi_cat'),
  ]);

  // WP answered at least the posts route → treat as live source
  const live = Boolean(bizPosts || rankingPosts || postList || cityTerms || catTerms);
  if (!live) return fallback('unreachable');

  const cities = termsToCities(cityTerms ?? []);
  const cats = termsToCategories(catTerms ?? []);

  // full content per article (content only ships on single requests).
  // Articles publish if they have structured boi blocks OR real prose
  // (plain Gutenberg paragraphs count — the block set is an enhancement,
  // not a gate). The default 'hello-world' (short + no categories) is junk.
  const articles: FullArticle[] = [];
  for (const p of rankingPosts ?? []) {
    const full = await wp<WpPost>(`/wp/v2/boi_ranking/${p.id}?_embed`);
    const a = toArticle(full ?? p, cityTerms ?? [], catTerms ?? []);
    const html = (full ?? p).content?.rendered ?? '';
    const isJunk =
      p.slug === 'hello-world' ||
      (a.blocks.length === 0 && !/<p[^>]*>.{40,}/s.test(html));
    if (!isJunk) articles.push(a);
  }

  // Guides: plain WP posts (educational long-form). hello-world is junk.
  const guides: Guide[] = [];
  for (const p of postList ?? []) {
    if (p.slug === 'hello-world') continue;
    const full = await wp<WpPost>(`/wp/v2/posts/${p.id}?_embed`);
    const g = toGuide(full ?? p);
    if (g && g.html.length) guides.push(g);
  }

  const businesses = (bizPosts ?? []).map((p) => toBusiness(p, cityTerms ?? [], catTerms ?? []));

  console.log(
    `[cms] WP source: ${businesses.length} businesses, ${articles.length} articles, ` +
    `${guides.length} guides, ${cities.length} cities, ${cats.length} categories`,
  );
  return {
    source: 'wp',
    businesses: businesses.length ? businesses : seedBusinesses,
    articles: articles.length ? articles : seedAllArticles(),
    guides,
    cities: cities.length ? cities : seedCities,
    categories: cats.length ? cats : seedCategories,
    citySeo: seedCitySeo,     // SEO copy stays in TS for now (editorial-controlled)
    categorySeo: seedCategorySeo,
  };
}

function fallback(reason: string): Cms {
  console.warn(`[cms] using local seed data (${reason})`);
  return {
    source: 'seed',
    businesses: seedBusinesses,
    articles: seedAllArticles(),
    guides: [],
    cities: seedCities,
    categories: seedCategories,
    citySeo: seedCitySeo,
    categorySeo: seedCategorySeo,
  };
}

/** One promise per build — every page awaits the same load. */
export function cms(): Promise<Cms> {
  memo ??= build();
  return memo;
}

/* Convenience accessors mirroring the old data-module helpers ---------- */

export async function allBusinesses() { return (await cms()).businesses; }
export async function allArticles() { return (await cms()).articles; }
export async function allGuides() { return (await cms()).guides; }
export async function allCities() { return (await cms()).cities; }
export async function allCategories() { return (await cms()).categories; }

export async function byCity(slug: string): Promise<Business[]> {
  const { source, businesses } = await cms();
  return source === 'seed' ? seedByCity(slug)
    : businesses.filter((b) => b.city === slug).sort((a, b) => b.rating - a.rating);
}

export async function byCategory(slug: string): Promise<Business[]> {
  const { source, businesses } = await cms();
  return source === 'seed' ? seedByCategory(slug)
    : businesses.filter((b) => b.category === slug).sort((a, b) => b.rating - a.rating);
}

export async function getBusiness(slug: string): Promise<Business | undefined> {
  const { source, businesses } = await cms();
  return source === 'seed' ? seedGetBusiness(slug) : businesses.find((b) => b.slug === slug);
}

export async function articleBySlug(slug: string): Promise<FullArticle | undefined> {
  const { source, articles } = await cms();
  if (source === 'seed') return seedBySlug[slug];
  return articles.find((a) => a.slug === slug);
}

export async function topTrending(limit = 10): Promise<Business[]> {
  const { source, businesses } = await cms();
  return source === 'seed' ? seedTopTrending(limit)
    : [...businesses].sort((a, b) => (b.weeklyCalls ?? 0) - (a.weeklyCalls ?? 0)).slice(0, limit);
}

/** Card lists (home /articles) link out only for slugs that exist in the CMS. */
export async function articleExists(slug: string): Promise<boolean> {
  const { articles } = await cms();
  return articles.some((a) => a.slug === slug);
}

export async function guideBySlug(slug: string): Promise<Guide | undefined> {
  return (await cms()).guides.find((g) => g.slug === slug);
}

/** Homepage 'latest articles' cards, derived from CMS articles + seed list. */
export async function articleCards(): Promise<
  Array<{ slug: string; title: string; excerpt: string; category: string; city: string; date: string }>
> {
  const { source, articles, cities, categories } = await cms();
  if (source === 'seed') return seedCards();
  return articles.map((a) => {
    const city = a.breadcrumb.find((c) => c.href.startsWith('/cities/'));
    const cat = a.breadcrumb.find((c) => c.href.startsWith('/categories/'));
    return {
      slug: a.slug,
      title: a.title,
      excerpt: a.description,
      category: cat ? (categories.find((c) => c.slug === cat.href.split('/').pop())?.label ?? '') : '',
      city: city ? (cities.find((c) => c.slug === city.href.split('/').pop())?.label ?? '') : '',
      date: a.updated,
    };
  });
}

async function seedCards() {
  const { latestArticles } = await import('../data/content');
  return latestArticles;
}

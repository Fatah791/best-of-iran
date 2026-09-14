/**
 * Exports the current static TS content into wp-seed.json so the WordPress
 * side can be seeded to exactly match the frontend (businesses, cities,
 * categories, articles as boi blocks). Run: node scripts/export-seed.mjs
 */
import { writeFileSync } from 'node:fs';

const { businesses } = await import('../src/data/businesses.ts');
const { getAllArticles } = await import('../src/data/articles.ts');
const { cities, categories, directoryCategories } = await import('../src/data/site.ts');
const { citySeo, categorySeo } = await import('../src/data/seo.ts');

const BLOCK_SLUG = {
  quickAnswer: 'quick-answer', educational: 'educational', tip: 'tip', cards: 'cards',
  prose: 'prose', ranked: 'ranked', comparison: 'comparison',
  methodologyNote: 'methodology-note', faq: 'faq',
};

const articles = getAllArticles().map((a) => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.description,
  city: a.breadcrumb.find((c) => c.href.startsWith('/cities/'))?.href.split('/').pop() ?? null,
  category: a.breadcrumb.find((c) => c.href.startsWith('/categories/'))?.href.split('/').pop() ?? null,
  isoDate: a.isoDate,
  readTime: a.readTime,
  author: a.author,
  seoTitle: a.title,
  seoDescription: a.description,
  blocks: a.blocks.map((b) => {
    const { type, ...attrs } = b;
    // ranked items carry badge objects + review objects; flatten like the editor UI does
    if (type === 'ranked') {
      attrs.items = b.items.map((i) => ({
        ...i,
        badges: (i.badges ?? []).map((x) => x.label).join(','),
        review: i.review ? `${i.review.author}|${i.review.when}|${i.review.text}` : '',
        editorPick: i.editorPick ? '1' : '',
      }));
    }
    if (type === 'comparison') {
      attrs.columns = b.columns.join(',');
      attrs.rows = b.rows.map((r) => ({ ...r, nano: r.nano ? '1' : '0', lounge: r.lounge ? '1' : '0' }));
    }
    return { name: BLOCK_SLUG[type] ?? type, attrs };
  }),
}));

const out = {
  generatedFrom: 'src/data (seed content)',
  cities,
  categories: directoryCategories.filter((c) => categories.some((x) => x.slug === c.slug) || true),
  businesses,
  articles,
  citySeo,
  categorySeo,
};
writeFileSync('wp-seed.json', JSON.stringify(out, null, 1));
console.log(
  `✓ wp-seed.json — ${businesses.length} businesses, ${articles.length} articles, ` +
  `${cities.length} cities, ${out.categories.length} categories`,
);

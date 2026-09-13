/**
 * Breadcrumb helper: builds [{label, href?}] from a business/city/category
 * context so every entity page renders visible breadcrumbs AND the
 * BreadcrumbList JSON-LD from one source (kept in sync for ranking checks).
 */
import type { Business } from '../data/businesses';
import { cities, categories } from '../data/site';

export function businessCrumbs(business: Business) {
  const city = cities.find((c) => c.slug === business.city);
  const category = categories.find((c) => c.slug === business.category);
  return [
    ...(city ? [{ label: city.label, href: `/cities/${city.slug}` }] : []),
    ...(category ? [{ label: category.label, href: `/categories/${category.slug}` }] : []),
    { label: business.name },
  ];
}

/**
 * schema.org JSON-LD builders. Every page composes its structured data
 * from here so formats stay consistent and verifiable.
 */
import { site } from '../data/site';
import type { Business } from '../data/businesses';

const abs = (href: string) => new URL(href, site.url).href;

export function breadcrumbLd(
  crumbs: { label: string; href?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: site.url },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.label,
        ...(c.href ? { item: abs(c.href) } : {}),
      })),
    ],
  };
}

export function itemListLd(
  title: string,
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  };
}

export function localBusinessLd(b: Business, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    description: b.description,
    image: b.image ? abs(b.image) : undefined,
    telephone: b.phone,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressCountry: 'IR',
    },
    hasMap: `https://map.norimaps.com/?q=${encodeURIComponent(b.address)}`,
    ...(b.hours
      ? {
          // free-text openingHours; structured spec added when data has it
          openingHours: b.hours,
        }
      : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: b.rating,
      reviewCount: b.reviews,
      bestRating: 5,
      worstRating: 0,
    },
    ...(b.review
      ? {
          review: {
            '@type': 'Review',
            author: b.review.author,
            datePublished: b.review.when,
            reviewBody: b.review.text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: b.rating,
              bestRating: 5,
            },
          },
        }
      : {}),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * Image registry: maps /images/<file> paths (as stored in data files) to
 * Astro ImageMetadata so <Picture> can generate AVIF/WebP/JPEG srcsets.
 * New business/article images dropped in src/assets/images/ are picked up
 * automatically.
 */
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

const registry = new Map<string, ImageMetadata>();
for (const [key, meta] of Object.entries(modules)) {
  // './images/foo.jpg' -> '/images/foo.jpg' (matches the data string)
  registry.set(key.replace(/^\.\//, '/'), meta);
}

export function resolveImage(path?: string): ImageMetadata | undefined {
  return path ? registry.get(path) : undefined;
}

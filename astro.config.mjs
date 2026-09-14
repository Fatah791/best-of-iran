import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://best-of-iran.pages.dev',
  trailingSlash: 'never',
  build: {
    // Inline small page-CSS (auto = only stylesheets used by ONE page)
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

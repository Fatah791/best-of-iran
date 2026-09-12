import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://best-of-iran.vercel.app',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
});

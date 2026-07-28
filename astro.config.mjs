import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://lystrosaurus.github.io',
  integrations: [mdx()],

  output: 'static',
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },
});

// 静态托管专用配置（GitHub Pages / Vercel）。
// 不含 Cloudflare adapter，产出平铺 HTML（dist-static/），
// 供不支持 SSR 的静态托管平台使用。Cloudflare 部署仍用 astro.config.mjs（带 adapter）。
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://lystrosaurus.github.io',
  integrations: [mdx()],
  output: 'static',
  outDir: './dist-static',
  vite: {
    plugins: [tailwindcss()],
  },
});

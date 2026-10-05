import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployed to GitHub Pages as a project site. Override with SITE / BASE for other hosts.
const site = process.env.SITE ?? 'https://suramya12.github.io';
const base = process.env.BASE ?? '/Claude_Repo-1';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});

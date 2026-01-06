// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://portfolio-b96939.pages.unicaen.fr',
	base: '/portfolio',
	integrations: [mdx(), sitemap()],
	outDir: 'public',
  	publicDir: 'static',
});

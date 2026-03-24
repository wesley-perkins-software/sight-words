import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'node_modules', '@astrojs', 'sitemap', 'dist', 'index.js');

if (!fs.existsSync(target)) {
  console.warn('[postinstall] @astrojs/sitemap not found, skipping compatibility patch.');
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');
const needle = 'const routeUrls = _routes.reduce((urls, r) => {';
const replacement = 'const routeUrls = (_routes ?? []).reduce((urls, r) => {';

if (source.includes(replacement)) {
  console.log('[postinstall] @astrojs/sitemap compatibility patch already applied.');
  process.exit(0);
}

if (!source.includes(needle)) {
  console.warn('[postinstall] Expected @astrojs/sitemap source pattern not found, skipping patch.');
  process.exit(0);
}

fs.writeFileSync(target, source.replace(needle, replacement), 'utf8');
console.log('[postinstall] Applied @astrojs/sitemap compatibility patch for Astro routes hook fallback.');

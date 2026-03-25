import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');
const preferredSource = path.join(distDir, 'sitemap-0.xml');
const fallbackSource = path.join(distDir, 'sitemap-index.xml');
const target = path.join(distDir, 'sitemap.xml');

if (!fs.existsSync(distDir)) {
  console.warn('[postbuild] dist directory not found, skipping sitemap.xml normalization.');
  process.exit(0);
}

if (fs.existsSync(preferredSource)) {
  fs.copyFileSync(preferredSource, target);
  console.log('[postbuild] Copied sitemap-0.xml to sitemap.xml.');
  process.exit(0);
}

if (fs.existsSync(fallbackSource)) {
  fs.copyFileSync(fallbackSource, target);
  console.log('[postbuild] Copied sitemap-index.xml to sitemap.xml (fallback).');
  process.exit(0);
}

console.warn('[postbuild] No sitemap output found to copy into sitemap.xml.');

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getHtmlEntries() {
  const pages = {
    main: resolve(__dirname, 'FRONTEND/index.html')
  };
  
  const stitchDir = resolve(__dirname, 'FRONTEND/stitch');
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = resolve(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.html')) {
        const relativePath = path.relative(resolve(__dirname, 'FRONTEND'), fullPath);
        const name = relativePath.replace('.html', '');
        pages[name] = fullPath;
      }
    }
  }
  
  walk(stitchDir);
  return pages;
}

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlEntries()
    }
  },
  publicDir: 'FRONTEND/public'
});

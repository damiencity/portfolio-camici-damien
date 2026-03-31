import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

/** CJS build : le .mjs du package utilise `require` et casse sous chargement ESM pur (projet "type": "module"). */
const require = createRequire(import.meta.url);
const vitePrerender = require('vite-plugin-prerender');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyze = process.env.ANALYZE === '1';
/** Puppeteer (vite-plugin-prerender) n’a pas Chromium + libs système sur le builder Vercel → build cassé. */
const enablePrerender = process.env.VERCEL !== '1';

export default defineConfig({
  plugins: [
    react(),
    analyze &&
      visualizer({
        filename: path.join(__dirname, 'dist/stats.html'),
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
        open: false,
      }),
    enablePrerender &&
      vitePrerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: ['/'],
      }),
  ].filter(Boolean),
  server: {
    host: true,
    port: 5176,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['gsap', 'motion'],
        },
      },
    },
  },
});

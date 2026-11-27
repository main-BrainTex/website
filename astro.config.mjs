// @ts-check
import { defineConfig } from 'astro/config';

// BASE_PATH: '/website/' per l'anteprima su GitHub Pages, '/' alla radice di www.braintex.it.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://www.braintex.it',
  base,
  // URL senza slash finale e file .html (es. /privacypolicy-braintex), come sul sito attuale.
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'never',
  },
  compressHTML: true,
});

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
  markdown: { syntaxHighlight: false },
  // CSP generata da Astro (meta tag con hash degli script/stili inline).
  // Niente attributi style="" nel markup: la policy non li consente.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "connect-src 'self' https://api.web3forms.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://www.googletagmanager.com'],
      },
    },
  },
});

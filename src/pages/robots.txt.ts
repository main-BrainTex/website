// robots.txt: apre il sito solo nella build di produzione; l'anteprima blocca tutto.
import type { APIRoute } from 'astro';
import { IS_PRODUCTION, SITE } from '../config';

export const GET: APIRoute = () => {
  const body = IS_PRODUCTION
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

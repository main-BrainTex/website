// sitemap.xml generata dall'elenco delle rotte: si aggiorna da sola quando si aggiunge una pagina.
import type { APIRoute } from 'astro';
import { canonical, LANGS, ROUTES, type RouteKey } from '../i18n';

export const GET: APIRoute = () => {
  const urls = (Object.keys(ROUTES) as RouteKey[]).flatMap((key) =>
    LANGS.map((lang) => {
      const alternates = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${canonical(key, l)}"/>`,
      ).join('\n');
      return `  <url>\n    <loc>${canonical(key, lang)}</loc>\n${alternates}\n  </url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

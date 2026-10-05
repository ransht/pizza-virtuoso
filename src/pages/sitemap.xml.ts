import type { APIRoute } from 'astro';

// Every indexable page exists in both languages; each entry lists its full hreflang set.
const localizedPaths = ['/', '/accessibility/'];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin || 'https://pizzavirtuoso.co.il';
  const urls = localizedPaths.flatMap((path) => ['he', 'en'].map((lang) => {
    return `  <url>\n    <loc>${origin}/${lang}${path}</loc>\n    <xhtml:link rel="alternate" hreflang="he-IL" href="${origin}/he${path}" />\n    <xhtml:link rel="alternate" hreflang="en" href="${origin}/en${path}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/he${path}" />\n  </url>`;
  })).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

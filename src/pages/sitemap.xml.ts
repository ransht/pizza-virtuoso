import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin || 'https://pizzavirtuoso.co.il';
  const homeUrls = ['/he/', '/en/'].map((path) => {
    return `  <url>\n    <loc>${origin}${path}</loc>\n    <xhtml:link rel="alternate" hreflang="he-IL" href="${origin}/he/" />\n    <xhtml:link rel="alternate" hreflang="en" href="${origin}/en/" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/he/" />\n  </url>`;
  }).join('\n');
  const utilityUrls = ['/he/accessibility/', '/en/accessibility/'].map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${homeUrls}\n${utilityUrls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

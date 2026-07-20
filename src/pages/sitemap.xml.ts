import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin || 'https://pizza-virtuoso.example';
  const updated = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/he/', '/en/'].map((path) => `  <url><loc>${origin}${path}</loc><lastmod>${updated}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

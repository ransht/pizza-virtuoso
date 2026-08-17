import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (path) => readFileSync(path, 'utf8');
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

assert(existsSync(dist), 'dist/ is missing; run pnpm build first.');
if (existsSync(dist)) walk(dist);

for (const file of htmlFiles) {
  const html = read(file);
  const name = relative(dist, file).replaceAll('\\', '/');
  const isHome = name === 'he/index.html' || name === 'en/index.html';
  const isRedirectOrError = name === 'index.html' || name === '404.html';
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!isRedirectOrError) assert(h1Count === 1, `${name}: expected one H1, found ${h1Count}.`);
  if (name !== '404.html') assert((html.match(/rel="canonical"/g) || []).length === 1, `${name}: expected one canonical link.`);
  if (isHome) {
    assert(!/<meta name="robots" content="[^"]*noindex/i.test(html), `${name}: homepage is noindex.`);
    assert(/<meta name="description" content="[^"].+?"/.test(html), `${name}: missing meta description.`);
    assert(/hreflang="he-IL"/.test(html) && /hreflang="en"/.test(html) && /hreflang="x-default"/.test(html), `${name}: incomplete hreflang set.`);
    assert(/03-9504888/.test(html) && /ז׳בוטינסקי 16|16 Jabotinsky/.test(html), `${name}: NAP details are not visible.`);
  }

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    assert(/\balt="[^"]*"/.test(tag), `${name}: image missing alt attribute.`);
    assert(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${name}: image missing intrinsic dimensions.`);
  }

  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const serialized = JSON.stringify(data);
      assert(!serialized.includes('aggregateRating') && !serialized.includes('"Review"'), `${name}: prohibited review/rating schema found.`);
      if (isHome) {
        const types = (data['@graph'] || []).map((item) => item['@type']);
        assert(types.includes('Restaurant') && types.includes('WebSite'), `${name}: Restaurant or WebSite schema missing.`);
      }
    } catch {
      errors.push(`${name}: invalid JSON-LD.`);
    }
  }

  for (const [, href] of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    if (href.startsWith('//')) continue;
    const target = href.endsWith('/') ? join(dist, href, 'index.html') : join(dist, href);
    assert(existsSync(target), `${name}: broken internal link ${href}.`);
  }
}

if (existsSync(join(dist, 'sitemap.xml'))) {
  const sitemap = read(join(dist, 'sitemap.xml'));
  assert(!sitemap.includes('<loc>https://pizzavirtuoso.co.il/</loc>'), 'sitemap includes the redirecting root URL.');
  assert(sitemap.includes('/he/</loc>') && sitemap.includes('/en/</loc>'), 'sitemap is missing a language homepage.');
  assert(sitemap.includes('hreflang="he-IL"') && sitemap.includes('hreflang="x-default"'), 'sitemap language annotations are incomplete.');
} else errors.push('sitemap.xml is missing.');

if (existsSync(join(dist, 'robots.txt'))) {
  const robots = read(join(dist, 'robots.txt'));
  assert(robots.includes('Allow: /') && robots.includes('https://pizzavirtuoso.co.il/sitemap.xml'), 'robots.txt is incomplete.');
} else errors.push('robots.txt is missing.');

if (errors.length) {
  console.error(`SEO validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${htmlFiles.length} generated HTML pages.`);

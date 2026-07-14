# Pizza Virtuoso Static Website

Premium Hebrew RTL marketing website for Pizza Virtuoso in Rishon LeZion. It is a static, SEO-first site built with semantic HTML, modular CSS, and vanilla JavaScript ES modules. There is no cart, checkout, backend, database, or required build process.

## Structure

- `index.html` - primary Hebrew SEO page with crawlable content.
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest` - deployment support.
- `assets/css/` - reset, tokens, base, layout, components, animations, utilities, print.
- `assets/js/` - configuration, navigation, menu navigation, animation, analytics, accessibility modules.
- `assets/images/` - local logo, hero, menu, gallery, and placeholder assets.
- `locales/` - future multilingual preparation only; the live page does not depend on JSON.

## Local Development

Run from this folder with any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

Upload the `pizza-virtuoso/` folder to GitHub Pages, Cloudflare Pages, Netlify, Vercel static hosting, or any regular web server. The current canonical URL is configured for `https://ransht.github.io/pizza-virtuoso/`.

## Updating Business Data

Phone numbers, WhatsApp number, address, kosher text, and ordering URL are centralized in `assets/js/config.js` for JavaScript enhancements. The same verified business information also appears in visible HTML and JSON-LD for SEO. When prices or business details change, update both visible HTML and structured data where relevant.

Google Analytics 4 is supported through `googleAnalyticsMeasurementId` in `assets/js/config.js`. Set it to the real measurement ID, such as `G-XXXXXXXXXX`, to enable tracking on the published site. It stays disabled on localhost.

## Menu Prices

Edit the menu cards in `index.html`. Keep descriptions natural and avoid inventing offers, fake urgency, ratings, or delivery areas.

## Images

Replace generated placeholder images with real business photography when available. Recommended sizes:

- Hero desktop: about 1920 x 1200.
- Hero mobile: about 900 x 1200.
- Menu cards: about 800 x 600.
- Gallery landscape: about 1200 x 800.
- Gallery portrait: about 800 x 1100.
- Open Graph: 1200 x 630.

Use descriptive filenames, keep width and height attributes accurate, and add Hebrew alt text for meaningful images.

## Opening Hours

Do not publish guessed hours. After verifying hours, add them to the contact section and JSON-LD `openingHoursSpecification`.

## Social Links

Instagram and TikTok are intentionally not linked until official URLs are verified. Add them in the footer only when confirmed.

## Analytics and Pixels

`assets/js/analytics.js` provides a tiny event abstraction and logs only on localhost. Add Google Analytics or Meta Pixel later only after IDs and consent requirements are confirmed.

## English Version

Create a dedicated static `/en/` page when English content is ready. Set `<html lang="en" dir="ltr">`, translate visible content, add `hreflang` links, and avoid browser-language auto redirects.

## SEO, Accessibility, Responsive QA

Validate title, meta description, canonical, Open Graph, one `h1`, crawlable menu content, phone links, JSON-LD syntax, and sitemap. Test keyboard navigation, Escape menu close, focus styles, contrast, reduced motion, and screen widths from 320px through 1920px. Confirm no horizontal overflow.

## Security

External new-tab links use `rel="noopener noreferrer"`. No cookies or third-party tracking scripts are included. A strict deployment CSP can start with:

```http
Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none';
```

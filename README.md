# Pizza Virtuoso — official homepage

A static, bilingual Astro website for Pizza Virtuoso. Hebrew is the default at `/he/`; English lives at `/en/`. The site renders without a server and keeps business content outside UI components.

## Local development

Requirements: Node.js 22.12+.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Set `PUBLIC_SITE_URL` to the production origin before building so canonical, hreflang, sitemap, robots and sharing links use the real domain. Set `PUBLIC_ORDER_URL` when the external ordering system is ready. With no ordering URL, the interface shows a disabled “coming soon” state and emits no `OrderAction` schema.

### Live Google reviews

The reviews section uses Places API (New) through `functions/api/reviews.ts`, keeping the API key out of browser code. On Cloudflare Pages, enable Places API (New) and add `GOOGLE_PLACES_API_KEY` as an encrypted environment variable. `GOOGLE_PLACE_ID` is optional but recommended; without it, the endpoint identifies the business by its exact name and address.

The static site remains usable without the function and links directly to the Google Business Profile. GitHub Pages cannot execute the reviews function, so live reviews require Cloudflare Pages or another host with an equivalent serverless endpoint.

## Updating the site

- **Business details:** edit `src/content/business/config.json`. Empty fields are intentionally omitted from structured data and shown as pending in the UI. Do not add ratings, hours, certifications or links until verified.
- **Copy:** edit `src/i18n/he.json` and `src/i18n/en.json`. UI components should contain keys and structure only, not business copy.
- **Menu:** add records to the relevant category in `src/content/menu/menu.json`. Each item has a stable `id`, a presentation `kind`, and a `prices` array whose labels can represent sizes or a unit price. Add the matching translated name and description under `menu.items` in both language dictionaries.
- **Online ordering:** set `PUBLIC_ORDER_URL` in the deployment environment, or set `orderUrl` in `src/content/business/config.json`.
- **Photos:** replace `public/images/hero-pizza.webp`, `public/images/dough-story.webp` and `public/images/og-pizza.jpg` while preserving the filenames, dimensions/aspect ratios and descriptive alt translations. Current imagery is AI-generated production placeholder material, clearly disclosed in the footer.
- **Analytics:** set `PUBLIC_GA_MEASUREMENT_ID` to the GA4 Measurement ID (`G-...`). The Google tag loads only after the visitor accepts the bilingual analytics consent prompt. `analyticsId` in the business config is available as a fallback.

## Adding a language

1. Copy `src/i18n/en.json` to a new locale file and translate every key.
2. Add the locale to `languages` and `dictionaries` in `src/lib/i18n.ts`.
3. Extend `direction()` and `locale()` if the language direction or Open Graph locale differs.
4. Add the new `hreflang` entry in `src/layouts/BaseLayout.astro` and extend the language switcher if more than two languages are active.

No component restructuring is needed because language pages are generated from the shared route `src/pages/[lang]/index.astro`.

## Deployment

`npm run build` produces the static site in `dist/`. Publish that directory to Cloudflare Pages, GitHub Pages or any static host. On GitHub Pages under a repository subpath, set Astro's `base` option in `astro.config.mjs` to the repository name. Configure `PUBLIC_SITE_URL` to the final public origin in CI.

Before launch, replace every empty business field, verify all outbound links, replace the placeholder domain, and run browser/Lighthouse checks against the production build.

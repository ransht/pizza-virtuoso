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

Set `PUBLIC_SITE_URL` to the production origin before building so canonical, hreflang, sitemap, robots and sharing links use the real domain. Set `PUBLIC_ORDER_URL` when the external ordering system is ready. Every order button is built by `src/lib/order.ts`, so they all lead to the same destination.

## Updating the site

- **Business details:** edit `src/content/business/config.json`. Empty fields are intentionally omitted from structured data and shown as pending in the UI. Do not add ratings, hours, certifications or links until verified.
- **Copy:** edit `src/i18n/he.json` and `src/i18n/en.json`. UI components should contain keys and structure only, not business copy.
- **Menu:** add records to the relevant category in `src/content/menu/menu.json`. Each item has a stable `id`, a presentation `kind`, and a `prices` array whose labels can represent sizes or a unit price. Add the matching translated name and description under `menu.items` in both language dictionaries.
- **Online ordering:** set `PUBLIC_ORDER_URL` in the deployment environment, or set `orderUrl` in `src/content/business/config.json`.
- **Opening hours:** edit only `openingHours` (and `specialOpeningHours` for holidays or one-off days) in `src/content/business/config.json`. The hours table, the "open now" badge, the FAQ answer and the structured data are all generated from it by `src/lib/hours.ts`; the entry format, including a Saturday-night slot with a note, is documented at the top of that file. Dictionary strings refer to business facts with tokens such as `{hours}`, `{phone}` and `{coupon}` (see `src/lib/i18n.ts`) instead of repeating them.
- **Direct-order coupon:** `directOrderCoupon` in the business config drives every mention of the code and the percentage, and is appended to every order link as `?coupon=`.
- **Deals:** add entries to `src/content/deals/deals.json`; the "deals" section and its header link appear once the list is not empty. Entry format: `{ "id": "family", "name": { "he": "…", "en": "…" }, "includes": { "he": "…", "en": "…" }, "price": 0, "regularPrice": 0, "orderPath": "/" }`. `regularPrice` is optional and shows the saving; `orderPath` is the place in the ordering system the button opens.
- **Photo gallery:** add real photos of the food and the shop to `src/content/gallery/photos.json` as `{ "src": "/images/gallery/…webp", "width": 0, "height": 0, "alt": { "he": "…", "en": "…" } }`; the gallery section appears once the list is not empty.
- **Google rating:** `googleRating` in the business config is a dated snapshot of the Google Business Profile. Update `value`, `count` and `checkedOn` together.
- **Photos:** replace `public/images/hero-pizza.webp`, `public/images/dough-story.webp` and `public/images/og-pizza.jpg` while preserving the filenames, dimensions/aspect ratios and descriptive alt translations, then run `node scripts/generate-menu-images.mjs` to rebuild the responsive hero and menu variants. The current hero, dough and menu photos are AI-generated stand-ins, not photos of the shop.
- **Love campaign assets:** `public/images/heart-pizza.png` is the transparent hero product image. `public/images/og-love-campaign.jpg` is the required 1200×630 Facebook/WhatsApp preview. Regenerate the preview after replacing the pizza by running `node scripts/generate-love-og.mjs` with `sharp` available.
- **Campaign tracking:** links such as `https://pizzavirtuoso.co.il/he/?utm_source=facebook&utm_campaign=…` are remembered for the visit and forwarded (with `gclid`/`fbclid`) on every order link, where the ordering system stores them with the order. After consent, GA4 receives `order_now_click`, `phone_click`, `whatsapp_click`, `coupon_view`, `coupon_copy`, `menu_click` and `deal_click`, each with a `link_location` parameter; `begin_checkout` and `purchase` are sent by the ordering system.
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

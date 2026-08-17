# Pizza Virtuoso SEO operating guide

## Targeting map

| Page | Primary intent | Title | H1 |
| --- | --- | --- | --- |
| `/he/` | פיצה כשרה בראשון לציון; פיצה / פיצרייה בראשון לציון; פיצה ליד היכל התרבות; פיצה ז׳בוטינסקי ראשון לציון; הזמנת פיצה | פיצה כשרה בראשון לציון \| פיצה וירטואוז | פיצה כשרה בראשון לציון – פיצה וירטואוז |
| `/en/` | Kosher pizza and pizzeria in Rishon LeZion; local English-language visitors | Kosher Pizza in Rishon LeZion \| Pizza Virtuoso | Kosher pizza in Rishon LeZion — Pizza Virtuoso |

The menu, location, kosher and ordering intents are consolidated on the substantial homepage. Do not create near-duplicate pages for spelling or preposition variants. The crawlable menu section covers pizza, Margherita, pesto, Alfredo, rosa, slices, pasta, ravioli, salads, baked dishes and drinks naturally.

## Facts awaiting owner verification

- **Kosher supervision:** the business is described only as kosher. Add the official supervising authority, certificate details and accessible certificate image only after checking the current certificate. Source TODO: `src/components/HomePage.astro`.
- **Opening hours:** repository data says Sunday–Thursday, 17:00–23:00, but current public directories show conflicting hours, including noon opening and Saturday service. Confirm directly with the owner, then update `src/content/business/config.json`, both language dictionaries, and set `openingHoursVerified` to `true`. Until then, hours are deliberately omitted from Restaurant JSON-LD.
- **Menu and prices:** public directory menus conflict with the repository. Confirm the current in-store menu before changing `src/content/menu/menu.json`.
- **Google destination:** confirm that `googleBusinessUrl` opens the active Pizza Virtuoso profile, not an old listing at the address.

## Google Search Console after deployment

1. Verify a Domain property for `pizzavirtuoso.co.il` using the DNS record Google provides.
2. Submit `https://pizzavirtuoso.co.il/sitemap.xml`.
3. Inspect `/he/` and request indexing after the production deployment.
4. Inspect `/en/` and any future substantial canonical page individually.
5. Monitor Pages/Indexing, Core Web Vitals and Search performance. Review queries, impressions, CTR and average position by page and device.
6. Check that Google-selected canonicals match the declared canonicals and investigate discrepancies rather than repeatedly requesting indexing.

If the production host supports redirect rules, replace the static root meta refresh with a server-level permanent redirect from `/` to `/he/`. The current root is a GitHub Pages-compatible `200` fallback with `noindex, follow` and a canonical to `/he/`; it is intentionally excluded from the sitemap.

## Google Business Profile checklist

- Use the most specific valid primary category equivalent to **Pizza restaurant**; add only genuinely applicable secondary categories.
- Verify the exact name `פיצה וירטואוז`, address `ז׳בוטינסקי 16, ראשון לציון`, phone `03-9504888`, canonical website URL, current hours and special holiday hours.
- Verify menu and ordering URLs, kosher attributes offered by Google, logo, cover photo and current real business photos.
- Investigate the **Pizza X** listing at the same address. Determine whether it is an old closed business, an active separate business or an incorrect listing. If it is a former business, use Google’s legitimate “closed/moved/suggest an edit” process; do not manipulate the listing.
- Check that the website/Maps destination points specifically to the active Pizza Virtuoso profile.

## Reviews, citations and local authority

- Ask genuine customers for honest reviews without incentives or scripted keyword requests. Respond naturally and helpfully to every review.
- Audit quality profiles such as Google, Easy, D.co.il and relevant ordering platforms for identical name, address, phone and website. Correct or flag outdated previous-business names and phone numbers.
- Pursue real local mentions: Rishon LeZion community and event sites, a genuine collaboration with Heichal HaTarbut or nearby venues, local press/food coverage, and relevant suppliers or partners.
- Do not buy bulk directory listings, spam backlinks or reviews.

## Release checks

Run:

```bash
pnpm build
pnpm validate:seo
```

Then preview the production build at mobile and desktop widths. Confirm menu/category navigation, WhatsApp order, phone, Waze, Google Business Profile, language switcher and accessibility controls. Use Search Console and field data for ongoing Core Web Vitals; local synthetic results are diagnostic, not ranking guarantees.

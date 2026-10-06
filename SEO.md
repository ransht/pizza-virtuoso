# Pizza Virtuoso SEO operating guide

## Targeting map

| Page | Primary intent | Title | H1 |
| --- | --- | --- | --- |
| `/he/` | פיצה כשרה בראשון לציון; פיצה / פיצרייה בראשון לציון; פיצה ליד היכל התרבות; פיצה ז׳בוטינסקי ראשון לציון; הזמנת פיצה | פיצה וירטואוז ראשון לציון \| פיצה כשרה ומשלוחים | הפיצה המיתולוגית מול היכל התרבות בראשון לציון |
| `/en/` | Kosher pizza and pizzeria in Rishon LeZion; local English-language visitors | Pizza Virtuoso Rishon LeZion \| Kosher Pizza & Delivery | The legendary pizza opposite the Rishon LeZion Performing Arts Center |

The menu, location, kosher and ordering intents are consolidated on the substantial homepage. Do not create near-duplicate pages for spelling or preposition variants. The crawlable menu section covers pizza, Margherita, pesto, Alfredo, rosa, slices, pasta, ravioli, salads, baked dishes and drinks naturally.

## Facts awaiting owner verification

- **Menu and prices:** public directory menus conflict with the repository. Confirm the current in-store menu before changing `src/content/menu/menu.json`.

## Owner-verified facts (October 2026)

- **Kosher supervision:** Rishon LeZion Rabbinate (not mehadrin). Describe it only as "הרבנות ראשון לציון".
- **Opening hours:** Sunday–Thursday 17:00–23:30; closed Friday and Saturday. The owner plans to open on Saturday night later; add the Saturday-night slot to `openingHours` in `src/content/business/config.json` when that starts; every visible mention and the structured data follow from it.

- **Google and Facebook profiles (checked 5 October 2026):** `googleBusinessUrl` is the permanent Maps URL of the active "פיצה וירטואוז" profile (CID 9467731136455280639) and `facebookUrl` is the permanent page URL. Do not replace them with `share.google` or `facebook.com/share` short links; `pnpm validate:seo` rejects those in structured data.

## Structured data

- The `Restaurant` `@id` is `https://pizzavirtuoso.co.il/#restaurant`. The ordering site references the same `@id`; never change it.
- The `Menu` node is generated from `src/content/menu/menu.json` and the language dictionaries, the same sources as the visible menu, so prices in schema always equal the prices on the page. `pnpm validate:seo` fails if they diverge.
- Menu photos are illustrative, so they are deliberately left out of `MenuItem`. Add them once real dish photos replace them.
- No `AggregateRating` or `Review` markup: Google ignores self-published ratings for local businesses. The page shows the Google rating as a dated snapshot (`googleRating` in the business config, 4.8 from 107 reviews on 6 October 2026) with a link to the profile, and no review texts are copied onto the site.

## Google Search Console after deployment

1. Verify a Domain property for `pizzavirtuoso.co.il` using the DNS record Google provides.
2. Submit `https://pizzavirtuoso.co.il/sitemap.xml`.
3. Inspect `/he/` and request indexing after the production deployment.
4. Inspect `/en/` and any future substantial canonical page individually.
5. Monitor Pages/Indexing, Core Web Vitals and Search performance. Review queries, impressions, CTR and average position by page and device.
6. Check that Google-selected canonicals match the declared canonicals and investigate discrepancies rather than repeatedly requesting indexing.

GitHub Pages cannot return a `301`, so `/` is a `200` page with an instant meta refresh and a canonical to `/he/`, which search engines treat as a permanent redirect. It must not carry `noindex` (that drops the link signals of the URL most external links use) and it stays out of the sitemap. A real `301` needs an edge rule: the domain's DNS is already on Cloudflare, so proxying the record and adding a Redirect Rule for `/` → `/he/` would provide one without moving hosts.

`/love/` is an expired campaign page (valid until 30 July 2026) and is `noindex`. Remove the `noindex` prop in `src/pages/love/index.astro` only if the campaign runs again.

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

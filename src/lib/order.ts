import business from '../content/business/config.json';

const base = import.meta.env.PUBLIC_ORDER_URL || business.orderUrl;

/**
 * Every "order" CTA on the site goes through here so they all land on the same destination.
 * `path` may point at a specific place in the ordering system (used by deals).
 * Campaign parameters (utm_*, gclid, fbclid) are appended in the browser (see HomePage.astro).
 */
export function orderHref(path = '/') {
  return new URL(path, base).href;
}

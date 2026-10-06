import business from '../content/business/config.json';

const base = import.meta.env.PUBLIC_ORDER_URL || business.orderUrl;

/**
 * Every "order" CTA on the site goes through here so they all land on the same destination.
 * `path` may point at a specific place in the ordering system (used by deals).
 * The coupon travels as ?coupon=…; the ordering system ignores unknown parameters, and
 * campaign parameters (utm_*, gclid, fbclid) are appended in the browser (see HomePage.astro).
 */
export function orderHref(path = '/') {
  const url = new URL(path, base);
  url.searchParams.set('coupon', business.directOrderCoupon.code);
  return url.href;
}

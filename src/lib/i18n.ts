import he from '../i18n/he.json';
import en from '../i18n/en.json';
import business from '../content/business/config.json';
import { hoursShort, hoursSummary } from './hours';

export const languages = ['he', 'en'] as const;
export type Language = (typeof languages)[number];
export type Messages = typeof he;

// Dictionary strings never repeat business facts. They reference them with {tokens}
// that are filled from src/content/business/config.json, so a change there reaches every sentence.
function tokens(lang: Language): Record<string, string> {
  return {
    hours: hoursSummary(lang),
    hoursShort: hoursShort(lang),
    phone: business.telephoneDisplay,
    coupon: business.directOrderCoupon.code,
    couponPercent: String(business.directOrderCoupon.percent),
    kosherSupervision: lang === 'he' ? business.kosherSupervision : business.kosherSupervisionEn,
  };
}

function fill<T>(value: T, values: Record<string, string>): T {
  if (typeof value === 'string') return value.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match) as T;
  if (Array.isArray(value)) return value.map((item) => fill(item, values)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fill(item, values)])) as T;
  return value;
}

export const dictionaries: Record<Language, Messages> = { he: fill(he, tokens('he')), en: fill(en as Messages, tokens('en')) };

export function isLanguage(value: string | undefined): value is Language {
  return languages.includes(value as Language);
}

export function direction(lang: Language) {
  return lang === 'he' ? 'rtl' : 'ltr';
}

export function locale(lang: Language) {
  return lang === 'he' ? 'he_IL' : 'en_US';
}

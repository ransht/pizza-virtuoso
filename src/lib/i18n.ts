import he from '../i18n/he.json';
import en from '../i18n/en.json';

export const languages = ['he', 'en'] as const;
export type Language = (typeof languages)[number];
export type Messages = typeof he;

export const dictionaries: Record<Language, Messages> = { he, en };

export function isLanguage(value: string | undefined): value is Language {
  return languages.includes(value as Language);
}

export function direction(lang: Language) {
  return lang === 'he' ? 'rtl' : 'ltr';
}

export function locale(lang: Language) {
  return lang === 'he' ? 'he_IL' : 'en_US';
}

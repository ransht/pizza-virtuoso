import business from '../content/business/config.json';
import type { Language } from './i18n';

// Opening hours have one source of truth: `openingHours` and `specialOpeningHours` in
// src/content/business/config.json. Everything visible (hours table, FAQ, meta description,
// "open now" badge) and the JSON-LD is derived from it here.
//
// openingHours entry:        { dayOfWeek: ['Saturday'], opens: '20:30', closes: '23:30', note?: { he: 'מוצאי שבת', en: 'Saturday night' } }
// specialOpeningHours entry: { validFrom: '2026-12-24', validThrough: '2026-12-24', opens?: '17:00', closes?: '22:00', note?: { he, en } }
//                            (omit opens/closes for a closed day)
// A day may appear in several entries (split shifts). `closes` earlier than `opens` means after midnight.

export const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type WeekDay = (typeof weekDays)[number];
type Note = Partial<Record<Language, string>>;
export interface HoursEntry { dayOfWeek: string[]; opens: string; closes: string; note?: Note }
export interface SpecialHoursEntry { validFrom: string; validThrough: string; opens?: string; closes?: string; note?: Note }
export interface HoursRow { days: string; hours: string; note?: string; closed: boolean }

const regular = business.openingHours as HoursEntry[];
const special = business.specialOpeningHours as SpecialHoursEntry[];

const dayNames: Record<Language, { long: string[]; short: string[]; closed: string; range: string; and: string }> = {
  he: {
    long: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
    short: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'],
    closed: 'סגור', range: '–', and: ' ו',
  },
  en: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    closed: 'Closed', range: '–', and: ' and ',
  },
};

const slotsFor = (day: WeekDay) => regular
  .filter((entry) => entry.dayOfWeek.includes(day))
  .sort((a, b) => a.opens.localeCompare(b.opens));

function label(days: number[], names: string[], lang: Language) {
  const copy = dayNames[lang];
  if (days.length === 1) return names[days[0]];
  if (days.length === 2) return `${names[days[0]]}${copy.and}${names[days[1]]}`;
  return `${names[days[0]]}${copy.range}${names[days.at(-1)!]}`;
}

// Consecutive days with identical hours collapse into one row, e.g. "ראשון–חמישי 17:00–23:30".
function groups(lang: Language) {
  const result: { days: number[]; key: string; hours: string; note?: string }[] = [];
  weekDays.forEach((day, index) => {
    const slots = slotsFor(day);
    const hours = slots.map((slot) => `${slot.opens}–${slot.closes}`).join(', ');
    const note = slots.map((slot) => slot.note?.[lang]).filter(Boolean).join(', ') || undefined;
    const key = `${hours}|${note || ''}`;
    const last = result.at(-1);
    if (last && last.key === key) last.days.push(index);
    else result.push({ days: [index], key, hours, note });
  });
  return result;
}

export function hoursRows(lang: Language): HoursRow[] {
  const copy = dayNames[lang];
  return groups(lang).map((group) => ({
    days: label(group.days, copy.long, lang),
    hours: group.hours || copy.closed,
    note: group.note,
    closed: !group.hours,
  }));
}

/** "ראשון–חמישי 17:00–23:30 · שישי ושבת סגור" */
export function hoursSummary(lang: Language) {
  return hoursRows(lang).map((row) => `${row.days} ${row.hours}`).join(' · ');
}

/** Open days only, with short day names: "א׳–ה׳ 17:00–23:30" */
export function hoursShort(lang: Language) {
  const copy = dayNames[lang];
  return groups(lang).filter((group) => group.hours).map((group) => `${label(group.days, copy.short, lang)} ${group.hours}`).join(', ');
}

export function specialHoursRows(lang: Language): HoursRow[] {
  const formatter = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'numeric', timeZone: 'UTC' });
  const today = new Date().toISOString().slice(0, 10);
  return special.filter((entry) => entry.validThrough >= today).map((entry) => {
    const from = formatter.format(new Date(`${entry.validFrom}T00:00:00Z`));
    const through = formatter.format(new Date(`${entry.validThrough}T00:00:00Z`));
    const closed = !entry.opens || !entry.closes;
    return {
      days: from === through ? from : `${from}–${through}`,
      hours: closed ? dayNames[lang].closed : `${entry.opens}–${entry.closes}`,
      note: entry.note?.[lang],
      closed,
    };
  });
}

export function openingHoursSchema() {
  return regular.map(({ dayOfWeek, opens, closes }) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek, opens, closes }));
}

export function specialOpeningHoursSchema() {
  return special.map(({ validFrom, validThrough, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification', validFrom, validThrough,
    // schema.org convention for a closed day: opens and closes both 00:00.
    opens: opens || '00:00', closes: closes || '00:00',
  }));
}

/** Compact payload for the client-side "open now" badge. */
export function openStatusData() {
  return {
    week: weekDays.map((day) => slotsFor(day).map((slot) => [slot.opens, slot.closes])),
    special: special.map(({ validFrom, validThrough, opens, closes }) => ({ from: validFrom, through: validThrough, slot: opens && closes ? [opens, closes] : null })),
  };
}

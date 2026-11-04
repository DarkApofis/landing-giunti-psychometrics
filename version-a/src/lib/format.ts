import type { AgeRange } from '@/types/product';

const LOCALE = 'it-IT';

/**
 * CLDR sets minimumGroupingDigits = 2 for Italian, so by default Intl prints "1250,00 €".
 * The brief (and catalogue convention) requires "1.250,00 €": force grouping (ES2023 'always').
 */
const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  useGrouping: 'always',
});

/** 1250 → "1.250,00 €" (the space before € is a no-break space, U+00A0). */
export function formatPrice(euros: number): string {
  return priceFormatter.format(euros);
}

const dateFormatters = {
  long: new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }),
  short: new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }),
} as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses a calendar date (YYYY-MM-DD) as UTC midnight, so formatting in UTC
 * never shifts the day regardless of the server/browser timezone.
 */
export function parseIsoDate(iso: string): Date {
  const match = ISO_DATE.exec(iso);
  if (!match) throw new RangeError(`Invalid ISO date: "${iso}"`);
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  // Reject overflowing values such as 2027-13-45 (Date would silently roll them over).
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    throw new RangeError(`Invalid ISO date: "${iso}"`);
  }
  return date;
}

/** "2027-01-19" → "19 gennaio 2027" (long) or "19 gen 2027" (short). */
export function formatDate(iso: string, style: keyof typeof dateFormatters = 'long'): string {
  return dateFormatters[style].format(parseIsoDate(iso));
}

/** { 6, 14, anni } → "6–14 anni"; { 18, null, anni } → "18+ anni". */
export function formatAgeRange({ min, max, unit }: AgeRange): string {
  return max === null ? `${min}+ ${unit}` : `${min}–${max} ${unit}`;
}

/** Rounded percentage saved, or `null` when there is no actual discount. */
export function discountPercent(
  originalPrice: number,
  discountPrice: number | null,
): number | null {
  if (discountPrice === null || discountPrice >= originalPrice || originalPrice <= 0) return null;
  return Math.round((1 - discountPrice / originalPrice) * 100);
}

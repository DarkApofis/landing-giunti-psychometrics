import { describe, expect, it } from 'vitest';
import { discountPercent, formatAgeRange, formatDate, formatPrice } from './format';

/** Intl uses a no-break space (U+00A0) before "€"; compare visually with a normal space too. */
const visible = (s: string) => s.replace(/ | /g, ' ');

describe('formatPrice', () => {
  it('formats 1250 as "1.250,00 €" (Italian grouping, comma decimals, trailing euro)', () => {
    expect(visible(formatPrice(1250))).toBe('1.250,00 €');
  });

  it('separates the euro sign with a no-break space so it never wraps alone', () => {
    expect(formatPrice(1250)).toBe('1.250,00 €');
  });

  it.each([
    [0, '0,00 €'],
    [99.9, '99,90 €'],
    [119, '119,00 €'],
    [1062.5, '1.062,50 €'],
    [2450, '2.450,00 €'],
    [1234567.891, '1.234.567,89 €'],
  ])('formats %d as "%s"', (input, expected) => {
    expect(visible(formatPrice(input))).toBe(expected);
  });
});

describe('formatDate', () => {
  it('formats an ISO date in long Italian form', () => {
    expect(formatDate('2027-01-19')).toBe('19 gennaio 2027');
  });

  it('supports a short month form', () => {
    expect(formatDate('2027-01-19', 'short')).toBe('19 gen 2027');
  });

  it('does not shift the day because of the local timezone (first of month)', () => {
    expect(formatDate('2027-03-01')).toBe('1 marzo 2027');
  });

  it('throws on an invalid ISO date', () => {
    expect(() => formatDate('2027-13-45')).toThrow(RangeError);
    expect(() => formatDate('not-a-date')).toThrow(RangeError);
  });
});

describe('formatAgeRange', () => {
  it('formats a closed range with an en dash', () => {
    expect(formatAgeRange({ min: 6, max: 14, unit: 'anni' })).toBe('6–14 anni');
  });

  it('formats an open-ended range', () => {
    expect(formatAgeRange({ min: 18, max: null, unit: 'anni' })).toBe('18+ anni');
  });

  it('supports months', () => {
    expect(formatAgeRange({ min: 0, max: 42, unit: 'mesi' })).toBe('0–42 mesi');
  });
});

describe('discountPercent', () => {
  it('returns the rounded percentage saved', () => {
    expect(discountPercent(1250, 1062.5)).toBe(15);
    expect(discountPercent(690, 552)).toBe(20);
    expect(discountPercent(145, 119)).toBe(18);
  });

  it('returns null when there is no real discount', () => {
    expect(discountPercent(180, null)).toBeNull();
    expect(discountPercent(180, 180)).toBeNull();
    expect(discountPercent(180, 200)).toBeNull();
  });
});

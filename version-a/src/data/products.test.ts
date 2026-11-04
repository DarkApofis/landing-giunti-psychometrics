import { describe, expect, it } from 'vitest';
import { normalize } from '@/lib/search';
import { UNSPLASH_HOST } from '@/lib/unsplash';
import { CATEGORY_IDS, type ProductFormat } from '@/types/product';
import { categories } from './categories';
import { products } from './products';

/** Real, commercially published instruments that must never appear in the fictional catalogue. */
const REAL_TEST_NAMES = [
  'wisc',
  'wais',
  'wppsi',
  'mmpi',
  'raven',
  'bayley',
  'conners',
  'vineland',
  'nepsy',
  'kaufman',
  'k abc',
  'stanford binet',
  'leiter',
  'cbcl',
  'big five',
  'bfq',
  'mmse',
  'moca',
  'rorschach',
  'tat',
  'bdi',
  'stai',
  'scl 90',
  'mt',
  'ddai',
  'bvn',
  'bvsco',
];

const FORMATS: ProductFormat[] = ['Cartaceo', 'Digitale', 'Corso online', 'In presenza'];

describe('product catalogue data', () => {
  it('has at least 8 products, mixing tests and courses', () => {
    expect(products.length).toBeGreaterThanOrEqual(8);
    expect(products.some((p) => p.type === 'test')).toBe(true);
    expect(products.some((p) => p.type === 'corso')).toBe(true);
  });

  it('uses every declared category, and at least 3 categories exist', () => {
    expect(categories.length).toBeGreaterThanOrEqual(3);
    expect(categories.map((c) => c.id)).toEqual([...CATEGORY_IDS]);
    for (const { id } of categories) {
      expect(
        products.some((p) => p.category === id),
        id,
      ).toBe(true);
    }
  });

  it('uses every format at least once', () => {
    for (const format of FORMATS) {
      expect(
        products.some((p) => p.format === format),
        format,
      ).toBe(true);
    }
  });

  it('has unique ids and slugs', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it('has coherent prices (discount strictly lower, some without discount)', () => {
    for (const p of products) {
      expect(p.originalPrice, p.id).toBeGreaterThan(0);
      if (p.discountPrice !== null) {
        expect(p.discountPrice, p.id).toBeGreaterThan(0);
        expect(p.discountPrice, p.id).toBeLessThan(p.originalPrice);
      }
    }
    expect(products.some((p) => p.discountPrice === null)).toBe(true);
  });

  it('gives tests an age range and courses a valid start date', () => {
    for (const p of products) {
      if (p.type === 'test') {
        expect(p.ageRange.min, p.id).toBeGreaterThanOrEqual(0);
        if (p.ageRange.max !== null) expect(p.ageRange.max, p.id).toBeGreaterThan(p.ageRange.min);
      } else {
        expect(p.startDate, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(p.startDate)), p.id).toBe(false);
        expect(p.location === null, p.id).toBe(p.format === 'Corso online');
      }
    }
  });

  it('uses allowed Unsplash URLs and meaningful Italian alt texts', () => {
    for (const p of products) {
      expect(new URL(p.image.src).hostname, p.id).toBe(UNSPLASH_HOST);
      expect(p.image.alt.length, p.id).toBeGreaterThan(20);
      expect(p.image.alt.toLowerCase(), p.id).not.toMatch(/^(immagine|foto|image)\b/);
    }
  });

  it('never references real test names', () => {
    for (const p of products) {
      const words = ` ${normalize(`${p.name} ${p.description} ${p.slug}`)} `;
      for (const banned of REAL_TEST_NAMES) {
        expect(words.includes(` ${banned} `), `${p.id} contains "${banned}"`).toBe(false);
      }
    }
  });
});

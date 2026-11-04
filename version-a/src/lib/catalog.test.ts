import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import type { CourseProduct, Product, TestProduct } from '@/types/product';
import {
  countByCategory,
  filterProducts,
  filtersToSearch,
  parseFilters,
  resultsLabel,
} from './catalog';

const image = { src: 'https://images.unsplash.com/photo-x', alt: 'Scena di prova descrittiva' };

const test = (id: string, name: string, category: TestProduct['category']): TestProduct => ({
  id,
  slug: id,
  type: 'test',
  name,
  description: '—',
  category,
  format: 'Digitale',
  author: 'Autore',
  ageRange: { min: 6, max: 14, unit: 'anni' },
  qualification: 'B',
  administrationMinutes: 20,
  originalPrice: 100,
  discountPrice: null,
  image,
});

const course = (id: string, name: string): CourseProduct => ({
  id,
  slug: id,
  type: 'corso',
  name,
  description: '—',
  category: 'formazione',
  format: 'Corso online',
  instructor: 'Docente',
  startDate: '2027-01-01',
  durationHours: 8,
  ecmCredits: 8,
  location: null,
  originalPrice: 100,
  discountPrice: null,
  image,
});

const fixture: Product[] = [
  test('a', 'ALFA-T — Valutazione della memoria', 'clinica-neuropsicologia'),
  test('b', 'BETA-S — Lettura in età scolare', 'scuola-eta-evolutiva'),
  test('c', 'GAMMA-W — Personalità al lavoro', 'lavoro-organizzazioni'),
  course('d', 'Corso di valutazione della memoria'),
  test('e', 'DELTA-T — Attenzione e memoria', 'scuola-eta-evolutiva'),
];

const ids = (list: readonly Product[]) => list.map((p) => p.id);

describe('filterProducts', () => {
  it('returns everything with "tutti" and an empty query', () => {
    expect(ids(filterProducts(fixture, { category: 'tutti', query: '' }))).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);
  });

  it('filters by category only', () => {
    expect(ids(filterProducts(fixture, { category: 'scuola-eta-evolutiva', query: '' }))).toEqual([
      'b',
      'e',
    ]);
  });

  it('filters by query only (accent-insensitive)', () => {
    expect(ids(filterProducts(fixture, { category: 'tutti', query: 'MEMORIA' }))).toEqual([
      'a',
      'd',
      'e',
    ]);
    expect(ids(filterProducts(fixture, { category: 'tutti', query: 'eta' }))).toEqual(['b']);
  });

  it('combines category AND query', () => {
    expect(
      ids(filterProducts(fixture, { category: 'scuola-eta-evolutiva', query: 'memoria' })),
    ).toEqual(['e']);
    expect(ids(filterProducts(fixture, { category: 'formazione', query: 'memoria' }))).toEqual([
      'd',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(
      filterProducts(fixture, { category: 'lavoro-organizzazioni', query: 'memoria' }),
    ).toEqual([]);
  });

  it('preserves the original order and does not mutate the input', () => {
    const copy = [...fixture];
    filterProducts(fixture, { category: 'tutti', query: 'a' });
    expect(fixture).toEqual(copy);
  });

  it('works on the real catalogue', () => {
    expect(ids(filterProducts(products, { category: 'tutti', query: 'attentio' }))).toEqual([
      'attentio-r',
      'corso-attentio-r',
    ]);
  });
});

describe('countByCategory', () => {
  it('counts every category plus "tutti" with no query', () => {
    expect(countByCategory(fixture, '')).toEqual({
      tutti: 5,
      'clinica-neuropsicologia': 1,
      'scuola-eta-evolutiva': 2,
      'lavoro-organizzazioni': 1,
      formazione: 1,
    });
  });

  it('applies the current query to the counts (categories with no match show 0)', () => {
    expect(countByCategory(fixture, 'memoria')).toEqual({
      tutti: 3,
      'clinica-neuropsicologia': 1,
      'scuola-eta-evolutiva': 1,
      'lavoro-organizzazioni': 0,
      formazione: 1,
    });
  });
});

describe('resultsLabel (Italian singular/plural)', () => {
  it.each([
    [0, 'Nessun prodotto trovato'],
    [1, '1 prodotto trovato'],
    [2, '2 prodotti trovati'],
    [12, '12 prodotti trovati'],
  ])('%d → "%s"', (count, expected) => {
    expect(resultsLabel(count)).toBe(expected);
  });
});

describe('parseFilters (URL → state)', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseFilters('')).toEqual({ category: 'tutti', query: '' });
  });

  it('reads a valid category and the search text', () => {
    expect(parseFilters('?categoria=formazione&q=neura%20q')).toEqual({
      category: 'formazione',
      query: 'neura q',
    });
  });

  it('ignores an unknown category instead of showing an empty catalogue', () => {
    expect(parseFilters('?categoria=hacked')).toEqual({ category: 'tutti', query: '' });
  });

  it('caps an absurdly long query', () => {
    expect(parseFilters(`?q=${'a'.repeat(500)}`).query).toHaveLength(100);
  });
});

describe('filtersToSearch (state → URL)', () => {
  it('returns an empty string for the default state (clean URL)', () => {
    expect(filtersToSearch({ category: 'tutti', query: '' })).toBe('');
    expect(filtersToSearch({ category: 'tutti', query: '   ' })).toBe('');
  });

  it('serialises category and trimmed query', () => {
    expect(filtersToSearch({ category: 'scuola-eta-evolutiva', query: ' età ' })).toBe(
      '?categoria=scuola-eta-evolutiva&q=et%C3%A0',
    );
  });

  it('round-trips with parseFilters', () => {
    const state = { category: 'lavoro-organizzazioni', query: 'leader 360' } as const;
    expect(parseFilters(filtersToSearch(state))).toEqual(state);
  });
});

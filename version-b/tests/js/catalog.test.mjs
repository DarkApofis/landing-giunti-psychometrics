// Same cases as version-a/src/lib/catalog.test.ts, plus the real dataset (resources/data/products.json).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { RESULTS_LABELS, loadScripts } from './load.mjs';

const { filterItems, countByCategory, resultsLabel, parseFilters, filtersToSearch } = loadScripts(
  'lib/text.js',
  'lib/search.js',
  'lib/catalog.js',
).GP.lib.catalog;

const CATEGORY_IDS = ['clinica-neuropsicologia', 'scuola-eta-evolutiva', 'lavoro-organizzazioni', 'formazione'];

const fixture = [
  { id: 'a', name: 'ALFA-T — Valutazione della memoria', category: 'clinica-neuropsicologia' },
  { id: 'b', name: 'BETA-S — Lettura in età scolare', category: 'scuola-eta-evolutiva' },
  { id: 'c', name: 'GAMMA-W — Personalità al lavoro', category: 'lavoro-organizzazioni' },
  { id: 'd', name: 'Corso di valutazione della memoria', category: 'formazione' },
  { id: 'e', name: 'DELTA-T — Attenzione e memoria', category: 'scuola-eta-evolutiva' },
];
const products = JSON.parse(readFileSync(new URL('../../resources/data/products.json', import.meta.url), 'utf8'));

const ids = (list) => list.map((item) => item.id);

describe('filterItems', () => {
  it('returns everything with "tutti" and an empty query', () => {
    assert.deepEqual(ids(filterItems(fixture, { category: 'tutti', query: '' })), ['a', 'b', 'c', 'd', 'e']);
  });

  it('filters by category only', () => {
    assert.deepEqual(ids(filterItems(fixture, { category: 'scuola-eta-evolutiva', query: '' })), ['b', 'e']);
  });

  it('filters by query only (accent-insensitive)', () => {
    assert.deepEqual(ids(filterItems(fixture, { category: 'tutti', query: 'MEMORIA' })), ['a', 'd', 'e']);
    assert.deepEqual(ids(filterItems(fixture, { category: 'tutti', query: 'eta' })), ['b']);
  });

  it('combines category AND query', () => {
    assert.deepEqual(ids(filterItems(fixture, { category: 'scuola-eta-evolutiva', query: 'memoria' })), ['e']);
    assert.deepEqual(ids(filterItems(fixture, { category: 'formazione', query: 'memoria' })), ['d']);
  });

  it('returns an empty list when nothing matches', () => {
    assert.deepEqual(filterItems(fixture, { category: 'lavoro-organizzazioni', query: 'memoria' }), []);
  });

  it('preserves the original order and does not mutate the input', () => {
    const copy = structuredClone(fixture);
    filterItems(fixture, { category: 'tutti', query: 'a' });
    assert.deepEqual(fixture, copy);
  });

  it('works on the real catalogue', () => {
    assert.deepEqual(ids(filterItems(products, { category: 'tutti', query: 'attentio' })), ['attentio-r', 'corso-attentio-r']);
  });

  it('finds NEURA-Q when the acronym is typed without the dash ("neuraq")', () => {
    assert.deepEqual(ids(filterItems(products, { category: 'tutti', query: 'neuraq' })), ['neura-q']);
  });
});

describe('countByCategory', () => {
  it('counts every category plus "tutti" with no query', () => {
    assert.deepEqual({ ...countByCategory(fixture, '', CATEGORY_IDS) }, {
      tutti: 5,
      'clinica-neuropsicologia': 1,
      'scuola-eta-evolutiva': 2,
      'lavoro-organizzazioni': 1,
      formazione: 1,
    });
  });

  it('applies the current query to the counts (categories with no match show 0)', () => {
    assert.deepEqual({ ...countByCategory(fixture, 'memoria', CATEGORY_IDS) }, {
      tutti: 3,
      'clinica-neuropsicologia': 1,
      'scuola-eta-evolutiva': 1,
      'lavoro-organizzazioni': 0,
      formazione: 1,
    });
  });

  it('gives 12 · 3 · 3 · 2 · 4 on the real catalogue', () => {
    assert.deepEqual({ ...countByCategory(products, '', CATEGORY_IDS) }, {
      tutti: 12,
      'clinica-neuropsicologia': 3,
      'scuola-eta-evolutiva': 3,
      'lavoro-organizzazioni': 2,
      formazione: 4,
    });
  });
});

describe('resultsLabel (Italian singular/plural)', () => {
  for (const [count, expected] of [
    [0, 'Nessun prodotto trovato'],
    [1, '1 prodotto trovato'],
    [2, '2 prodotti trovati'],
    [12, '12 prodotti trovati'],
  ]) {
    it(`${count} → "${expected}"`, () => {
      assert.equal(resultsLabel(count, RESULTS_LABELS), expected);
    });
  }
});

describe('parseFilters (URL → state)', () => {
  it('returns defaults for an empty query string', () => {
    assert.deepEqual({ ...parseFilters('', CATEGORY_IDS) }, { category: 'tutti', query: '' });
  });

  it('reads a valid category and the search text', () => {
    assert.deepEqual({ ...parseFilters('?categoria=formazione&q=neura%20q', CATEGORY_IDS) }, {
      category: 'formazione',
      query: 'neura q',
    });
  });

  it('ignores an unknown category instead of showing an empty catalogue', () => {
    assert.deepEqual({ ...parseFilters('?categoria=hacked', CATEGORY_IDS) }, { category: 'tutti', query: '' });
    assert.deepEqual({ ...parseFilters('?categoria=<script>', CATEGORY_IDS) }, { category: 'tutti', query: '' });
  });

  it('caps an absurdly long query', () => {
    assert.equal(parseFilters(`?q=${'a'.repeat(500)}`, CATEGORY_IDS).query.length, 100);
  });
});

describe('filtersToSearch (state → URL)', () => {
  it('returns an empty string for the default state (clean URL)', () => {
    assert.equal(filtersToSearch({ category: 'tutti', query: '' }), '');
    assert.equal(filtersToSearch({ category: 'tutti', query: '   ' }), '');
  });

  it('serialises category and trimmed query', () => {
    assert.equal(filtersToSearch({ category: 'scuola-eta-evolutiva', query: ' età ' }), '?categoria=scuola-eta-evolutiva&q=et%C3%A0');
  });

  it('keeps unrelated parameters of the current URL (campaign tags…) and only rewrites its own', () => {
    assert.equal(
      filtersToSearch({ category: 'lavoro-organizzazioni', query: '' }, '?utm_source=newsletter&categoria=scuola-eta-evolutiva&q=old'),
      '?utm_source=newsletter&categoria=lavoro-organizzazioni',
    );
    assert.equal(filtersToSearch({ category: 'tutti', query: '' }, '?utm_source=x&q=old'), '?utm_source=x');
    assert.equal(filtersToSearch({ category: 'tutti', query: '' }, '?categoria=scuola-eta-evolutiva'), '');
  });

  it('round-trips with parseFilters', () => {
    const state = { category: 'lavoro-organizzazioni', query: 'leader 360' };
    assert.deepEqual({ ...parseFilters(filtersToSearch(state), CATEGORY_IDS) }, state);
  });
});

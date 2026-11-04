// Same cases as version-a/src/lib/search.test.ts.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadScripts } from './load.mjs';

const { normalize, matchesQuery } = loadScripts('lib/search.js').GP.lib.search;

describe('normalize', () => {
  it('lowercases and strips accents', () => {
    assert.equal(normalize('Età Evolutiva'), 'eta evolutiva');
    assert.equal(normalize('PERCHÉ così'), 'perche cosi');
  });

  it('turns punctuation and dashes into single spaces and trims', () => {
    assert.equal(normalize('  NEURA-Q — Batteria,  di   valutazione '), 'neura q batteria di valutazione');
  });

  it('treats typographic apostrophes as separators', () => {
    assert.equal(normalize('dell’adulto'), 'dell adulto');
  });
});

describe('matchesQuery', () => {
  const name = 'NEURA-Q — Batteria di valutazione neurocognitiva';

  it('matches everything when the query is empty or blank', () => {
    assert.equal(matchesQuery(name, ''), true);
    assert.equal(matchesQuery(name, '   '), true);
  });

  for (const query of ['NEURA', 'neura-q', 'neura q', 'neuraq', 'Neura—Q']) {
    it(`matches the acronym written as "${query}"`, () => {
      assert.equal(matchesQuery(name, query), true);
    });
  }

  it('requires every word, in any order (AND)', () => {
    assert.equal(matchesQuery(name, 'valutazione batteria'), true);
    assert.equal(matchesQuery(name, 'valutazione memoria'), false);
  });

  it('ignores accents in both the query and the text', () => {
    assert.equal(matchesQuery('Scuola ed Età evolutiva', 'eta'), true);
    assert.equal(matchesQuery('Scuola ed Eta evolutiva', 'età'), true);
  });

  it('does not match unrelated text', () => {
    assert.equal(matchesQuery(name, 'leadership'), false);
  });
});

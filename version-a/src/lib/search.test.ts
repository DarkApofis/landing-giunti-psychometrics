import { describe, expect, it } from 'vitest';
import { matchesQuery, normalize } from './search';

describe('normalize', () => {
  it('lowercases and strips accents', () => {
    expect(normalize('Età Evolutiva')).toBe('eta evolutiva');
    expect(normalize('PERCHÉ così')).toBe('perche cosi');
  });

  it('turns punctuation and dashes into single spaces and trims', () => {
    expect(normalize('  NEURA-Q — Batteria,  di   valutazione ')).toBe(
      'neura q batteria di valutazione',
    );
  });

  it('treats typographic apostrophes as separators', () => {
    expect(normalize('dell’adulto')).toBe('dell adulto');
  });
});

describe('matchesQuery', () => {
  const name = 'NEURA-Q — Batteria di valutazione neurocognitiva';

  it('matches everything when the query is empty or blank', () => {
    expect(matchesQuery(name, '')).toBe(true);
    expect(matchesQuery(name, '   ')).toBe(true);
  });

  it.each(['NEURA', 'neura-q', 'neura q', 'neuraq', 'Neura—Q'])(
    'matches the acronym written as "%s"',
    (query) => {
      expect(matchesQuery(name, query)).toBe(true);
    },
  );

  it('requires every word, in any order (AND)', () => {
    expect(matchesQuery(name, 'valutazione batteria')).toBe(true);
    expect(matchesQuery(name, 'valutazione memoria')).toBe(false);
  });

  it('ignores accents in both the query and the text', () => {
    expect(matchesQuery('Scuola ed Età evolutiva', 'eta')).toBe(true);
    expect(matchesQuery('Scuola ed Eta evolutiva', 'età')).toBe(true);
  });

  it('does not match unrelated text', () => {
    expect(matchesQuery(name, 'leadership')).toBe(false);
  });
});

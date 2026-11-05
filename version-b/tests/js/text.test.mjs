import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loadScripts } from './load.mjs';

const { fill } = loadScripts('lib/text.js').GP.lib.text;

describe('text.fill', () => {
  it('replaces :placeholders with their values', () => {
    assert.equal(fill('Grazie :name, ti risponderemo.', { name: 'Ana' }), 'Grazie Ana, ti risponderemo.');
    assert.equal(fill(':count di :total', { count: 2, total: 5 }), '2 di 5');
  });

  it('inserts user text literally: $&, $`, $\' and $$ are not replacement patterns', () => {
    assert.equal(fill('Grazie :name', { name: 'Ana $` Co' }), 'Grazie Ana $` Co');
    assert.equal(fill('per «:query»', { query: '$&$&' }), 'per «$&$&»');
    assert.equal(fill('per «:query»', { query: "$'$$" }), "per «$'$$»");
  });

  it('replaces every occurrence and leaves unknown placeholders alone', () => {
    assert.equal(fill(':n + :n', { n: 1 }), '1 + 1');
    assert.equal(fill('Ciao :name', {}), 'Ciao :name');
  });
});

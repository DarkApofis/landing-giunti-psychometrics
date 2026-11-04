// formatPrice: the same cases as version-a/src/lib/format.test.ts and tests/Unit/FormatTest.php,
// so JS (cart totals) and PHP (cards) print identical strings. Plus storage that never throws.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadScripts } from './load.mjs';

const { price, cents } = loadScripts('lib/format.js').GP.lib.format;
const NBSP = ' ';

describe('format.price', () => {
  for (const [input, expected] of [
    [0, '0,00 €'],
    [99.9, '99,90 €'],
    [119, '119,00 €'],
    [1062.5, '1.062,50 €'],
    [1250, '1.250,00 €'],
    [2450, '2.450,00 €'],
    [1234567.891, '1.234.567,89 €'],
  ]) {
    it(`${input} → "${expected}" with a no-break space`, () => {
      assert.equal(price(input), expected.replace(' €', `${NBSP}€`));
    });
  }

  it('formats integer cents', () => {
    assert.equal(cents(87550), `875,50${NBSP}€`);
  });
});

describe('storage', () => {
  it('returns null / false instead of throwing when localStorage is blocked', () => {
    const window = loadScripts('lib/storage.js');
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('SecurityError');
      },
    });
    assert.equal(window.GP.lib.storage.read('giunti-cart'), null);
    assert.equal(window.GP.lib.storage.write('giunti-cart', '{}'), false);
  });

  it('reads and writes when localStorage works', () => {
    const window = loadScripts('lib/storage.js');
    const data = new Map();
    window.localStorage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
    assert.equal(window.GP.lib.storage.write('k', 'v'), true);
    assert.equal(window.GP.lib.storage.read('k'), 'v');
  });
});

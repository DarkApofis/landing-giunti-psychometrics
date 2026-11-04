// Same cases as version-a/src/lib/cart.test.ts, against resources/js/lib/cart.js.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { loadScripts } from './load.mjs';

const cart = loadScripts('lib/cart.js').GP.lib.cart;
const { reduce, count, toCents, isCartable, lines, totals, countLabel, serialize, parseStored, EMPTY_CART } = cart;
const plain = (value) => JSON.parse(JSON.stringify(value));

describe('reduce', () => {
  it('adds a new product with quantity 1', () => {
    assert.deepEqual(plain(reduce(EMPTY_CART, { type: 'add', productId: 'a' })), { items: [{ productId: 'a', quantity: 1 }] });
  });

  it('increments the quantity when the product is already in the cart', () => {
    const once = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    assert.deepEqual(plain(reduce(once, { type: 'add', productId: 'a' }).items), [{ productId: 'a', quantity: 2 }]);
  });

  it('keeps insertion order across products', () => {
    let state = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    state = reduce(state, { type: 'add', productId: 'b' });
    state = reduce(state, { type: 'add', productId: 'a' });
    assert.deepEqual(plain(state.items.map((i) => i.productId)), ['a', 'b']);
  });

  it('sets a quantity, removing the line at 0 and clamping to 1–99', () => {
    const state = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    assert.deepEqual(plain(reduce(state, { type: 'setQuantity', productId: 'a', quantity: 5 }).items), [{ productId: 'a', quantity: 5 }]);
    assert.deepEqual(plain(reduce(state, { type: 'setQuantity', productId: 'a', quantity: 0 }).items), []);
    assert.equal(reduce(state, { type: 'setQuantity', productId: 'a', quantity: 500 }).items[0].quantity, 99);
  });

  it('removes a product and clears the cart', () => {
    let state = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    state = reduce(state, { type: 'add', productId: 'b' });
    assert.deepEqual(plain(reduce(state, { type: 'remove', productId: 'a' }).items), [{ productId: 'b', quantity: 1 }]);
    assert.deepEqual(plain(reduce(state, { type: 'clear' })), { items: [] });
  });

  it('does not mutate the previous state', () => {
    const state = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    const snapshot = structuredClone(plain(state));
    reduce(state, { type: 'add', productId: 'a' });
    assert.deepEqual(plain(state), snapshot);
  });

  it('hydrate replaces the whole state', () => {
    const next = { items: [{ productId: 'x', quantity: 2 }] };
    assert.deepEqual(plain(reduce(EMPTY_CART, { type: 'hydrate', state: next })), next);
  });
});

describe('count', () => {
  it('sums quantities', () => {
    let state = reduce(EMPTY_CART, { type: 'add', productId: 'a' });
    state = reduce(state, { type: 'add', productId: 'a' });
    state = reduce(state, { type: 'add', productId: 'b' });
    assert.equal(count(state), 3);
    assert.equal(count(EMPTY_CART), 0);
  });
});

describe('toCents', () => {
  for (const [euros, cents] of [[0, 0], [19.99, 1999], [382.5, 38250], [0.1 + 0.2, 30], [1.005, 101]]) {
    it(`${euros} € → ${cents} cents`, () => assert.equal(toCents(euros), cents));
  }
});

const fakeCourse = (id, originalPrice, discountPrice) => ({ id, type: 'corso', name: `Corso ${id}`, originalPrice, discountPrice });
const fakeTest = { id: 't', type: 'test', name: 'Test', originalPrice: 100, discountPrice: null };
const byId = (list) => Object.fromEntries(list.map((p) => [p.id, p]));

describe('isCartable', () => {
  it('only courses can be added to the cart', () => {
    assert.equal(isCartable(fakeCourse('c', 10, null)), true);
    assert.equal(isCartable(fakeTest), false);
  });
});

describe('lines + totals', () => {
  const catalogue = byId([fakeCourse('a', 19.99, null), fakeCourse('b', 450, 382.5), fakeTest]);
  const state = { items: [{ productId: 'b', quantity: 3 }, { productId: 'a', quantity: 3 }] };

  it('resolves lines in insertion order with unit and line totals in cents', () => {
    assert.deepEqual(plain(lines(state, catalogue).map((l) => [l.product.id, l.quantity, l.unitCents, l.lineCents])), [
      ['b', 3, 38250, 114750],
      ['a', 3, 1999, 5997],
    ]);
  });

  it('ignores unknown ids and non-cartable products', () => {
    const mixed = { items: [{ productId: 'ghost', quantity: 2 }, { productId: 't', quantity: 1 }, { productId: 'a', quantity: 1 }] };
    assert.deepEqual(plain(lines(mixed, catalogue).map((l) => l.product.id)), ['a']);
  });

  it('computes count, subtotal, list total and savings exactly in cents', () => {
    assert.deepEqual(plain(totals(lines(state, catalogue))), {
      count: 6,
      subtotalCents: 114750 + 5997,
      listTotalCents: 135000 + 5997,
      savingsCents: 20250,
    });
  });

  it('returns zeros for an empty cart', () => {
    assert.deepEqual(plain(totals([])), { count: 0, subtotalCents: 0, listTotalCents: 0, savingsCents: 0 });
  });

  it('adds the two courses of the e2e reload test to 875,50 € on the real catalogue', () => {
    const products = JSON.parse(readFileSync(new URL('../../resources/data/products.json', import.meta.url), 'utf8'));
    const real = byId(products);
    const dsa = products.find((p) => p.name.startsWith('Disturbi')).id;
    const assessment = products.find((p) => p.name.startsWith('Assessment')).id;
    const result = totals(lines({ items: [{ productId: dsa, quantity: 1 }, { productId: assessment, quantity: 1 }] }, real));
    assert.equal(result.subtotalCents, 87550);
  });
});

describe('countLabel (Italian)', () => {
  const labels = { none: 'Nessun articolo nel carrello', one: '1 articolo nel carrello', many: ':count articoli nel carrello' };
  for (const [n, label] of [[0, 'Nessun articolo nel carrello'], [1, '1 articolo nel carrello'], [3, '3 articoli nel carrello']]) {
    it(`${n} → "${label}"`, () => assert.equal(countLabel(n, labels), label));
  }
});

describe('parseStored (localStorage → state, defensive)', () => {
  const valid = ['a', 'b'];

  it('returns an empty cart for null, invalid JSON or a wrong shape', () => {
    for (const raw of [null, '{not json', '"hello"', '{"items":"nope"}', '{"items":[{"productId":"neura-q","quantity":"x"}']) {
      assert.deepEqual(plain(parseStored(raw, valid)), { items: [] }, String(raw));
    }
  });

  it('keeps valid lines, drops unknown ids and malformed entries, clamps quantities', () => {
    const raw = JSON.stringify({
      version: 1,
      items: [
        { productId: 'a', quantity: 2 },
        { productId: 'ghost', quantity: 1 },
        { productId: 'b', quantity: 500 },
        { productId: 'a', quantity: 1 },
        { productId: 'b' },
        null,
        { productId: 'b', quantity: -3 },
        { productId: 'a', quantity: 2.7 },
      ],
    });
    assert.deepEqual(plain(parseStored(raw, valid)), { items: [{ productId: 'a', quantity: 5 }, { productId: 'b', quantity: 99 }] });
  });

  it('round-trips with serialize', () => {
    const state = { items: [{ productId: 'a', quantity: 2 }] };
    assert.deepEqual(plain(parseStored(serialize(state), valid)), state);
  });
});

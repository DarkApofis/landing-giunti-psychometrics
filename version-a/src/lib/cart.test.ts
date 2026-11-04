import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import {
  cartCount,
  cartCountLabel,
  cartLines,
  cartReducer,
  cartTotals,
  EMPTY_CART,
  isCartable,
  parseStoredCart,
  serializeCart,
  toCents,
} from './cart';

describe('cartReducer', () => {
  it('adds a new product with quantity 1', () => {
    expect(cartReducer(EMPTY_CART, { type: 'add', productId: 'a' })).toEqual({
      items: [{ productId: 'a', quantity: 1 }],
    });
  });

  it('increments the quantity when the product is already in the cart', () => {
    const once = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    const twice = cartReducer(once, { type: 'add', productId: 'a' });
    expect(twice.items).toEqual([{ productId: 'a', quantity: 2 }]);
  });

  it('keeps insertion order across products', () => {
    let state = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    state = cartReducer(state, { type: 'add', productId: 'b' });
    state = cartReducer(state, { type: 'add', productId: 'a' });
    expect(state.items.map((i) => i.productId)).toEqual(['a', 'b']);
  });

  it('sets a quantity, removing the line at 0 and clamping to 1–99', () => {
    const state = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    expect(cartReducer(state, { type: 'setQuantity', productId: 'a', quantity: 5 }).items).toEqual([
      { productId: 'a', quantity: 5 },
    ]);
    expect(cartReducer(state, { type: 'setQuantity', productId: 'a', quantity: 0 }).items).toEqual(
      [],
    );
    expect(
      cartReducer(state, { type: 'setQuantity', productId: 'a', quantity: 500 }).items[0]?.quantity,
    ).toBe(99);
  });

  it('removes a product and clears the cart', () => {
    let state = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    state = cartReducer(state, { type: 'add', productId: 'b' });
    expect(cartReducer(state, { type: 'remove', productId: 'a' }).items).toEqual([
      { productId: 'b', quantity: 1 },
    ]);
    expect(cartReducer(state, { type: 'clear' })).toEqual(EMPTY_CART);
  });

  it('does not mutate the previous state', () => {
    const state = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    const snapshot = structuredClone(state);
    cartReducer(state, { type: 'add', productId: 'a' });
    expect(state).toEqual(snapshot);
  });
});

describe('cartCount', () => {
  it('sums quantities', () => {
    let state = cartReducer(EMPTY_CART, { type: 'add', productId: 'a' });
    state = cartReducer(state, { type: 'add', productId: 'a' });
    state = cartReducer(state, { type: 'add', productId: 'b' });
    expect(cartCount(state)).toBe(3);
    expect(cartCount(EMPTY_CART)).toBe(0);
  });
});

// ── Totals, cents, persistence (TDD, cart block) ─────────────────────────────

describe('toCents', () => {
  it.each([
    [0, 0],
    [19.99, 1999],
    [382.5, 38250],
    [0.1 + 0.2, 30], // 0.30000000000000004
    [1.005, 101], // classic floating-point trap: 1.005 * 100 = 100.49999999999999
  ])('%d € → %d cents', (euros, cents) => {
    expect(toCents(euros)).toBe(cents);
  });
});

const fakeCourse = (id: string, originalPrice: number, discountPrice: number | null): Product => ({
  id,
  slug: id,
  type: 'corso',
  name: `Corso ${id}`,
  description: '—',
  category: 'formazione',
  format: 'Corso online',
  instructor: 'Docente',
  startDate: '2027-01-01',
  durationHours: 8,
  ecmCredits: null,
  location: null,
  originalPrice,
  discountPrice,
  image: { src: 'https://images.unsplash.com/photo-x', alt: 'Scena di prova descrittiva' },
});

const fakeTest: Product = {
  ...fakeCourse('t', 100, null),
  type: 'test',
  format: 'Digitale',
  author: 'Autore',
  ageRange: { min: 6, max: 14, unit: 'anni' },
  qualification: 'B',
  administrationMinutes: 20,
} as unknown as Product;

describe('isCartable', () => {
  it('only courses can be added to the cart (tests require a qualification check)', () => {
    expect(isCartable(fakeCourse('c', 10, null))).toBe(true);
    expect(isCartable(fakeTest)).toBe(false);
  });
});

describe('cartLines + cartTotals', () => {
  const catalogue = [fakeCourse('a', 19.99, null), fakeCourse('b', 450, 382.5), fakeTest];

  it('resolves lines in insertion order with unit and line totals in cents', () => {
    const state = {
      items: [
        { productId: 'b', quantity: 3 },
        { productId: 'a', quantity: 3 },
      ],
    };
    const lines = cartLines(state, catalogue);
    expect(lines.map((l) => [l.product.id, l.quantity, l.unitCents, l.lineCents])).toEqual([
      ['b', 3, 38250, 114750],
      ['a', 3, 1999, 5997], // 19.99 * 3 = 59.97000000000001 in floats
    ]);
  });

  it('ignores unknown ids and non-cartable products', () => {
    const state = {
      items: [
        { productId: 'ghost', quantity: 2 },
        { productId: 't', quantity: 1 },
        { productId: 'a', quantity: 1 },
      ],
    };
    expect(cartLines(state, catalogue).map((l) => l.product.id)).toEqual(['a']);
  });

  it('computes count, subtotal, list total and savings exactly in cents', () => {
    const state = {
      items: [
        { productId: 'b', quantity: 3 },
        { productId: 'a', quantity: 3 },
      ],
    };
    expect(cartTotals(cartLines(state, catalogue))).toEqual({
      count: 6,
      subtotalCents: 114750 + 5997, // 1.207,47 €
      listTotalCents: 135000 + 5997, // 1.409,97 €
      savingsCents: 20250, // (450 − 382,50) × 3
    });
  });

  it('returns zeros for an empty cart', () => {
    expect(cartTotals([])).toEqual({
      count: 0,
      subtotalCents: 0,
      listTotalCents: 0,
      savingsCents: 0,
    });
  });
});

describe('cartCountLabel (Italian)', () => {
  it.each([
    [0, 'Nessun articolo nel carrello'],
    [1, '1 articolo nel carrello'],
    [3, '3 articoli nel carrello'],
  ])('%d → "%s"', (n, label) => {
    expect(cartCountLabel(n)).toBe(label);
  });
});

describe('hydrate action', () => {
  it('replaces the whole state', () => {
    const next = { items: [{ productId: 'x', quantity: 2 }] };
    expect(cartReducer(EMPTY_CART, { type: 'hydrate', state: next })).toEqual(next);
  });
});

describe('parseStoredCart (localStorage → state, defensive)', () => {
  const valid = new Set(['a', 'b']);

  it('returns an empty cart for null, invalid JSON or a wrong shape', () => {
    expect(parseStoredCart(null, valid)).toEqual(EMPTY_CART);
    expect(parseStoredCart('{not json', valid)).toEqual(EMPTY_CART);
    expect(parseStoredCart('"hello"', valid)).toEqual(EMPTY_CART);
    expect(parseStoredCart('{"items":"nope"}', valid)).toEqual(EMPTY_CART);
  });

  it('keeps valid lines, drops unknown ids and malformed entries, clamps quantities', () => {
    const raw = JSON.stringify({
      version: 1,
      items: [
        { productId: 'a', quantity: 2 },
        { productId: 'ghost', quantity: 1 },
        { productId: 'b', quantity: 500 },
        { productId: 'a', quantity: 1 }, // duplicate → merged
        { productId: 'b' },
        null,
        { productId: 'b', quantity: -3 },
        { productId: 'a', quantity: 2.7 },
      ],
    });
    expect(parseStoredCart(raw, valid)).toEqual({
      items: [
        { productId: 'a', quantity: 5 },
        { productId: 'b', quantity: 99 },
      ],
    });
  });

  it('round-trips with serializeCart', () => {
    const state = { items: [{ productId: 'a', quantity: 2 }] };
    expect(parseStoredCart(serializeCart(state), valid)).toEqual(state);
  });
});

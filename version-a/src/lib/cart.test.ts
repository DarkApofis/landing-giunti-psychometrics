import { describe, expect, it } from 'vitest';
import { cartCount, cartReducer, EMPTY_CART } from './cart';

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

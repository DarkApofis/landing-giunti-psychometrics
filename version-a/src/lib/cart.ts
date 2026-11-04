/**
 * Cart state: only product ids and quantities are stored; name, price and image
 * are resolved against the catalogue, so stored data can never become stale.
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: readonly CartItem[];
}

export type CartAction =
  | { type: 'add'; productId: string }
  | { type: 'remove'; productId: string }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'clear' };

export const EMPTY_CART: CartState = { items: [] };
export const MAX_QUANTITY = 99;

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(n)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((i) => i.productId === action.productId);
      if (!existing)
        return { items: [...state.items, { productId: action.productId, quantity: 1 }] };
      return cartReducer(state, {
        type: 'setQuantity',
        productId: action.productId,
        quantity: existing.quantity + 1,
      });
    }
    case 'setQuantity': {
      const quantity = clamp(action.quantity);
      if (quantity === 0)
        return cartReducer(state, { type: 'remove', productId: action.productId });
      return {
        items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity } : i)),
      };
    }
    case 'remove':
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case 'clear':
      return EMPTY_CART;
  }
}

export function cartCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

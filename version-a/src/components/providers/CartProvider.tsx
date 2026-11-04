'use client';

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { cartCount, cartReducer, EMPTY_CART, type CartAction, type CartState } from '@/lib/cart';

interface CartContextValue extends CartState {
  count: number;
  dispatch: (action: CartAction) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * In-memory cart (PLAN 4.1). Persistence, the header counter and the drawer
 * are added in the cart task; the reducer is already the final one (lib/cart.ts).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const value = useMemo(() => ({ ...state, count: cartCount(state), dispatch }), [state]);
  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside <CartProvider>');
  return value;
}

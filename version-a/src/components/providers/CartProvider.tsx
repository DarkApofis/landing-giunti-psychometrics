'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  cartLines,
  cartReducer,
  cartTotals,
  EMPTY_CART,
  parseStoredCart,
  serializeCart,
  STORAGE_KEY,
  type CartAction,
  type CartLine,
  type CartState,
  type CartTotals,
} from '@/lib/cart';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Product } from '@/types/product';

interface CartContextValue extends CartState {
  lines: readonly CartLine[];
  totals: CartTotals;
  /** False until the persisted cart has been read (SSR and first client render show an empty cart). */
  hydrated: boolean;
  dispatch: (action: CartAction) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Minimal cart store: useReducer + context (no state library needed for one list).
 *
 * Hydration: the server and the first client render always use the empty cart, so the markup
 * matches; the persisted cart is read in an effect afterwards (no hydration mismatch).
 * Persistence is best-effort (lib/storage.ts never throws) and syncs across tabs via `storage`.
 */
export function CartProvider({
  products,
  children,
}: {
  products: readonly Product[];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const validIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  // Read once after mount, and whenever another tab changes the cart.
  useEffect(() => {
    const load = () =>
      dispatch({ type: 'hydrate', state: parseStoredCart(readStorage(STORAGE_KEY), validIds) });
    load();
    // Syncing from an external system (localStorage) after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    // key === null: another tab ran localStorage.clear().
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [validIds]);

  // Write only real differences: a state just read from storage (this mount, another tab) is not
  // echoed back, and an empty cart with nothing stored creates no key. No one-shot flag to get stuck.
  useEffect(() => {
    if (!hydrated) return;
    const stored = readStorage(STORAGE_KEY);
    const next = serializeCart(state);
    if (stored === next || (stored === null && state.items.length === 0)) return;
    writeStorage(STORAGE_KEY, next);
  }, [state, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = cartLines(state, products);
    return {
      ...state,
      lines,
      totals: cartTotals(lines),
      hydrated,
      dispatch,
      isOpen,
      openCart,
      closeCart,
    };
  }, [state, products, hydrated, isOpen, openCart, closeCart]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside <CartProvider>');
  return value;
}

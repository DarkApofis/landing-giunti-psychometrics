'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { cartCountLabel } from '@/lib/cart';

export const CART_DRAWER_ID = 'cart-drawer';

/**
 * Header cart button + count badge (DESIGN-SPEC §6.7).
 * The polite live region announces "1 articolo nel carrello" when the count changes —
 * but not when the persisted cart is restored on page load (that would be noise).
 */
export function CartButton() {
  const { totals, hydrated, openCart } = useCart();
  const count = totals.count;

  // Previous count kept in state and updated during render (React's "adjust state on prop
  // change" pattern): the first hydrated value is the baseline and is not announced.
  const [seen, setSeen] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  if (hydrated && seen === null) {
    setSeen(count);
  } else if (hydrated && seen !== null && seen !== count) {
    setSeen(count);
    setAnnouncement(cartCountLabel(count));
  }

  const label =
    count === 0
      ? 'Apri il carrello, nessun articolo'
      : `Apri il carrello, ${cartCountLabel(count)}`;

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-controls={CART_DRAWER_ID}
        onClick={openCart}
        className="relative grid size-11 cursor-pointer place-items-center rounded-md text-ink transition-colors duration-(--duration-fast) hover:bg-primary-subtle"
      >
        <ShoppingBag aria-hidden="true" className="size-6" />
        {hydrated && count > 0 && (
          // Accent fill + ink text = 4.99:1 (DESIGN-SPEC §1.3). Absolutely positioned: no layout shift.
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-display text-xs font-bold text-ink tabular-nums"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}

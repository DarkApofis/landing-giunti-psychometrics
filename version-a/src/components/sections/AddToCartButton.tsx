'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAnnounce } from '@/components/providers/Announcer';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui/Button';

const FEEDBACK_MS = 2000;

/**
 * Adds a product and confirms it for ~2s ("Aggiunto") plus a polite announcement.
 * The accessible name always contains the visible text and the product name (unique per card).
 */
export function AddToCartButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { dispatch } = useCart();
  const announce = useAnnounce();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function handleClick() {
    dispatch({ type: 'add', productId });
    announce(`${productName} aggiunto al carrello`);
    setAdded(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), FEEDBACK_MS);
  }

  return (
    <Button
      onClick={handleClick}
      aria-label={`${added ? 'Aggiunto al carrello' : 'Aggiungi al carrello'}: ${productName}`}
      className={className}
    >
      {added ? (
        <Check aria-hidden="true" className="size-5" />
      ) : (
        <ShoppingBag aria-hidden="true" className="size-5" />
      )}
      {added ? 'Aggiunto al carrello' : 'Aggiungi al carrello'}
    </Button>
  );
}

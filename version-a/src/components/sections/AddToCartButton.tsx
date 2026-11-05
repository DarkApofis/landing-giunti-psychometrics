'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAnnounce } from '@/components/providers/Announcer';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { MAX_QUANTITY } from '@/lib/cart';

const FEEDBACK_MS = 2000;

/**
 * Adds a product and confirms it for ~2s ("Aggiunto") plus a polite announcement. At the maximum
 * quantity nothing is added, so it says that instead ("Quantità massima raggiunta").
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
  const { dispatch, items } = useCart();
  const announce = useAnnounce();
  const [feedback, setFeedback] = useState<'added' | 'max' | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function handleClick() {
    const quantity = items.find((item) => item.productId === productId)?.quantity ?? 0;
    if (quantity >= MAX_QUANTITY) {
      announce(`${productName}: quantità massima (${MAX_QUANTITY}) già nel carrello`);
      setFeedback('max');
    } else {
      dispatch({ type: 'add', productId });
      announce(`${productName} aggiunto al carrello`);
      setFeedback('added');
    }
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFeedback(null), FEEDBACK_MS);
  }

  const label =
    feedback === 'added'
      ? 'Aggiunto al carrello'
      : feedback === 'max'
        ? 'Quantità massima raggiunta'
        : 'Aggiungi al carrello';

  return (
    <Button onClick={handleClick} aria-label={`${label}: ${productName}`} className={className}>
      {feedback === 'added' ? (
        <Check aria-hidden="true" className="size-5" />
      ) : (
        <ShoppingBag aria-hidden="true" className="size-5" />
      )}
      {label}
    </Button>
  );
}

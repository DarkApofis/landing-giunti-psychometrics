'use client';

import { ShoppingBag, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAnnounce } from '@/components/providers/Announcer';
import { useCart } from '@/components/providers/CartProvider';
import { Button, buttonClasses } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { cartCopy } from '@/data/cart';
import { SECTION_IDS } from '@/data/navigation';
import { useModalDialog } from '@/hooks/useModalDialog';
import { MAX_QUANTITY, type CartLine } from '@/lib/cart';
import { formatDate, formatPrice } from '@/lib/format';
import { CART_DRAWER_ID } from './CartButton';
import { CatalogLink } from './CatalogLink';

const euros = (cents: number) => formatPrice(cents / 100);

/**
 * Cart drawer (DESIGN-SPEC §6.7): native modal <dialog> sliding in from the right.
 * Focus: initial on "Chiudi il carrello"; after removing a line it moves to the next line
 * (or the previous one, or the empty-state action), never to <body>.
 */
export function CartDrawer() {
  const { lines, totals, isOpen, closeCart, dispatch } = useCart();
  const announce = useAnnounce();
  const { dialogProps, closeWithoutReturningFocus } = useModalDialog(isOpen, closeCart);

  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const emptyActionRef = useRef<HTMLAnchorElement>(null);
  const [focusAfterRemoval, setFocusAfterRemoval] = useState<string | 'empty' | null>(null);

  useEffect(() => {
    if (focusAfterRemoval === null) return;
    if (focusAfterRemoval === 'empty') emptyActionRef.current?.focus();
    else removeRefs.current.get(focusAfterRemoval)?.focus();
    // Focus has been placed; reset the one-shot request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusAfterRemoval(null);
  }, [focusAfterRemoval]);

  function removeLine(line: CartLine, index: number) {
    const neighbour = lines[index + 1] ?? lines[index - 1];
    dispatch({ type: 'remove', productId: line.product.id });
    announce(cartCopy.removed(line.product.name));
    setFocusAfterRemoval(neighbour ? neighbour.product.id : 'empty');
  }

  function clearCart() {
    dispatch({ type: 'clear' });
    announce(cartCopy.cleared);
    setFocusAfterRemoval('empty');
  }

  return (
    <dialog
      {...dialogProps}
      id={CART_DRAWER_ID}
      aria-labelledby="cart-title"
      className={
        'fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(26rem,100vw)] max-w-none bg-surface p-0 text-ink shadow-overlay backdrop:bg-backdrop ' +
        'transition-transform duration-(--duration-enter) ease-(--ease-standard) starting:open:translate-x-full'
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <h2 id="cart-title" className="text-xl font-bold">
            {cartCopy.title}{' '}
            <span className="font-sans text-base font-normal text-ink-muted">({totals.count})</span>
          </h2>
          <button
            type="button"
            aria-label={cartCopy.close}
            onClick={closeCart}
            className="grid size-11 cursor-pointer place-items-center rounded-md text-ink transition-colors duration-(--duration-fast) hover:bg-primary-subtle"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary-subtle text-primary">
              <ShoppingBag aria-hidden="true" className="size-8" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold">{cartCopy.empty.title}</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">{cartCopy.empty.text}</p>
            <CatalogLink
              ref={emptyActionRef}
              href={`#${SECTION_IDS.catalog}`}
              category="formazione"
              onNavigate={closeWithoutReturningFocus}
              className={buttonClasses('primary', 'md', 'mt-6')}
            >
              {cartCopy.empty.action}
            </CatalogLink>
          </div>
        ) : (
          <>
            <ul
              className="flex-1 divide-y divide-border overflow-y-auto px-5"
              aria-label={cartCopy.listLabel}
            >
              {lines.map((line, index) => (
                <li key={line.product.id} className="flex gap-4 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-primary-subtle">
                    <Image
                      src={line.product.image.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-semibold">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {line.product.format} ·{' '}
                      <time dateTime={line.product.startDate}>
                        {formatDate(line.product.startDate, 'short')}
                      </time>
                    </p>
                    <p className="mt-1 text-sm text-ink-muted tabular-nums">
                      {euros(line.unitCents)} <span className="sr-only">cad.</span>
                      <span aria-hidden="true">/ cad.</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        max={MAX_QUANTITY}
                        itemName={line.product.name}
                        onChange={(quantity) =>
                          dispatch({ type: 'setQuantity', productId: line.product.id, quantity })
                        }
                      />
                      <p className="font-display font-bold tabular-nums">
                        <span className="sr-only">Totale riga: </span>
                        {euros(line.lineCents)}
                      </p>
                    </div>
                    <button
                      ref={(el) => {
                        if (el) removeRefs.current.set(line.product.id, el);
                        else removeRefs.current.delete(line.product.id);
                      }}
                      type="button"
                      aria-label={cartCopy.remove(line.product.name)}
                      onClick={() => removeLine(line, index)}
                      className="mt-1 -ml-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-medium text-danger transition-colors duration-(--duration-fast) hover:bg-danger-subtle"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Rimuovi
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-5">
              <dl className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <dt className="font-display font-semibold">{cartCopy.subtotal}</dt>
                  <dd className="font-display text-price font-bold tabular-nums">
                    {euros(totals.subtotalCents)}
                  </dd>
                </div>
                {totals.savingsCents > 0 && (
                  <div className="flex items-baseline justify-between text-sm text-success">
                    <dt>{cartCopy.savings}</dt>
                    <dd className="font-semibold tabular-nums">−{euros(totals.savingsCents)}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-1 text-xs text-ink-muted">{cartCopy.vat}</p>

              <Button aria-describedby="cart-demo-note" className="mt-4 w-full">
                {cartCopy.checkout}
              </Button>
              <p id="cart-demo-note" className="mt-2 text-center text-xs text-ink-muted">
                {cartCopy.demoNote}
              </p>
              <Button variant="ghost-danger" onClick={clearCart} className="mt-2 w-full">
                <Trash2 aria-hidden="true" className="size-4" />
                {cartCopy.clear}
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

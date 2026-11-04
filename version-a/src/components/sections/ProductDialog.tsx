'use client';

import { Mail, X } from 'lucide-react';
import Image from 'next/image';
import { buttonClasses } from '@/components/ui/Button';
import { FormatBadge } from '@/components/ui/FormatBadge';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/data/navigation';
import { qualifications } from '@/data/qualifications';
import { useModalDialog } from '@/hooks/useModalDialog';
import { formatAgeRange } from '@/lib/format';
import type { TestProduct } from '@/types/product';

interface ProductDialogProps {
  product: TestProduct | null;
  categoryLabel: string;
  onClose: () => void;
}

/**
 * "Scopri di più" for tests: a native modal <dialog> driven by useModalDialog (focus trap, Esc,
 * backdrop click, focus return). Tests are not sold through the cart: they require a professional
 * qualification check, so the dialog explains the requirement and routes to the contact form.
 */
export function ProductDialog({ product, categoryLabel, onClose }: ProductDialogProps) {
  const { ref, dialogProps, closeWithoutReturningFocus } = useModalDialog(
    product !== null,
    onClose,
  );

  const titleId = product ? `dialog-${product.id}-title` : undefined;

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-lg bg-surface p-0 text-ink shadow-overlay backdrop:bg-backdrop"
    >
      {product && (
        <div className="relative">
          {/* First in DOM order so showModal() puts initial focus on "Chiudi", not on the purchase action. */}
          <button
            type="button"
            aria-label="Chiudi"
            onClick={() => ref.current?.close()}
            className="absolute top-3 right-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-surface text-ink shadow-card transition-colors duration-(--duration-fast) hover:bg-primary-subtle"
          >
            <X aria-hidden="true" className="size-5" />
          </button>

          <div className="relative aspect-[16/7] bg-primary-subtle">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              sizes="(min-width: 672px) 640px, calc(100vw - 2rem)"
              className="object-cover"
            />
            <FormatBadge format={product.format} className="absolute top-3 left-3" />
          </div>

          <div className="p-6">
            <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-ink-muted uppercase">
              {categoryLabel}
            </p>
            <h2 id={titleId} className="mt-2 text-2xl leading-tight font-bold">
              {product.name}
            </h2>
            <p className="mt-3 text-ink-muted">{product.description}</p>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-ink-muted">Autore</dt>
              <dd className="font-medium">{product.author}</dd>
              <dt className="text-ink-muted">Età</dt>
              <dd className="font-medium">{formatAgeRange(product.ageRange)}</dd>
              <dt className="text-ink-muted">Somministrazione</dt>
              <dd className="font-medium">circa {product.administrationMinutes} minuti</dd>
              <dt className="text-ink-muted">Formato</dt>
              <dd className="font-medium">{product.format}</dd>
            </dl>

            <div className="mt-5 rounded-md border border-primary/30 bg-primary-subtle p-4 text-sm">
              <p className="font-display font-semibold">
                {qualifications[product.qualification].label}
              </p>
              <p className="mt-1 text-ink">{qualifications[product.qualification].description}</p>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Price
                  originalPrice={product.originalPrice}
                  discountPrice={product.discountPrice}
                />
                <p className="mt-1 text-xs text-ink-muted">
                  IVA inclusa · acquisto previa verifica della qualifica
                </p>
              </div>
              <a
                href={`#${SECTION_IDS.contact}`}
                onClick={closeWithoutReturningFocus}
                className={buttonClasses('primary')}
              >
                <Mail aria-hidden="true" className="size-5" />
                Richiedi informazioni
              </a>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

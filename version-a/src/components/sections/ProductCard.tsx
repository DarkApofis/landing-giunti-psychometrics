import { Info } from 'lucide-react';
import Image from 'next/image';
import { memo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { FormatBadge } from '@/components/ui/FormatBadge';
import { Price } from '@/components/ui/Price';
import { qualifications } from '@/data/qualifications';
import { cn } from '@/lib/cn';
import { formatAgeRange, formatDate } from '@/lib/format';
import type { Product } from '@/types/product';
import { AddToCartButton } from './AddToCartButton';

/**
 * Rendered width of a card image per breakpoint (container 75rem, gutters and gaps from DESIGN-SPEC §3):
 * ≥1280: (1200 − 64 − 2×32) / 3 ≈ 357px · ≥1024: ~31vw · ≥768: ~46vw · mobile: 100vw − 32px.
 */
export const PRODUCT_IMAGE_SIZES =
  '(min-width: 1280px) 360px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 2rem)';

interface ProductCardProps {
  product: Product;
  categoryLabel: string;
  /** Opens the details dialog (tests). Must be referentially stable for memo to help. */
  onShowDetails: (productId: string) => void;
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

/**
 * Product card (DESIGN-SPEC §6.2). Memoised: typing in the search re-renders the catalogue,
 * but cards that stay visible receive the same props and are skipped
 * (verified in Catalog.test.tsx — "does not re-render visible cards").
 */
export const ProductCard = memo(function ProductCard({
  product,
  categoryLabel,
  onShowDetails,
}: ProductCardProps) {
  const titleId = `product-${product.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card',
        'transition-[box-shadow,border-color,translate] duration-(--duration-base) ease-(--ease-standard)',
        'hover:border-primary/40 hover:shadow-card-hover motion-safe:hover:-translate-y-0.5',
        'focus-within:border-primary',
      )}
    >
      <div className="relative aspect-3/2 overflow-hidden bg-primary-subtle">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={PRODUCT_IMAGE_SIZES}
          className="object-cover transition-transform duration-(--duration-base) ease-(--ease-standard) motion-safe:group-hover:scale-[1.03]"
        />
        <FormatBadge format={product.format} className="absolute top-3 left-3" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-ink-muted uppercase">
          {categoryLabel}
        </p>
        <h3 id={titleId} className="mt-2 text-lg leading-snug font-semibold text-ink">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-ink-muted">{product.description}</p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {product.type === 'test' ? (
            <>
              <Meta label="Autore">{product.author}</Meta>
              <Meta label="Età">{formatAgeRange(product.ageRange)}</Meta>
              <Meta label="Qualifica">
                {qualifications[product.qualification].label.replace('Qualifica ', '')}
              </Meta>
              <Meta label="Durata">{product.administrationMinutes} min</Meta>
            </>
          ) : (
            <>
              <Meta label="Docente">{product.instructor}</Meta>
              <Meta label="Inizio">
                <time dateTime={product.startDate}>{formatDate(product.startDate)}</time>
              </Meta>
              <Meta label="Durata">
                {product.durationHours} ore
                {product.ecmCredits !== null && ` · ${product.ecmCredits} crediti ECM`}
              </Meta>
              <Meta label="Sede">{product.location ?? 'Online'}</Meta>
            </>
          )}
        </dl>

        <div className="mt-auto pt-5">
          <div className="border-t border-border pt-4">
            <Price originalPrice={product.originalPrice} discountPrice={product.discountPrice} />
            <p className="mt-1 text-xs text-ink-muted">IVA inclusa</p>
          </div>
          <div className="mt-4">
            {product.type === 'test' ? (
              <Button
                variant="secondary"
                className="w-full"
                aria-haspopup="dialog"
                aria-label={`Scopri di più: ${product.name}`}
                onClick={() => onShowDetails(product.id)}
              >
                <Info aria-hidden="true" className="size-5" />
                Scopri di più
              </Button>
            ) : (
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                className="w-full"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

import { cn } from '@/lib/cn';
import { discountPercent, formatPrice } from '@/lib/format';

interface PriceProps {
  originalPrice: number;
  discountPrice: number | null;
  className?: string;
}

/**
 * Price hierarchy (DESIGN-SPEC §6.2): final price 24/700 → struck original 14 → saving chip.
 * Screen readers hear "Prezzo scontato …, prezzo originale …, risparmi il 15%".
 */
export function Price({ originalPrice, discountPrice, className }: PriceProps) {
  const percent = discountPercent(originalPrice, discountPrice);

  if (percent === null || discountPrice === null) {
    return (
      <p className={cn('font-display text-price font-bold text-ink tabular-nums', className)}>
        <span className="sr-only">Prezzo: </span>
        {formatPrice(originalPrice)}
      </p>
    );
  }

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className="font-display text-price font-bold text-ink tabular-nums">
        <span className="sr-only">Prezzo scontato: </span>
        {formatPrice(discountPrice)}
      </span>
      <span className="text-sm text-ink-muted tabular-nums">
        <span className="sr-only">, prezzo originale: </span>
        <s>{formatPrice(originalPrice)}</s>
      </span>
      <span className="self-center rounded-full bg-accent-subtle px-2 py-0.5 font-display text-xs font-bold text-ink tabular-nums">
        <span aria-hidden="true">−{percent}%</span>
        <span className="sr-only">, risparmi il {percent}%</span>
      </span>
    </p>
  );
}

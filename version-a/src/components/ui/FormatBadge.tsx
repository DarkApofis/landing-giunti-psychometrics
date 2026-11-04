import { BookOpen, CirclePlay, MapPin, MonitorSmartphone, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProductFormat } from '@/types/product';

// DESIGN-SPEC §1.2: icon + text + tint (never colour alone). All pairs ≥ 7.3:1.
const FORMAT_STYLES: Record<ProductFormat, { icon: LucideIcon; className: string }> = {
  Cartaceo: {
    icon: BookOpen,
    className: 'bg-format-cartaceo-subtle text-format-cartaceo border-format-cartaceo/20',
  },
  Digitale: {
    icon: MonitorSmartphone,
    className: 'bg-format-digitale-subtle text-format-digitale border-format-digitale/20',
  },
  'Corso online': {
    icon: CirclePlay,
    className: 'bg-format-online-subtle text-format-online border-format-online/20',
  },
  'In presenza': {
    icon: MapPin,
    className: 'bg-format-presenza-subtle text-format-presenza border-format-presenza/20',
  },
};

export function FormatBadge({ format, className }: { format: ProductFormat; className?: string }) {
  const { icon: Icon, className: tint } = FORMAT_STYLES[format];
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-display text-xs font-semibold whitespace-nowrap',
        tint,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      <span>
        <span className="sr-only">Formato: </span>
        {format}
      </span>
    </span>
  );
}

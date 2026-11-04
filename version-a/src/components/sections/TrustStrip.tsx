import { BadgeCheck, Headset, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { trustItems, type TrustItemId } from '@/data/trust';

const ICONS: Record<TrustItemId, LucideIcon> = {
  spedizione: Truck,
  pagamenti: ShieldCheck,
  validati: BadgeCheck,
  assistenza: Headset,
};

/** Trust strip: 2 columns on mobile/tablet, 4 on desktop. Decorative icons are aria-hidden. */
export function TrustStrip() {
  return (
    <section aria-labelledby="trust-title" className="border-y border-border bg-surface">
      <h2 id="trust-title" className="sr-only">
        Perché sceglierci
      </h2>
      <ul className="container-page grid grid-cols-1 gap-x-6 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <li key={item.id} className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

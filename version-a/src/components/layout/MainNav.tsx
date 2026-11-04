import type { NavItem } from '@/data/navigation';
import { cn } from '@/lib/cn';
import { CatalogLink } from './CatalogLink';

const linkClass = cn(
  'inline-flex min-h-11 items-center rounded-md px-3 font-display font-medium text-ink',
  'transition-colors duration-(--duration-fast) hover:bg-primary-subtle hover:text-primary',
);

/** Desktop navigation (≥1024px). Below that breakpoint the MobileMenu renders the same items. */
export function MainNav({ items, className }: { items: readonly NavItem[]; className?: string }) {
  return (
    <nav aria-label="Navigazione principale" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.label}>
            {item.category ? (
              <CatalogLink href={item.href} category={item.category} className={linkClass}>
                {item.label}
              </CatalogLink>
            ) : (
              <a href={item.href} className={linkClass}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

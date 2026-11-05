'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode, Ref } from 'react';
import { useCatalogFilters } from '@/components/providers/CatalogFiltersProvider';
import { hrefFromOtherPage } from '@/lib/catalog';
import type { CategoryFilter } from '@/types/product';

interface CatalogLinkProps {
  href: string;
  /** Category to apply when the link is followed (e.g. "Formazione"). */
  category?: CategoryFilter;
  onNavigate?: () => void;
  className?: string;
  ref?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}

/**
 * Plain in-page anchor that also applies a catalogue category. The browser still performs the
 * native jump/smooth scroll to the hash (no JS needed for that); without JS it simply scrolls.
 * On other pages (/chi-siamo, /faq…) the home sections do not exist: the link then goes to the
 * home, with the category in the URL (`/?categoria=formazione#catalogo`).
 */
export function CatalogLink({
  href,
  category,
  onNavigate,
  className,
  ref,
  children,
}: CatalogLinkProps) {
  const { setCategory } = useCatalogFilters();
  const onHome = usePathname() === '/';
  return (
    <a
      ref={ref}
      href={onHome ? href : hrefFromOtherPage(href, category)}
      className={className}
      onClick={() => {
        if (category) setCategory(category);
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}

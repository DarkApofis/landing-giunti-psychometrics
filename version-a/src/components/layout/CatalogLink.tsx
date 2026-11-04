'use client';

import type { ReactNode } from 'react';
import { useCatalogFilters } from '@/components/providers/CatalogFiltersProvider';
import type { CategoryFilter } from '@/types/product';

interface CatalogLinkProps {
  href: string;
  /** Category to apply when the link is followed (e.g. "Formazione"). */
  category?: CategoryFilter;
  onNavigate?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Plain in-page anchor that also applies a catalogue category. The browser still performs the
 * native jump/smooth scroll to the hash (no JS needed for that); without JS it simply scrolls.
 */
export function CatalogLink({ href, category, onNavigate, className, children }: CatalogLinkProps) {
  const { setCategory } = useCatalogFilters();
  return (
    <a
      href={href}
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

'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CatalogFilters } from '@/lib/catalog';
import type { CategoryFilter } from '@/types/product';

interface CatalogFiltersContextValue extends CatalogFilters {
  setCategory: (category: CategoryFilter) => void;
  setQuery: (query: string) => void;
  reset: () => void;
}

const CatalogFiltersContext = createContext<CatalogFiltersContextValue | null>(null);

/**
 * Shared catalogue filter state (category + search query).
 *
 * Why a context and not "lifting state" into a client container:
 * the search box lives in <header> and the grid in <main>, far apart in the tree.
 * A client container owning the state would have to wrap — and turn into client
 * code — everything in between (Hero, Footer…). A provider only needs `children`,
 * so those sections stay Server Components and only the islands that read the
 * context (SearchBox, Catalog) are client components.
 */
export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<CategoryFilter>('tutti');
  const [query, setQuery] = useState('');

  const value = useMemo<CatalogFiltersContextValue>(
    () => ({
      category,
      query,
      setCategory,
      setQuery,
      reset: () => {
        setCategory('tutti');
        setQuery('');
      },
    }),
    [category, query],
  );

  return <CatalogFiltersContext value={value}>{children}</CatalogFiltersContext>;
}

export function useCatalogFilters(): CatalogFiltersContextValue {
  const value = useContext(CatalogFiltersContext);
  if (!value) throw new Error('useCatalogFilters must be used inside <CatalogFiltersProvider>');
  return value;
}

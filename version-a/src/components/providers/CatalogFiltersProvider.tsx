'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_FILTERS, filtersToSearch, parseFilters, type CatalogFilters } from '@/lib/catalog';
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
 * so those sections stay Server Components (see ASSUMPTIONS A21).
 *
 * URL sync (?categoria=…&q=…) uses the native History API, which Next.js integrates
 * with its router: no navigation, no reload, no server round-trip. The page stays
 * static, so the URL is read after hydration (SSR always renders "Tutti").
 */
export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const urlRead = useRef(false);

  // NOTE: effect order matters. This writer is declared first so that, on mount,
  // it runs before the reader below and does not overwrite the incoming URL.
  useEffect(() => {
    if (!urlRead.current) return;
    const { pathname, search, hash } = window.location;
    const nextSearch = filtersToSearch(filters);
    if (nextSearch !== search) {
      window.history.replaceState(window.history.state, '', `${pathname}${nextSearch}${hash}`);
    }
  }, [filters]);

  useEffect(() => {
    urlRead.current = true;
    const fromUrl = parseFilters(window.location.search);
    if (fromUrl.category !== DEFAULT_FILTERS.category || fromUrl.query !== DEFAULT_FILTERS.query) {
      // Syncing from an external system (the URL) once after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters(fromUrl);
    }
  }, []);

  const setCategory = useCallback(
    (category: CategoryFilter) => setFilters((prev) => ({ ...prev, category })),
    [],
  );
  const setQuery = useCallback((query: string) => setFilters((prev) => ({ ...prev, query })), []);
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const value = useMemo<CatalogFiltersContextValue>(
    () => ({ ...filters, setCategory, setQuery, reset }),
    [filters, setCategory, setQuery, reset],
  );

  return <CatalogFiltersContext value={value}>{children}</CatalogFiltersContext>;
}

export function useCatalogFilters(): CatalogFiltersContextValue {
  const value = useContext(CatalogFiltersContext);
  if (!value) throw new Error('useCatalogFilters must be used inside <CatalogFiltersProvider>');
  return value;
}

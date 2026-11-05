'use client';

import { usePathname } from 'next/navigation';
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
  // The provider lives in the root layout, but only the home has a catalogue: the URL is read and
  // written there only. Other pages submit the search natively (GET /?q=…), see SearchBox.
  const onHome = usePathname() === '/';

  // NOTE: effect order matters. This writer is declared first so that, on mount,
  // it runs before the reader below and does not overwrite the incoming URL.
  useEffect(() => {
    if (!onHome) {
      urlRead.current = false; // back on the home, the reader goes first again
      return;
    }
    if (!urlRead.current) return;
    const { pathname, search, hash } = window.location;
    const nextSearch = filtersToSearch(filters, search);
    if (nextSearch !== search) {
      window.history.replaceState(window.history.state, '', `${pathname}${nextSearch}${hash}`);
    }
  }, [filters, onHome]);

  // After hydration, and again on every client navigation back to the home (Logo, footer links),
  // the URL wins: otherwise a query typed on /faq would filter the grid behind a clean URL.
  useEffect(() => {
    if (!onHome) return;
    urlRead.current = true;
    const fromUrl = parseFilters(window.location.search);
    // Syncing from an external system (the URL).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) =>
      prev.category === fromUrl.category && prev.query === fromUrl.query ? prev : fromUrl,
    );
  }, [onHome]);

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

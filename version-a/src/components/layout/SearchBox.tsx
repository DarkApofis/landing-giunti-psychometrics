'use client';

import { Search, X } from 'lucide-react';
import { useId, useRef, type SubmitEvent } from 'react';
import { useCatalogFilters } from '@/components/providers/CatalogFiltersProvider';
import { SECTION_IDS } from '@/data/navigation';
import { cn } from '@/lib/cn';

/**
 * Product search (DESIGN-SPEC §6.4). Filters the grid live through the shared context.
 * Enter scrolls to the catalogue; scroll smoothness follows the CSS `scroll-behavior`,
 * which is only `smooth` without `prefers-reduced-motion: reduce`.
 */
export function SearchBox({ className }: { className?: string }) {
  const { query, setQuery } = useCatalogFilters();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById(SECTION_IDS.catalog)?.scrollIntoView({ block: 'start' });
  }

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <search className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Cerca nel catalogo
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca test o corsi…"
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          className={cn(
            'h-11 w-full rounded-md border border-border-strong bg-surface pr-11 pl-10 text-base text-ink',
            'transition-colors duration-(--duration-fast) placeholder:text-ink-muted hover:border-ink',
            'focus-visible:border-primary',
          )}
        />
        {query !== '' && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Cancella la ricerca"
            className="absolute top-0 right-0 grid size-11 cursor-pointer place-items-center rounded-md text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        )}
      </form>
    </search>
  );
}

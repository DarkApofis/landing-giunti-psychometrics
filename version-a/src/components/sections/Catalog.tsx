'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useCatalogFilters } from '@/components/providers/CatalogFiltersProvider';
import { catalogCopy } from '@/data/catalog';
import { ALL_CATEGORIES_LABEL } from '@/data/categories';
import { countByCategory, filterProducts } from '@/lib/catalog';
import type { Category, Product, TestProduct } from '@/types/product';
import { CategoryFilter } from './CategoryFilter';
import { EmptyState } from './EmptyState';
import { ProductDialog } from './ProductDialog';
import { ProductGrid } from './ProductGrid';
import { ResultsStatus } from './ResultsStatus';

interface CatalogProps {
  products: readonly Product[];
  categories: readonly Category[];
}

/**
 * Client container of the catalogue: reads the shared filters (search lives in the header),
 * derives the visible list with memoised pure functions and owns the details dialog.
 */
export function Catalog({ products, categories }: CatalogProps) {
  const { category, query, setCategory, reset } = useCatalogFilters();
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const allPillRef = useRef<HTMLButtonElement>(null);

  const categoryLabels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.label])) as Record<string, string>,
    [categories],
  );

  const visible = useMemo(
    () => filterProducts(products, { category, query }),
    [products, category, query],
  );
  const counts = useMemo(() => countByCategory(products, query), [products, query]);

  const detailsProduct = useMemo(
    () => products.find((p): p is TestProduct => p.id === detailsId && p.type === 'test') ?? null,
    [products, detailsId],
  );

  // Stable identities so memoised cards are not re-rendered by a new callback each time.
  const showDetails = useCallback((id: string) => setDetailsId(id), []);
  const closeDetails = useCallback(() => setDetailsId(null), []);

  const handleReset = useCallback(() => {
    reset();
    // The empty state (and its button) disappears: move focus somewhere meaningful.
    allPillRef.current?.focus();
  }, [reset]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <CategoryFilter
          label={catalogCopy.filterLabel}
          allLabel={ALL_CATEGORIES_LABEL}
          categories={categories}
          value={category}
          counts={counts}
          onChange={setCategory}
          allRef={allPillRef}
        />
        <div className="shrink-0">
          <ResultsStatus count={visible.length} />
        </div>
      </div>

      <div className="mt-6">
        {visible.length > 0 ? (
          <ProductGrid
            products={visible}
            categoryLabels={categoryLabels}
            onShowDetails={showDetails}
          />
        ) : (
          <EmptyState
            query={query}
            categoryLabel={category === 'tutti' ? null : (categoryLabels[category] ?? null)}
            onReset={handleReset}
          />
        )}
      </div>

      <ProductDialog
        product={detailsProduct}
        categoryLabel={detailsProduct ? (categoryLabels[detailsProduct.category] ?? '') : ''}
        onClose={closeDetails}
      />
    </>
  );
}

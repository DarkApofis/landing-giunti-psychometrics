import { CATEGORY_IDS, type CategoryFilter, type Product } from '@/types/product';
import { matchesQuery } from './search';

export interface CatalogFilters {
  category: CategoryFilter;
  query: string;
}

/**
 * Pure, order-preserving filter: category AND name query.
 * Shared logic for the catalogue island (and portable to version-b).
 */
export function filterProducts<T extends Product>(
  products: readonly T[],
  { category, query }: CatalogFilters,
): T[] {
  return products.filter(
    (p) => (category === 'tutti' || p.category === category) && matchesQuery(p.name, query),
  );
}

/** Number of products per pill, with the current search query applied. */
export function countByCategory(
  products: readonly Product[],
  query: string,
): Record<CategoryFilter, number> {
  const counts = Object.fromEntries([...CATEGORY_IDS, 'tutti'].map((id) => [id, 0])) as Record<
    CategoryFilter,
    number
  >;

  for (const p of filterProducts(products, { category: 'tutti', query })) {
    counts[p.category] += 1;
    counts.tutti += 1;
  }
  return counts;
}

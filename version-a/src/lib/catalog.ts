import { CATEGORY_IDS, type CategoryFilter, type CategoryId, type Product } from '@/types/product';
import { matchesQuery } from './search';
import { SECTION_IDS } from '@/data/navigation';

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

/** Live-region / counter text: "Nessun prodotto trovato", "1 prodotto trovato", "8 prodotti trovati". */
export function resultsLabel(count: number): string {
  if (count === 0) return 'Nessun prodotto trovato';
  return count === 1 ? '1 prodotto trovato' : `${count} prodotti trovati`;
}

// ── URL sync (?categoria=…&q=…) ─────────────────────────────────────────────

export const URL_PARAMS = { category: 'categoria', query: 'q' } as const;
const MAX_QUERY_LENGTH = 100;

export const DEFAULT_FILTERS: CatalogFilters = { category: 'tutti', query: '' };

function isCategoryId(value: string | null): value is CategoryId {
  return value !== null && (CATEGORY_IDS as readonly string[]).includes(value);
}

/** Reads filters from a query string; unknown values fall back to the defaults. */
export function parseFilters(search: string): CatalogFilters {
  const params = new URLSearchParams(search);
  const category = params.get(URL_PARAMS.category);
  return {
    category: isCategoryId(category) ? category : 'tutti',
    query: (params.get(URL_PARAMS.query) ?? '').slice(0, MAX_QUERY_LENGTH),
  };
}

/**
 * Serialises filters onto the current query string: only ?categoria and ?q are rewritten, any other
 * parameter (utm_*, …) is kept. The default state with no other parameters gives "" (clean URL).
 */
export function filtersToSearch({ category, query }: CatalogFilters, currentSearch = ''): string {
  const params = new URLSearchParams(currentSearch);
  params.delete(URL_PARAMS.category);
  params.delete(URL_PARAMS.query);
  if (category !== 'tutti') params.set(URL_PARAMS.category, category);
  const q = query.trim();
  if (q !== '') params.set(URL_PARAMS.query, q);
  const search = params.toString();
  return search === '' ? '' : `?${search}`;
}

// ── Links to the home sections from other pages ─────────────────────────────

/** Sections present on every page (layout): their anchors work as they are. */
const LAYOUT_ANCHORS: readonly string[] = [`#${SECTION_IDS.main}`, `#${SECTION_IDS.resources}`];

/**
 * Href of an in-page link (`#catalogo`, `#contatti`…) when followed from a page other than the
 * home: it points to the home and carries the category through the URL (`/?categoria=…#catalogo`),
 * which the catalogue reads on load. Other hrefs, and anchors to layout sections, are unchanged.
 */
export function hrefFromOtherPage(href: string, category?: CategoryFilter): string {
  if (!href.startsWith('#') || LAYOUT_ANCHORS.includes(href)) return href;
  return `/${filtersToSearch({ ...DEFAULT_FILTERS, category: category ?? 'tutti' })}${href}`;
}

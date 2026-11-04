/**
 * Cart domain logic (pure, framework-free; mirrored by version-b).
 * - State stores only product ids and quantities: names, prices and images are resolved
 *   against the catalogue, so stored data can never become stale.
 * - Money is computed in integer cents to avoid floating-point drift (19.99 × 3 = 59.97000000000001).
 * - Only courses are cartable: tests need a professional-qualification check first ("Scopri di più").
 */
import type { CourseProduct, Product } from '@/types/product';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: readonly CartItem[];
}

export type CartAction =
  | { type: 'add'; productId: string }
  | { type: 'remove'; productId: string }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState };

export const EMPTY_CART: CartState = { items: [] };
export const MAX_QUANTITY = 99;
export const STORAGE_KEY = 'giunti-cart';
const STORAGE_VERSION = 1;

const clamp = (n: number) => Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(n)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((i) => i.productId === action.productId);
      if (!existing)
        return { items: [...state.items, { productId: action.productId, quantity: 1 }] };
      return cartReducer(state, {
        type: 'setQuantity',
        productId: action.productId,
        quantity: existing.quantity + 1,
      });
    }
    case 'setQuantity': {
      const quantity = clamp(action.quantity);
      if (quantity === 0)
        return cartReducer(state, { type: 'remove', productId: action.productId });
      return {
        items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity } : i)),
      };
    }
    case 'remove':
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case 'clear':
      return EMPTY_CART;
    case 'hydrate':
      return action.state;
  }
}

export function cartCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

// ── Money ────────────────────────────────────────────────────────────────────

/** Euros → integer cents. `toFixed(6)` first absorbs binary noise (1.005 × 100 = 100.49999…). */
export function toCents(euros: number): number {
  return Math.round(Number((euros * 100).toFixed(6)));
}

export function isCartable(product: Product): product is CourseProduct {
  return product.type === 'corso';
}

export interface CartLine {
  product: CourseProduct;
  quantity: number;
  /** Price actually paid per unit (discounted when available). */
  unitCents: number;
  /** List price per unit. */
  listUnitCents: number;
  lineCents: number;
}

/** Resolves stored items against the catalogue; unknown or non-cartable ids are skipped. */
export function cartLines(state: CartState, products: readonly Product[]): CartLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return state.items.flatMap((item) => {
    const product = byId.get(item.productId);
    if (!product || !isCartable(product)) return [];
    const unitCents = toCents(product.discountPrice ?? product.originalPrice);
    return [
      {
        product,
        quantity: item.quantity,
        unitCents,
        listUnitCents: toCents(product.originalPrice),
        lineCents: unitCents * item.quantity,
      },
    ];
  });
}

export interface CartTotals {
  count: number;
  subtotalCents: number;
  listTotalCents: number;
  savingsCents: number;
}

export function cartTotals(lines: readonly CartLine[]): CartTotals {
  let count = 0;
  let subtotalCents = 0;
  let listTotalCents = 0;
  for (const line of lines) {
    count += line.quantity;
    subtotalCents += line.lineCents;
    listTotalCents += line.listUnitCents * line.quantity;
  }
  return { count, subtotalCents, listTotalCents, savingsCents: listTotalCents - subtotalCents };
}

/** "Nessun articolo nel carrello" · "1 articolo nel carrello" · "3 articoli nel carrello". */
export function cartCountLabel(count: number): string {
  if (count === 0) return 'Nessun articolo nel carrello';
  return count === 1 ? '1 articolo nel carrello' : `${count} articoli nel carrello`;
}

// ── Persistence ──────────────────────────────────────────────────────────────

export function serializeCart(state: CartState): string {
  return JSON.stringify({ version: STORAGE_VERSION, items: state.items });
}

/**
 * Defensive parse of whatever is in localStorage (it may be corrupted, edited by hand, or from an
 * older catalogue): invalid JSON/shape → empty cart; unknown ids and malformed lines are dropped;
 * duplicate ids are merged; quantities are truncated and clamped to 1–99.
 */
export function parseStoredCart(raw: string | null, validIds: ReadonlySet<string>): CartState {
  if (raw === null) return EMPTY_CART;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_CART;
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { items?: unknown }).items)
  ) {
    return EMPTY_CART;
  }

  const merged = new Map<string, number>();
  for (const entry of (data as { items: unknown[] }).items) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { productId, quantity } = entry as { productId?: unknown; quantity?: unknown };
    if (typeof productId !== 'string' || !validIds.has(productId)) continue;
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) continue;
    const q = Math.trunc(quantity);
    if (q < 1) continue;
    merged.set(productId, (merged.get(productId) ?? 0) + q);
  }
  return {
    items: [...merged].map(([productId, quantity]) => ({ productId, quantity: clamp(quantity) })),
  };
}

import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: readonly Product[];
  categoryLabels: Record<string, string>;
  onShowDetails: (productId: string) => void;
}

/** 1 column < 768px · 2 columns ≥ 768px · 3 columns ≥ 1024px (DESIGN-SPEC §3). Stable keys = product ids. */
export function ProductGrid({ products, categoryLabels, onShowDetails }: ProductGridProps) {
  return (
    <ul role="list" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            categoryLabel={categoryLabels[product.category] ?? ''}
            onShowDetails={onShowDetails}
          />
        </li>
      ))}
    </ul>
  );
}

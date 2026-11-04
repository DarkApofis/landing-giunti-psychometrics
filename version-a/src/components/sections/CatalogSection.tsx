import { catalogCopy } from '@/data/catalog';
import { categories } from '@/data/categories';
import { SECTION_IDS } from '@/data/navigation';
import { products } from '@/data/products';
import { Catalog } from './Catalog';

/** Server shell (heading + intro); the interactive part is the <Catalog> client island. */
export function CatalogSection() {
  return (
    <section
      id={SECTION_IDS.catalog}
      aria-labelledby="catalogo-title"
      className="container-page py-16 lg:py-24"
    >
      <div className="max-w-3xl">
        <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-accent-strong uppercase">
          {catalogCopy.eyebrow}
        </p>
        <h2 id="catalogo-title" className="mt-2 text-h2 font-bold text-ink">
          {catalogCopy.title}
        </h2>
        <p className="mt-3 text-lg text-ink-muted">{catalogCopy.intro}</p>
      </div>
      <Catalog products={products} categories={categories} />
    </section>
  );
}

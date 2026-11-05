#!/usr/bin/env node
/**
 * Exports the typed catalogue and all UI copy to JSON for version-b (Laravel):
 *   docs/handoff/products.json  — exactly src/data/products.ts
 *   docs/handoff/content.json   — categories, qualifications, navigation, copy (hero, catalogue,
 *                                 trust strip, contact form, cart, footer), validation limits and
 *                                 the institutional pages of the footer (src/data/pages.ts)
 * Loads the real TypeScript modules through Vite's SSR loader (Vite ships with Vitest), so the JSON
 * can never drift from the source. src/data/handoff.test.ts fails if the files are stale.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '..', 'docs', 'handoff');

const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
  resolve: { tsconfigPaths: true },
});

try {
  const load = (path) => server.ssrLoadModule(path);
  const [
    { products },
    cat,
    qual,
    nav,
    hero,
    catalog,
    trust,
    contact,
    cart,
    footer,
    site,
    validators,
    pages,
  ] = await Promise.all([
    load('/src/data/products.ts'),
    load('/src/data/categories.ts'),
    load('/src/data/qualifications.ts'),
    load('/src/data/navigation.ts'),
    load('/src/data/hero.ts'),
    load('/src/data/catalog.ts'),
    load('/src/data/trust.ts'),
    load('/src/data/contact.ts'),
    load('/src/data/cart.ts'),
    load('/src/data/footer.ts'),
    load('/src/data/site.ts'),
    load('/src/lib/validators.ts'),
    load('/src/data/pages.ts'),
  ]);

  // Functions in the copy objects become example strings (Blade will interpolate them).
  const plain = (value) =>
    JSON.parse(
      JSON.stringify(value, (_key, v) =>
        typeof v === 'function' ? `ƒ ${v.toString().replace(/\s+/g, ' ')}` : v,
      ),
    );

  const content = plain({
    site: { ...site.site, url: undefined },
    categories: cat.categories,
    allCategoriesLabel: cat.ALL_CATEGORIES_LABEL,
    qualifications: qual.qualifications,
    sectionIds: nav.SECTION_IDS,
    mainNav: nav.mainNav,
    hero: hero.hero,
    heroStats: hero.heroStats,
    catalog: catalog.catalogCopy,
    trust: trust.trustItems,
    contact: { copy: contact.contactCopy, channels: contact.contactChannels },
    validation: { limits: validators.CONTACT_LIMITS, fields: validators.CONTACT_FIELDS },
    cart: cart.cartCopy,
    footer: {
      columns: footer.footerColumns,
      legal: footer.legalLinks,
      social: footer.socialLinks,
      copy: footer.footerCopy,
    },
    pages: { copy: pages.infoPageCopy, list: pages.infoPages },
  });

  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'products.json'), `${JSON.stringify(products, null, 2)}\n`);
  writeFileSync(join(out, 'content.json'), `${JSON.stringify(content, null, 2)}\n`);
  console.log(`✓ export:handoff — ${products.length} products + content → docs/handoff/`);
} finally {
  await server.close();
}

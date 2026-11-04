import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTACT_LIMITS } from '@/lib/validators';
import { categories } from './categories';
import { products } from './products';

/**
 * docs/handoff/*.json feed version-b (Laravel). If the TS data changes, this fails until
 * `npm run export:handoff` is run again, so both versions always share the same dataset.
 */
const handoff = (file: string) =>
  JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'docs', 'handoff', file), 'utf8'));

describe('handoff JSON for version-b is in sync with the TypeScript source', () => {
  it('products.json equals src/data/products.ts', () => {
    expect(handoff('products.json')).toEqual(JSON.parse(JSON.stringify(products)));
  });

  it('content.json has the same categories and validation limits', () => {
    const content = handoff('content.json');
    expect(content.categories).toEqual(categories);
    expect(content.validation.limits).toEqual(CONTACT_LIMITS);
  });
});

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { infoPages } from './pages';

describe('institutional pages', () => {
  it('have unique slugs and headings', () => {
    expect(new Set(infoPages.map((page) => page.slug)).size).toBe(infoPages.length);
    for (const page of infoPages) {
      const headings = page.blocks.map((block) => block.heading);
      expect(new Set(headings).size).toBe(headings.length);
    }
  });

  it('each one has its static route folder in app/(info)', () => {
    for (const { slug } of infoPages) {
      expect(existsSync(join(__dirname, '..', 'app', '(info)', slug, 'page.tsx')), slug).toBe(true);
    }
  });
});

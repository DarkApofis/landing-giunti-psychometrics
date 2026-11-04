import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe in every main state of the page (docs/AUDIT-B.md §2.1), WCAG 2.0/2.1/2.2 A + AA and best practices,
 * at 375 and 1280. Fails on any violation; writes the summary (violations by impact + incomplete checks)
 * to docs/audit-b/axe-states.json.
 */
const OUT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'docs', 'audit-b');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

type State = { id: string; prepare?: (page: Page) => Promise<void> };

const STATES: State[] = [
  { id: 'initial' },
  {
    id: 'filtered',
    async prepare(page) {
      await page.getByRole('group', { name: 'Filtra per categoria' }).getByRole('button', { name: /^Formazione/ }).click();
      await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('valutazione');
    },
  },
  {
    id: 'no-results',
    async prepare(page) {
      await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('zzz');
      await page.getByRole('heading', { name: 'Nessun prodotto trovato' }).waitFor();
    },
  },
  {
    id: 'mobile-menu-open',
    async prepare(page) {
      const toggle = page.getByRole('button', { name: 'Apri il menu' });
      if (await toggle.isVisible()) await toggle.click();
    },
  },
  {
    id: 'details-dialog',
    async prepare(page) {
      await page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).click();
      await page.getByRole('dialog', { name: /NEURA-Q/ }).waitFor();
    },
  },
  {
    id: 'cart-empty',
    async prepare(page) {
      await page.getByRole('button', { name: /^Apri il carrello/ }).click();
      await page.getByRole('dialog', { name: /Il tuo carrello/ }).waitFor();
    },
  },
  {
    id: 'cart-items',
    async prepare(page) {
      await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
      await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).click();
      await page.getByRole('button', { name: /^Apri il carrello/ }).click();
      await page.getByRole('dialog', { name: /Il tuo carrello/ }).getByRole('listitem').nth(1).waitFor();
    },
  },
  {
    id: 'form-errors',
    async prepare(page) {
      await page.getByRole('button', { name: 'Invia messaggio' }).click();
      await page.locator('#contatti').getByRole('alert').waitFor();
    },
  },
  {
    id: 'form-success',
    async prepare(page) {
      await page.getByRole('textbox', { name: /^Nome/ }).fill('Giulia');
      await page.getByRole('textbox', { name: /^Email/ }).fill('giulia@example.it');
      await page.getByRole('textbox', { name: /^Messaggio/ }).fill('Vorrei informazioni su NEURA-Q.');
      await page.getByRole('button', { name: 'Invia messaggio' }).click();
      await page.getByRole('heading', { name: /Grazie!/ }).waitFor();
    },
  },
];

const summary: Record<string, unknown>[] = [];

for (const width of [375, 1280]) {
  for (const state of STATES) {
    test(`axe: ${state.id} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 800 });
      await page.goto('/');
      if (state.prepare) await state.prepare(page);
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      for (const v of results.violations) byImpact[(v.impact ?? 'minor') as keyof typeof byImpact] += v.nodes.length;
      summary.push({
        state: state.id,
        width,
        violations: results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        byImpact,
        passes: results.passes.length,
        incomplete: results.incomplete.map((i) => ({ id: i.id, nodes: i.nodes.length })),
      });
      expect(results.violations).toEqual([]);
    });
  }
}

test.afterAll(() => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'axe-states.json'), `${JSON.stringify(summary, null, 2)}\n`);
});

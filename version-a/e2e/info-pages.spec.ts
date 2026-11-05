import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { infoPages } from '../src/data/pages';
import { VIEWPORTS, hasHorizontalScroll, trackConsoleErrors } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('institutional pages (footer "Azienda", "Assistenza" and legal links)', () => {
  test('footer links open the pages, and the section navigation moves between them', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Chi siamo' }).click();
    await expect(page).toHaveURL(/\/chi-siamo$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Chi siamo' })).toBeVisible();
    await expect(page).toHaveTitle('Chi siamo | Giunti Psychometrics');

    await page
      .getByRole('navigation', { name: 'In questa sezione: Azienda' })
      .getByRole('link', { name: 'Lavora con noi' })
      .click();
    await expect(page).toHaveURL(/\/lavora-con-noi$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Lavora con noi' })).toBeVisible();
  });

  test('from a page, "Formazione" opens the home catalogue already filtered', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/faq');
    await page
      .getByRole('navigation', { name: 'Navigazione principale' })
      .getByRole('link', { name: 'Formazione' })
      .click();
    await expect(page).toHaveURL(/\/\?categoria=formazione#catalogo$/);
    await expect(page.locator('#catalogo').getByRole('article')).toHaveCount(4);
  });

  test('from a page, the search opens the home catalogue filtered by the query', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/spedizioni-e-resi');
    const search = page.getByRole('searchbox', { name: 'Cerca nel catalogo' });
    await search.fill('neura');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/\?q=neura#catalogo$/);
    await expect(page.locator('#catalogo').getByRole('article')).toHaveCount(1);
  });

  test('FAQ answers expand with the keyboard', async ({ page }) => {
    await page.goto('/faq');
    const question = page.getByText('Quali metodi di pagamento accettate?');
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Carta di credito o di debito/)).toBeVisible();
  });

  for (const { slug } of infoPages) {
    test(`/${slug}: no axe violations, no console errors, no horizontal scroll`, async ({
      page,
    }) => {
      const errors = trackConsoleErrors(page);
      for (const viewport of [VIEWPORTS.mobile, VIEWPORTS.desktop]) {
        await page.setViewportSize(viewport);
        await page.goto(`/${slug}`);
        expect(await hasHorizontalScroll(page)).toBe(false);
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }
});

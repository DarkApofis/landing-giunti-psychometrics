import { expect, test } from '@playwright/test';

/**
 * Regression: user text (a name, a search query from the URL) is inserted literally into the lang/it
 * templates. With String.prototype.replace, "$&", "$`" and "$$" were expanded as replacement patterns.
 */
test('the success message shows the name exactly as typed', async ({ page }) => {
  await page.goto('/#contatti');
  await page.getByRole('textbox', { name: /^Nome/ }).fill('Ana $` Co');
  await page.getByRole('textbox', { name: /^Email/ }).fill('ana@example.it');
  await page.getByRole('textbox', { name: /^Messaggio/ }).fill('Vorrei informazioni sui corsi.');
  await page.getByRole('button', { name: 'Invia messaggio' }).click();

  await expect(page.locator('[data-success-body]')).toContainText('Ana $` Co');
});

test('the empty state quotes a URL query with $ patterns literally', async ({ page }) => {
  await page.goto('/?q=' + encodeURIComponent('zz$&$$') + '#catalogo');

  await expect(page.locator('[data-empty-context]')).toContainText('zz$&$$');
});

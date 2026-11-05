import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { VIEWPORTS, focusedLabel, trackConsoleErrors } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const cartButton = (page: Page) => page.getByRole('button', { name: /^Apri il carrello/ });
const drawer = (page: Page) => page.getByRole('dialog', { name: /Il tuo carrello/ });
const countLive = (page: Page) => page.locator('header [role="status"][aria-live="polite"]');

/** Presses Tab until `target` has focus (keyboard only). */
async function tabTo(page: Page, target: Locator, max = 80) {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('target never received focus');
}

test.describe('cart: keyboard only (1280)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('add a course, open the drawer, trap, change quantity, Esc returns focus, remove', async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/');

    // Add "Somministrare e interpretare ATTENTIO-R" (120,00 €) with the keyboard.
    await tabTo(page, page.getByRole('button', { name: /^Aggiungi al carrello: Somministrare/ }));
    await page.keyboard.press('Enter');
    await expect(countLive(page)).toHaveText('1 articolo nel carrello');
    await expect(cartButton(page)).toHaveAccessibleName(
      'Apri il carrello, 1 articolo nel carrello',
    );

    // Back to the header cart button (Shift+Tab all the way up) and open the drawer.
    for (let i = 0; i < 80; i += 1) {
      await page.keyboard.press('Shift+Tab');
      if (await cartButton(page).evaluate((el) => el === document.activeElement)) break;
    }
    await expect(cartButton(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page)).toHaveAttribute('aria-modal', 'true');
    await expect(drawer(page).getByRole('button', { name: 'Chiudi il carrello' })).toBeFocused();

    // Focus is trapped: full cycle forwards and backwards stays inside.
    const cycle = [
      'Diminuisci la quantità di Somministrare e interpretare ATTENTIO-R',
      'Aumenta la quantità di Somministrare e interpretare ATTENTIO-R',
      'Rimuovi Somministrare e interpretare ATTENTIO-R dal carrello',
      'Procedi all’ordine',
      'Svuota il carrello',
      'Chiudi il carrello',
    ];
    for (const label of cycle) {
      await page.keyboard.press('Tab');
      expect(await focusedLabel(page)).toBe(label);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await focusedLabel(page)).toBe('Svuota il carrello');

    // Quantity + with the keyboard → subtotal 240,00 €.
    await tabTo(page, drawer(page).getByRole('button', { name: /^Aumenta la quantità/ }), 10);
    await page.keyboard.press('Enter');
    await expect(drawer(page).getByRole('group', { name: /^Quantità di/ })).toContainText('2');
    await expect(drawer(page)).toContainText('240,00 €');
    await expect(countLive(page)).toHaveText('2 articoli nel carrello');

    // Esc closes and returns focus to the cart button.
    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
    await expect(cartButton(page)).toBeFocused();

    // Reopen and remove the line → empty state, focus on its action.
    await page.keyboard.press('Enter');
    await tabTo(page, drawer(page).getByRole('button', { name: /^Rimuovi/ }), 10);
    await page.keyboard.press('Enter');
    await expect(drawer(page)).toContainText('Il carrello è vuoto');
    await expect(drawer(page).getByRole('link', { name: 'Scopri i corsi' })).toBeFocused();
    await expect(countLive(page)).toHaveText('Nessun articolo nel carrello');

    expect(errors).toEqual([]);
  });

  test('click outside (backdrop) closes and returns focus', async ({ page }) => {
    await page.goto('/');
    await cartButton(page).click();
    await expect(drawer(page)).toBeVisible();
    await page.mouse.click(100, 400); // left of the 26rem drawer = backdrop
    await expect(drawer(page)).toBeHidden();
    await expect(cartButton(page)).toBeFocused();
  });

  test('a text selection that starts inside and ends on the backdrop does not close it', async ({
    page,
  }) => {
    await page.goto('/');
    await cartButton(page).click();
    const box = await drawer(page).getByRole('heading').first().boundingBox();
    if (!box) throw new Error('no heading');
    await page.mouse.move(box.x + 4, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(100, 400, { steps: 5 }); // drag onto the backdrop
    await page.mouse.up();
    await expect(drawer(page)).toBeVisible();
  });

  test('"Scopri i corsi" from the empty cart filters the catalogue to Formazione', async ({
    page,
  }) => {
    await page.goto('/');
    await cartButton(page).click();
    await drawer(page).getByRole('link', { name: 'Scopri i corsi' }).click();
    await expect(drawer(page)).toBeHidden();
    await expect(page.locator('#catalogo').getByRole('article')).toHaveCount(4);
  });
});

test('"Svuota il carrello" is a ghost button in the danger colour (DESIGN-SPEC §6.7)', async ({
  page,
}) => {
  // Regression: a className="text-danger" on the ghost variant lost to its own text-ink.
  await page.goto('/');
  await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
  await cartButton(page).click();
  const clear = drawer(page).getByRole('button', { name: 'Svuota il carrello' });
  await expect(clear).toHaveCSS('color', 'rgb(180, 35, 24)'); // --color-danger #b42318
  await expect(clear).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test.describe('cart: persistence and resilience', () => {
  test('survives a reload without hydration errors and without re-announcing', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
    await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).click();
    await expect(cartButton(page)).toHaveAccessibleName(/2 articoli/);

    await page.reload();
    await expect(cartButton(page)).toHaveAccessibleName(
      'Apri il carrello, 2 articoli nel carrello',
    );
    await expect(countLive(page)).toHaveText(''); // restoring is not announced
    await cartButton(page).click();
    // 382,50 + 493,00 = 875,50 €
    await expect(drawer(page)).toContainText('875,50 €');
    expect(errors).toEqual([]);
  });

  test('works in memory when localStorage throws', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Access denied', 'SecurityError');
        },
      });
    });
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: /^Aggiungi al carrello: Somministrare/ }).click();
    await expect(cartButton(page)).toHaveAccessibleName(
      'Apri il carrello, 1 articolo nel carrello',
    );
    await cartButton(page).click();
    await expect(drawer(page)).toContainText('120,00 €');
    expect(errors).toEqual([]);
  });

  test('a corrupted stored cart is ignored', async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem(
        'giunti-cart',
        '{"items":[{"productId":"neura-q","quantity":"x"}',
      ),
    );
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    await expect(cartButton(page)).toHaveAccessibleName('Apri il carrello, nessun articolo');
    expect(errors).toEqual([]);
  });
});

test.describe('cart: accessibility and layout', () => {
  for (const [name, viewport] of [
    ['375', VIEWPORTS.mobile],
    ['1280', VIEWPORTS.desktop],
  ] as const) {
    test(`axe with the drawer open (empty and with items) at ${name}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await cartButton(page).click();
      await expect(drawer(page)).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations).toEqual([]);

      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
      await cartButton(page).click();
      await expect(drawer(page).getByRole('listitem')).toHaveCount(1);
      expect((await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations).toEqual([]);

      // Drawer fits the viewport; page behind does not scroll.
      const box = (await drawer(page).boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
        'hidden',
      );
    });
  }
});

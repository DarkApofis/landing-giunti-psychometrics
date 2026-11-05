import { expect, test, type Page } from '@playwright/test';

/**
 * B-only checks of HANDOFF §6.4–6.5 that version-a's suites do not cover directly. Behaviour that
 * version-a's e2e already checks (keyboard flow, Esc, persistence, corrupted storage, axe) runs from
 * version-a against B (docs/PLAN-B.md §6).
 */
const cartButton = (page: Page) => page.getByRole('button', { name: /^Apri il carrello/ });
const drawer = (page: Page) => page.getByRole('dialog', { name: /Il tuo carrello/ });
const announcer = (page: Page) => page.locator('[data-announcer]');

test.use({ viewport: { width: 1280, height: 800 } });

test('"Svuota il carrello" empties the cart, announces it and focuses "Scopri i corsi"', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
  await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).click();
  await cartButton(page).click();
  await expect(drawer(page).getByRole('listitem')).toHaveCount(2);
  await expect(drawer(page)).toContainText('Risparmi');

  await drawer(page).getByRole('button', { name: 'Svuota il carrello' }).click();
  await expect(drawer(page)).toContainText('Il carrello è vuoto');
  await expect(drawer(page).getByRole('link', { name: 'Scopri i corsi' })).toBeFocused();
  await expect(announcer(page)).toHaveText('Carrello svuotato');
  expect(await page.evaluate(() => localStorage.getItem('giunti-cart'))).toBe('{"version":1,"items":[]}');
});

test('removing the first of two lines moves focus to the next "Rimuovi"', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
  await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).click();
  await cartButton(page).click();
  await drawer(page).getByRole('button', { name: /^Rimuovi Disturbi/ }).click();
  await expect(drawer(page).getByRole('button', { name: /^Rimuovi Assessment/ })).toBeFocused();
  await expect(announcer(page)).toHaveText(/^Disturbi.* rimosso dal carrello$/);
});

test('stepper limits use aria-disabled and keep focus; the badge shows 99+', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem(
      'giunti-cart',
      JSON.stringify({ version: 1, items: [{ productId: 'corso-dsa', quantity: 99 }, { productId: 'corso-assessment-hr', quantity: 1 }] }),
    );
  });
  await page.goto('/');
  await expect(page.locator('.cart-button__badge')).toHaveText('99+');
  await expect(cartButton(page)).toHaveAccessibleName('Apri il carrello, 100 articoli nel carrello');

  await cartButton(page).click();
  const plus = drawer(page).getByRole('button', { name: /^Aumenta la quantità di Disturbi/ });
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  await plus.focus();
  await page.keyboard.press('Enter');
  await expect(plus).toBeFocused();
  await expect(drawer(page).getByRole('group', { name: /^Quantità di Disturbi/ })).toContainText('99');

  const minus = drawer(page).getByRole('button', { name: /^Diminuisci la quantità di Assessment/ });
  await expect(minus).toHaveAttribute('aria-disabled', 'true');
  await minus.focus();
  await page.keyboard.press('Enter');
  await expect(minus).toBeFocused();
});

test('a change in another tab is synced through the storage event', async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto('/');
  await second.goto('/');

  await first.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
  await expect(cartButton(second)).toHaveAccessibleName('Apri il carrello, 1 articolo nel carrello');
});

test('"Richiedi informazioni" closes the dialog and goes to #contatti', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: /NEURA-Q/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Somministrazione');
  await expect(dialog).toContainText('circa 75 minuti');
  await expect(dialog.locator('.format-badge--cartaceo svg:not([hidden])')).toHaveCount(1);

  await dialog.getByRole('link', { name: 'Richiedi informazioni' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#contatti$/);
});

// Leaving links close WITHOUT returning focus. The native dialog close() restores focus to the opener;
// what moves it away is the fragment navigation to an existing target (as in version-a, where focus ends
// on <body>). #contatti arrives with the contact block, so this runs once that section exists.
test('after "Richiedi informazioni" focus is not sent back to the card button', async ({ page }) => {
  await page.goto('/');
  test.skip((await page.locator('#contatti').count()) === 0, '#contatti does not exist yet (contact block)');
  const trigger = page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ });
  await trigger.click();
  await page.getByRole('dialog').getByRole('link', { name: 'Richiedi informazioni' }).click();
  await expect(trigger).not.toBeFocused();
});

test('after "Scopri i corsi" focus is not sent back to the cart button', async ({ page }) => {
  await page.goto('/');
  await cartButton(page).click();
  await drawer(page).getByRole('link', { name: 'Scopri i corsi' }).click();
  await expect(drawer(page)).toBeHidden();
  await expect(cartButton(page)).not.toBeFocused();
  await expect(page.locator('#catalogo').getByRole('article')).toHaveCount(4);
});

test('the dialog shows the right data for a test without discount', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Scopri di più: ANSIA-D/ }).click();
  const dialog = page.getByRole('dialog', { name: /ANSIA-D/ });
  await expect(dialog.locator('s')).toBeHidden();
  await expect(dialog).toContainText('180,00 €');
  await expect(dialog).toContainText('14+ anni');
  await expect(dialog.locator('.format-badge--digitale')).toHaveCount(1);
});

test('"Aggiungi" at the maximum quantity says so instead of claiming it was added', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('giunti-cart', JSON.stringify({ version: 1, items: [{ productId: 'corso-dsa', quantity: 99 }] }));
  });
  await page.goto('/');
  await expect(page.locator('.cart-button__badge')).toHaveText('99');

  const add = page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ });
  const name = (await add.getAttribute('aria-label'))!.replace(/^Aggiungi al carrello: /, '');
  await add.click();

  await expect(page.getByRole('button', { name: `Quantità massima raggiunta: ${name}` })).toBeVisible();
  await expect(announcer(page)).toHaveText(`${name}: quantità massima (99) già nel carrello`);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('giunti-cart') ?? '{}').items);
  expect(stored).toEqual([{ productId: 'corso-dsa', quantity: 99 }]);
});

test('another tab clearing the storage empties the cart; focus in the open drawer is not lost', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Aggiungi al carrello: Disturbi/ }).click();
  await cartButton(page).click();
  await drawer(page).getByRole('button', { name: /^Rimuovi .*Disturbi/ }).focus();

  await page.evaluate(() => {
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  await expect(drawer(page).getByRole('listitem')).toHaveCount(0);
  await expect(cartButton(page)).toHaveAccessibleName(/nessun articolo/);
  const focusedInDrawer = await page.evaluate(() => {
    const active = document.activeElement;
    return !!active && active !== document.body && !!active.closest('dialog[open]');
  });
  expect(focusedInDrawer).toBe(true);
});

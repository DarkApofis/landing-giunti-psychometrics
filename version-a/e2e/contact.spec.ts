import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { VIEWPORTS, hasHorizontalScroll, trackConsoleErrors } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Note: Next.js injects its own route announcer with role="alert", so alerts are scoped to #contatti.
const form = (page: Page) => page.getByRole('form', { name: 'Scrivici un messaggio' });
const field = (page: Page, name: 'Nome' | 'Email' | 'Messaggio') =>
  page.getByRole('textbox', { name: new RegExp(`^${name}`) });
const submit = (page: Page) =>
  page.getByRole('button', { name: /^(Invia messaggio|Invio in corso…)$/ });

/** Tabs until `target` is focused (fails after `max` presses). Returns the number of presses. */
async function tabTo(page: Page, target: ReturnType<Page['locator']>, max = 80) {
  for (let i = 1; i <= max; i += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return i;
  }
  throw new Error('target never received focus');
}

test.describe('contact form: keyboard only (1280)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('full flow: Tab order, submit with errors, fix with keyboard, success, send another', async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/#contatti');

    // Reach "Nome" by keyboard, then the natural order is Nome → Email → Messaggio → Invia.
    await page.locator('#contatti h2').click(); // set the sequential focus start point
    await tabTo(page, field(page, 'Nome'));
    await page.keyboard.press('Tab');
    await expect(field(page, 'Email')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(field(page, 'Messaggio')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(submit(page)).toBeFocused();

    // 1) Submit empty with Enter → summary alert, all fields invalid, focus on "Nome".
    await page.keyboard.press('Enter');
    await expect(page.locator('#contatti').getByRole('alert')).toHaveText(
      'Il modulo contiene 3 errori: correggi i campi evidenziati.',
    );
    await expect(field(page, 'Nome')).toBeFocused();
    for (const name of ['Nome', 'Email', 'Messaggio'] as const) {
      await expect(field(page, name)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(field(page, 'Nome')).toHaveAccessibleDescription('Inserisci il tuo nome.');
    await expect(form(page).getByText('Inserisci il tuo nome.')).toBeVisible();

    // 2) Fix "Nome" by typing: re-validated live.
    await page.keyboard.type('G');
    await expect(field(page, 'Nome')).toHaveAccessibleDescription(
      'Il nome deve contenere almeno 2 caratteri.',
    );
    await page.keyboard.type('iulia');
    await expect(field(page, 'Nome')).not.toHaveAttribute('aria-invalid');

    // 3) Wrong email, then leave the field: error updates on blur.
    await page.keyboard.press('Tab');
    await page.keyboard.type('giulia@example');
    await page.keyboard.press('Tab');
    await expect(field(page, 'Email')).toHaveAccessibleDescription(/indirizzo email valido/);
    await page.keyboard.press('Shift+Tab'); // Chrome selects the whole value on Tab focus…
    await page.keyboard.press('End'); // …so move the caret to the end before typing
    await page.keyboard.type('.it');
    await expect(field(page, 'Email')).not.toHaveAttribute('aria-invalid');

    // 4) Message and submit from the keyboard.
    await page.keyboard.press('Tab');
    await page.keyboard.type('Vorrei sapere quale qualifica serve per NEURA-Q.');
    await expect(field(page, 'Messaggio')).not.toHaveAttribute('aria-invalid');
    await page.keyboard.press('Tab');
    await expect(submit(page)).toBeFocused();
    await page.keyboard.press('Enter');

    // Sending: button keeps focus, is aria-disabled and shows the loading text.
    await expect(submit(page)).toHaveText('Invio in corso…');
    await expect(submit(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(submit(page)).toBeFocused();
    await page.keyboard.press('Enter'); // ignored while sending

    // Success: status panel, heading focused.
    const status = page.getByRole('status').filter({ hasText: 'Grazie!' });
    await expect(status).toContainText('Grazie! Il tuo messaggio è stato inviato.');
    await expect(status).toContainText('Giulia, ti risponderemo al più presto.');
    await expect(
      page.getByRole('heading', { name: 'Grazie! Il tuo messaggio è stato inviato.' }),
    ).toBeFocused();

    // 5) "Invia un altro messaggio" by keyboard → empty form, focus on "Nome".
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Invia un altro messaggio' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(field(page, 'Nome')).toBeFocused();
    await expect(field(page, 'Nome')).toHaveValue('');
    await expect(field(page, 'Messaggio')).toHaveValue('');

    expect(errors).toEqual([]);
  });

  test('focus goes to the first invalid field, not always the first one', async ({ page }) => {
    await page.goto('/#contatti');
    await field(page, 'Nome').fill('Giulia');
    await field(page, 'Email').fill('giulia@example.it');
    await submit(page).click();
    await expect(field(page, 'Messaggio')).toBeFocused();
    await expect(page.locator('#contatti').getByRole('alert')).toHaveText(
      'Il modulo contiene 1 errore: correggi il campo evidenziato.',
    );
  });

  test('visual states follow the spec: focus ring, error border, 44px controls', async ({
    page,
  }) => {
    await page.goto('/#contatti');
    const nome = field(page, 'Nome');
    expect((await nome.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await submit(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);

    await nome.focus();
    const outline = await nome.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe('solid');

    await submit(page).click();
    // Polled: the border colour transitions over 150ms (DESIGN-SPEC §5).
    await expect
      .poll(() => nome.evaluate((el) => getComputedStyle(el).borderTopColor))
      .toBe('rgb(180, 35, 24)'); // --color-danger #b42318
  });
});

test.describe('trust strip and footer', () => {
  test('trust strip shows 4 items with decorative icons', async ({ page }) => {
    await page.goto('/');
    const strip = page.getByRole('region', { name: 'Perché sceglierci' });
    for (const title of [
      'Spedizione gratuita',
      'Pagamenti sicuri',
      'Test validati',
      'Centro assistenza',
    ]) {
      await expect(strip.getByRole('heading', { name: title, level: 3 })).toBeVisible();
    }
    const svgs = strip.locator('svg');
    await expect(svgs).toHaveCount(4);
    for (const svg of await svgs.all()) await expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  test('footer: columns, social links, dynamic year, fictional legal text', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    for (const column of ['Esplora', 'Azienda', 'Assistenza']) {
      await expect(footer.getByRole('navigation', { name: column })).toBeVisible();
    }
    for (const network of ['LinkedIn', 'Instagram', 'YouTube', 'Facebook']) {
      const link = footer.getByRole('link', { name: new RegExp(`su ${network}`) });
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    }
    const year = new Date().getFullYear();
    await expect(footer).toContainText(`© ${year} Giunti Psychometrics S.r.l.`);
    await expect(footer).toContainText('sono fittizi');
    await expect(footer).not.toContainText(/P\.?\s?IVA|Partita IVA/i);

    // Touch targets ≥ 44px (DESIGN-SPEC §9) for every footer link.
    const heights = await footer
      .getByRole('link')
      .evaluateAll((links) => links.map((a) => Math.round(a.getBoundingClientRect().height)));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  });

  test('footer catalogue link applies the category; "Torna su" moves focus to main', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Formazione' }).click();
    await expect(page.locator('#catalogo').getByRole('article')).toHaveCount(4);

    await page.getByRole('link', { name: 'Torna su' }).click();
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('pages outside the demo show an Italian 404 with a way back', async ({ page }) => {
    const response = await page.goto('/pagina-inesistente');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Questa pagina non fa parte della demo', level: 1 }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Torna alla home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('responsive + accessibility', () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test(`no horizontal scroll and no axe violations at ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      expect(await hasHorizontalScroll(page)).toBe(false);
      const results = await new AxeBuilder({ page })
        .include('#contatti')
        .include('footer')
        .include('[aria-labelledby="trust-title"]')
        .withTags(WCAG_TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('no axe violations with errors shown and in the success state', async ({ page }) => {
    await page.goto('/#contatti');
    await submit(page).click();
    await expect(page.locator('#contatti').getByRole('alert')).toBeVisible();
    const scan = async () =>
      (await new AxeBuilder({ page }).include('#contatti').withTags(WCAG_TAGS).analyze())
        .violations;
    expect(await scan()).toEqual([]);

    await field(page, 'Nome').fill('Giulia');
    await field(page, 'Email').fill('giulia@example.it');
    await field(page, 'Messaggio').fill('Vorrei informazioni.');
    await submit(page).click();
    await expect(page.getByRole('heading', { name: /Grazie!/ })).toBeVisible();
    expect(await scan()).toEqual([]);
  });
});

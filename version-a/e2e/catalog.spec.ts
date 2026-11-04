import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { VIEWPORTS, hasHorizontalScroll, trackConsoleErrors } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const catalog = (page: Page) => page.locator('#catalogo');
const cards = (page: Page) => catalog(page).getByRole('article');
const pills = (page: Page) => page.getByRole('group', { name: 'Filtra per categoria' });
const pill = (page: Page, name: string) =>
  pills(page).getByRole('button', { name: new RegExp(`^${name} \\d+ prodott`) });
const search = (page: Page) => page.getByRole('searchbox', { name: 'Cerca nel catalogo' });
const counter = (page: Page) =>
  catalog(page).locator('p[aria-hidden="true"]', { hasText: /trovat/ });

/** Marks the window: if the page reloads, the marker disappears. */
async function markNoReload(page: Page) {
  await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
  return () => page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload);
}

test.describe('catalog: filtering (1280)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('category + search combinations, empty state and reset — without reloading', async ({
    page,
  }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    const stillSamePage = await markNoReload(page);

    await expect(cards(page)).toHaveCount(12);
    await expect(counter(page)).toHaveText('12 prodotti trovati');

    // Category only
    await pill(page, 'Clinica e Neuropsicologia').click();
    await expect(cards(page)).toHaveCount(3);
    await expect(pill(page, 'Clinica e Neuropsicologia')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/\?categoria=clinica-neuropsicologia$/);

    // + search (case/accent-insensitive)
    await search(page).fill('MEMORIA');
    await expect(cards(page)).toHaveCount(1);
    await expect(counter(page)).toHaveText('1 prodotto trovato');
    await expect(cards(page).first().getByRole('heading', { level: 3 })).toHaveText(/MEMORIA-S/);
    await expect(page).toHaveURL(/categoria=clinica-neuropsicologia&q=MEMORIA$/);

    // Search keeps applying when switching category
    await pill(page, 'Tutti').click();
    await expect(cards(page)).toHaveCount(1);

    // Accent-insensitive across the catalogue
    await search(page).fill('eta scolare');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText('in età scolare');

    // No results → friendly empty state
    await pill(page, 'Lavoro e Organizzazioni').click();
    await expect(cards(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Nessun prodotto trovato' })).toBeVisible();
    await expect(catalog(page)).toContainText(
      'Nessun risultato per «eta scolare» in Lavoro e Organizzazioni.',
    );

    // Reset: everything back, focus on "Tutti", clean URL
    await page.getByRole('button', { name: 'Azzera filtri' }).click();
    await expect(cards(page)).toHaveCount(12);
    await expect(search(page)).toHaveValue('');
    await expect(pill(page, 'Tutti')).toBeFocused();
    await expect(pill(page, 'Tutti')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/\/$/);

    // Clear button of the search box also restores results
    await search(page).fill('leader');
    await expect(cards(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Cancella la ricerca' }).click();
    await expect(cards(page)).toHaveCount(12);

    expect(await stillSamePage()).toBe(true);
    expect(errors).toEqual([]);
  });

  test('the live region announces the count after typing pauses', async ({ page }) => {
    await page.goto('/');
    const live = catalog(page).locator('[role="status"][aria-live="polite"]');
    await expect(live).toHaveText('12 prodotti trovati');
    await search(page).pressSequentially('neura', { delay: 30 });
    await expect(live).toHaveText('1 prodotto trovato');
  });

  test('deep link restores filters; nav "Formazione" and hero CTA pre-filter', async ({ page }) => {
    await page.goto('/?categoria=scuola-eta-evolutiva&q=lexia');
    await expect(cards(page)).toHaveCount(1);
    await expect(pill(page, 'Scuola ed Età evolutiva')).toHaveAttribute('aria-pressed', 'true');
    await expect(search(page)).toHaveValue('lexia');

    await page.goto('/');
    const stillSamePage = await markNoReload(page);
    await page
      .getByRole('navigation', { name: 'Navigazione principale' })
      .getByRole('link', { name: 'Formazione' })
      .click();
    await expect(cards(page)).toHaveCount(4);
    await expect(pill(page, 'Formazione')).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('heading', { level: 2, name: /Strumenti e corsi/ }),
    ).toBeInViewport();

    await page.getByRole('link', { name: 'Test', exact: true }).click();
    await expect(cards(page)).toHaveCount(12);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('link', { name: 'Scopri la formazione' }).click();
    await expect(cards(page)).toHaveCount(4);
    expect(await stillSamePage()).toBe(true);
  });

  test('an invalid category in the URL falls back to "Tutti"', async ({ page }) => {
    await page.goto('/?categoria=<script>');
    await expect(cards(page)).toHaveCount(12);
    await expect(pill(page, 'Tutti')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('catalog: cards and actions (1280)', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('card anatomy: h3, format badge, author/age or instructor/date, price hierarchy', async ({
    page,
  }) => {
    await page.goto('/');
    const neura = page.getByRole('article', { name: /NEURA-Q/ });
    await expect(neura.getByRole('heading', { level: 3 })).toHaveText(/NEURA-Q/);
    await expect(neura).toContainText('Cartaceo');
    await expect(neura).toContainText('Laura Bettini');
    await expect(neura).toContainText('18–90 anni');
    await expect(neura.locator('s')).toHaveText('1.250,00 €');
    await expect(neura).toContainText('1.062,50 €');
    await expect(neura).toContainText('−15%');
    await expect(neura.getByRole('img')).toHaveAttribute('alt', /cervello/);

    const course = page.getByRole('article', { name: /Valutazione neuropsicologica dell’adulto/ });
    await expect(course).toContainText('Corso online');
    await expect(course).toContainText('Chiara Benedetti');
    await expect(course.locator('time')).toHaveAttribute('datetime', '2027-01-19');
    await expect(course.locator('time')).toHaveText('19 gennaio 2027');

    const noDiscount = page.getByRole('article', { name: /ANSIA-D/ });
    await expect(noDiscount.locator('s')).toHaveCount(0);
    await expect(noDiscount).toContainText('180,00 €');
  });

  test('"Scopri di più" opens the details dialog: focus, Esc, focus return, backdrop', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Scopri di più: NEURA-Q', exact: false });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: /NEURA-Q/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Chiudi' })).toBeFocused();
    await expect(dialog).toContainText('Qualifica C');
    await expect(dialog).toContainText('Riservato a psicologi e medici abilitati');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );

    // Focus is trapped by the native modal dialog
    for (let i = 0; i < 4; i += 1) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    // Backdrop click closes too
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();
  });

  test('"Aggiungi al carrello" gives visible and announced feedback', async ({ page }) => {
    await page.goto('/');
    const add = page.getByRole('button', { name: /^Aggiungi al carrello: Somministrare/ });
    await add.click();
    await expect(
      page.getByRole('button', { name: /^Aggiunto al carrello: Somministrare/ }),
    ).toBeVisible();
    await expect(
      page.locator('[role="status"]', {
        hasText: 'Somministrare e interpretare ATTENTIO-R aggiunto al carrello',
      }),
    ).toHaveCount(1);
    await expect(add).toHaveAccessibleName(/^Aggiungi al carrello: Somministrare/, {
      timeout: 4000,
    });
  });
});

test.describe('catalog: layout and performance', () => {
  const columns = [
    { viewport: VIEWPORTS.mobile, cols: 1 },
    { viewport: VIEWPORTS.tablet, cols: 2 },
    { viewport: VIEWPORTS.desktop, cols: 3 },
  ];

  for (const { viewport, cols } of columns) {
    test(`${cols} column(s) at ${viewport.width}px, no horizontal page scroll`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const tops = await cards(page).evaluateAll((els) =>
        els.slice(0, 3).map((el) => Math.round(el.getBoundingClientRect().top)),
      );
      expect(new Set(tops.slice(0, cols)).size).toBe(1); // first `cols` cards share a row
      if (cols < 3) expect(tops[cols]).toBeGreaterThan(tops[0]!); // next one wraps
      expect(await hasHorizontalScroll(page)).toBe(false);
    });
  }

  test('mobile pills scroll horizontally inside their own row, nothing is clipped vertically', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    const group = pills(page);
    const metrics = await group.evaluate((el) => ({
      scrollable: el.scrollWidth > el.clientWidth,
      overflowY: el.scrollHeight > el.clientHeight,
    }));
    expect(metrics.scrollable).toBe(true);
    expect(metrics.overflowY).toBe(false);

    // The last pill is reachable: focusing it scrolls it into view
    const last = pill(page, 'Formazione');
    await last.focus();
    await expect(last).toBeInViewport({ ratio: 1 });
    // Selecting a pill keeps it visible
    await last.click();
    await expect(last).toBeInViewport({ ratio: 1 });
  });

  test('image sizes attribute matches rendered width (no oversized downloads)', async ({
    page,
  }) => {
    for (const viewport of Object.values(VIEWPORTS)) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const img = cards(page).first().getByRole('img');
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty('complete', true);
      const { rendered, chosen } = await img.evaluate((el: HTMLImageElement) => ({
        rendered: el.getBoundingClientRect().width,
        chosen: Number(new URL(el.currentSrc).searchParams.get('w')),
      }));
      // The chosen candidate must cover the slot at DPR 1 without being > 2.2× larger.
      expect(chosen).toBeGreaterThanOrEqual(rendered);
      expect(chosen).toBeLessThan(rendered * 2.2);
      await expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  test('cumulative layout shift stays below 0.1 while scrolling the grid', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { value: number; hadRecentInput: boolean }
        >) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    for (let y = 0; y < 4000; y += 400) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(120);
    }
    await page.waitForLoadState('networkidle');
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.1);
  });
});

test.describe('catalog: accessibility (axe)', () => {
  test('default, empty state and dialog have no WCAG 2.1 AA violations', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    const scan = async () =>
      (await new AxeBuilder({ page }).include('#catalogo').withTags(WCAG_TAGS).analyze())
        .violations;

    expect(await scan()).toEqual([]);

    await search(page).fill('zzz');
    await expect(page.getByRole('heading', { name: 'Nessun prodotto trovato' })).toBeVisible();
    expect(await scan()).toEqual([]);

    await page.getByRole('button', { name: 'Azzera filtri' }).click();
    await page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const dialogViolations = (
      await new AxeBuilder({ page }).include('dialog').withTags(WCAG_TAGS).analyze()
    ).violations;
    expect(dialogViolations).toEqual([]);
  });

  test('no violations at 375 (pill scroller)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('#catalogo')
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

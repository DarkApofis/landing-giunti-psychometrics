import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { VIEWPORTS, focusedLabel, hasHorizontalScroll, trackConsoleErrors } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('layout: landmarks and skip link', () => {
  test('has one banner, main, contentinfo and a single h1, lang="it"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('skip link is the first focusable element and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Vai al contenuto principale' });
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0); // visible on focus
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('no console errors (incl. hydration) on load', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});

test.describe('header: desktop 1280', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('keyboard order: skip → logo → nav → search → Accedi → cart → hero CTAs', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /menu/i })).toBeHidden();
    const expected = [
      'Vai al contenuto principale',
      'Giunti Psychometrics',
      'Test',
      'Formazione',
      'Risorse',
      'Contatti',
      '', // search input (no text content)
      'Accedi',
      'Apri il carrello, nessun articolo',
      'Esplora il catalogo',
      'Scopri la formazione',
    ];
    for (const label of expected) {
      await page.keyboard.press('Tab');
      if (label === '') {
        await expect(page.getByRole('searchbox', { name: 'Cerca nel catalogo' })).toBeFocused();
      } else {
        expect(await focusedLabel(page)).toBe(label);
      }
    }
  });

  test('Accedi is a visual-only button', async ({ page }) => {
    await page.goto('/');
    const accedi = page.getByRole('button', { name: 'Accedi' });
    await expect(accedi).toHaveAttribute('type', 'button');
    await accedi.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('search: clear button, focus return, Enter scrolls to the catalogue, no header shift', async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const heightBefore = (await header.boundingBox())?.height;
    const input = page.getByRole('searchbox', { name: 'Cerca nel catalogo' });
    const clear = page.getByRole('button', { name: 'Cancella la ricerca' });

    await expect(clear).toHaveCount(0);
    await input.fill('neura');
    await expect(clear).toBeVisible();
    expect((await header.boundingBox())?.height).toBe(heightBefore);

    await clear.click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(clear).toHaveCount(0);

    await input.fill('neura');
    await input.press('Enter');
    await expect(
      page.getByRole('heading', { name: /Strumenti e corsi/, level: 2 }),
    ).toBeInViewport();
  });

  test('hero CTA lands on #catalogo below the sticky header', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Esplora il catalogo' }).click();
    await expect(page).toHaveURL(/#catalogo$/);
    const heading = page.getByRole('heading', { name: /Strumenti e corsi/, level: 2 });
    await expect(heading).toBeInViewport();
    const headerBottom = (await page.getByRole('banner').boundingBox())!.height;
    await expect
      .poll(async () => (await heading.boundingBox())!.y)
      .toBeGreaterThanOrEqual(headerBottom);
  });

  test('header stays sticky after scrolling', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 1500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect((await page.getByRole('banner').boundingBox())!.y).toBe(0);
  });
});

test.describe('header: mobile menu (768)', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test('focus trap skips "Accedi", which is hidden at md and up', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).click();
    await expect(page.getByRole('button', { name: 'Chiudi il menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    // From the last visible link Tab must wrap to the toggle, not escape into the page behind.
    const cycle = ['Test', 'Formazione', 'Risorse', 'Contatti', 'Chiudi il menu', 'Test'];
    await page.getByRole('link', { name: 'Test', exact: true }).last().focus();
    expect(await focusedLabel(page)).toBe(cycle[0]);
    for (const label of cycle.slice(1)) {
      await page.keyboard.press('Tab');
      expect(await focusedLabel(page)).toBe(label);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await focusedLabel(page)).toBe('Chiudi il menu');
    await page.keyboard.press('Shift+Tab');
    expect(await focusedLabel(page)).toBe('Contatti');
  });
});

test.describe('header: mobile menu (375)', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('toggle, focus trap, Esc closes and returns focus', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toBeHidden();
    const toggle = page.getByRole('button', { name: 'Apri il menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const panelId = await toggle.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    await toggle.focus();
    await page.keyboard.press('Enter');
    const close = page.getByRole('button', { name: 'Chiudi il menu' });
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();

    // Focus moves into the panel, then cycles: links → Accedi → toggle → first link.
    const cycle = ['Test', 'Formazione', 'Risorse', 'Contatti', 'Accedi', 'Chiudi il menu', 'Test'];
    expect(await focusedLabel(page)).toBe(cycle[0]);
    for (const label of cycle.slice(1)) {
      await page.keyboard.press('Tab');
      expect(await focusedLabel(page)).toBe(label);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await focusedLabel(page)).toBe('Chiudi il menu');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Apri il menu' })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Apri il menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.locator(`[id="${panelId}"]`)).toBeHidden();
  });

  test('page does not scroll behind the open menu; link closes it and navigates', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).click();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
    await page.getByRole('link', { name: 'Contatti' }).click();
    await expect(page).toHaveURL(/#contatti$/);
    await expect(page.getByRole('button', { name: 'Apri il menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(
      page.getByRole('heading', { name: /Hai bisogno di aiuto/, level: 2 }),
    ).toBeInViewport();
  });

  test('clicking the backdrop closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).click();
    await page.mouse.click(180, 700);
    await expect(page.getByRole('button', { name: 'Apri il menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

test.describe('header layout per breakpoint (fixed heights, no shift)', () => {
  // Row heights from DESIGN-SPEC §6.8 + 1px bottom border.
  const cases = [
    { viewport: VIEWPORTS.mobile, height: 121, accedi: false, burger: true, nav: false },
    { viewport: VIEWPORTS.tablet, height: 65, accedi: true, burger: true, nav: false },
    { viewport: VIEWPORTS.desktop, height: 73, accedi: true, burger: false, nav: true },
  ];

  for (const c of cases) {
    test(`at ${c.viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(c.viewport);
      await page.goto('/');
      const header = page.getByRole('banner');
      expect((await header.boundingBox())?.height).toBe(c.height);

      const accedi = header.getByRole('button', { name: 'Accedi' });
      const burger = header.getByRole('button', { name: 'Apri il menu' });
      const nav = header.getByRole('navigation', { name: 'Navigazione principale' });
      await (c.accedi ? expect(accedi).toBeVisible() : expect(accedi).toBeHidden());
      await (c.burger ? expect(burger).toBeVisible() : expect(burger).toBeHidden());
      await (c.nav ? expect(nav).toBeVisible() : expect(nav).toBeHidden());

      // Logo, actions and search never overlap.
      const logo = (await header
        .getByRole('link', { name: 'Giunti Psychometrics' })
        .boundingBox())!;
      const search = (await header.getByRole('searchbox').boundingBox())!;
      const overlaps =
        logo.x < search.x + search.width &&
        search.x < logo.x + logo.width &&
        logo.y < search.y + search.height &&
        search.y < logo.y + logo.height;
      expect(overlaps).toBe(false);
    });
  }
});

test.describe('responsive and motion', () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test(`no horizontal scroll at ${name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      expect(await hasHorizontalScroll(page)).toBe(false);
    });
  }

  test('smooth scrolling only without prefers-reduced-motion', async ({ page }) => {
    await page.goto('/');
    const behavior = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(await behavior()).toBe('smooth');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await behavior()).toBe('auto');
  });
});

test.describe('accessibility (axe-core, WCAG 2.1 A/AA)', () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test(`no violations at ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('no violations with the mobile menu open', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).click();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});

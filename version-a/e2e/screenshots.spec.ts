import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';
import { VIEWPORTS } from './helpers';

/** Visual evidence for review → docs/screenshots/version-a (run with: npm run e2e:screenshots). */
// Playwright transpiles specs to CommonJS, so `__dirname` (not import.meta) is available.
const OUT = join(__dirname, '..', '..', 'docs', 'screenshots', 'version-a');
mkdirSync(OUT, { recursive: true });

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`screenshot: header + hero at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, `01-hero-${viewport.width}-${name}.png`) });
  });
}

test('screenshot: mobile menu open (375)', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/');
  await page.getByRole('button', { name: 'Apri il menu' }).click();
  await page.waitForTimeout(300); // let the entry transition finish
  await page.screenshot({ path: join(OUT, '02-menu-open-375.png') });
});

test('screenshot: keyboard focus states (1280)', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.keyboard.press('Tab');
  await page.screenshot({
    path: join(OUT, '03-focus-skip-link-1280.png'),
    clip: { x: 0, y: 0, width: 1280, height: 200 },
  });
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Tab'); // → "Formazione"
  await page.screenshot({
    path: join(OUT, '04-focus-nav-1280.png'),
    clip: { x: 0, y: 0, width: 1280, height: 120 },
  });
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('Tab'); // → hero secondary CTA
  await page.screenshot({ path: join(OUT, '05-focus-hero-cta-1280.png') });
});

test('screenshot: search with text (768)', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.tablet);
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('attentio');
  await page.screenshot({
    path: join(OUT, '06-search-filled-768.png'),
    clip: { x: 0, y: 0, width: 768, height: 160 },
  });
});

// ── Catalogue ────────────────────────────────────────────────────────────────

async function gotoCatalog(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#catalogo').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const el = document.getElementById('catalogo');
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'instant',
      });
  });
  // Wait for every image in view to finish loading.
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('#catalogo img'))
      .filter((img) => img.getBoundingClientRect().top < window.innerHeight)
      .every((img) => (img as HTMLImageElement).complete),
  );
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`screenshot: catalogue at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: 1400 });
    await gotoCatalog(page);
    await page.screenshot({ path: join(OUT, `10-catalog-${viewport.width}-${name}.png`) });
  });
}

test('screenshot: card hover and keyboard focus (1280)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await gotoCatalog(page);
  await page.getByRole('article').nth(1).hover();
  await page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).focus();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, '11-card-hover-focus-1280.png') });
});

test('screenshot: filtered + empty state (1280)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoCatalog(page);
  await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('zzz');
  await page
    .getByRole('group', { name: 'Filtra per categoria' })
    .getByRole('button', { name: /^Formazione/ })
    .click();
  await page.mouse.move(0, 0); // no hover on the pill
  await page.waitForTimeout(300); // let the 150ms colour transition finish
  // The shorter page clamps the scroll position: re-frame the section.
  await page.evaluate(() => {
    const el = document.getElementById('catalogo');
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'instant',
      });
  });
  await page.screenshot({ path: join(OUT, '12-empty-state-1280.png') });
});

test('screenshot: details dialog (1280 and 375)', async ({ page }) => {
  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.mobile]) {
    await page.setViewportSize(viewport);
    await gotoCatalog(page);
    await page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('img').evaluate((img: HTMLImageElement) => img.decode().catch(() => {}));
    await page.screenshot({ path: join(OUT, `13-dialog-${viewport.width}.png`) });
    await page.keyboard.press('Escape');
  }
});

test('screenshot: pills scrolled to the active one (375)', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto('/?categoria=formazione');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#catalogo').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page
    .getByRole('group', { name: 'Filtra per categoria' })
    .screenshot({ path: join(OUT, '14-pills-375.png') });
});

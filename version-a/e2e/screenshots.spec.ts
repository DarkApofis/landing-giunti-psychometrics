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

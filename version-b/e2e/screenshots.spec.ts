import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';

/**
 * Visual evidence → docs/screenshots/version-b, with the SAME names, viewports and steps as
 * version-a/e2e/screenshots.spec.ts, so each pair can be compared pixel by pixel
 * (scripts/compare-screenshots.mjs). Sections are added as each block of docs/PLAN-B.md lands.
 */
const OUT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'docs', 'screenshots', 'version-b');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

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

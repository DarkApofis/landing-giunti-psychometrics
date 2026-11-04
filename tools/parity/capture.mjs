#!/usr/bin/env node
/**
 * Captures every view of views.mjs in A and B at 375 / 768 / 1280 and diffs them with pixelmatch.
 *
 *   node capture.mjs [--out out/<name>] [--only view-id,…]
 *
 * Per view and width it records:
 *   diff        % of differing pixels (pixelmatch threshold 0.1, anti-aliasing ignored)
 *   diffMasked  the same with every <img> masked in both captures — what remains is layout, type,
 *               colour and state; the photos differ only by compression (A re-encodes them with
 *               next/image, B asks the Unsplash CDN), which B cannot control
 *   size        width × height of each capture; different heights are reported, and the common
 *               area is compared
 * Output: <out>/{a,b,diff,diff-masked}/<view>-<width>.png and <out>/results.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { A_URL, B_URL, ensureServers } from './servers.mjs';
import { VIEWS, WIDTHS } from './views.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const OUT = join(HERE, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'out/latest');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const FIXED_TIME = new Date('2026-11-04T10:00:00+01:00');

// Kills transitions, animations and the text caret so captures never catch an intermediate frame.
const FREEZE_CSS = `*, *::before, *::after {
  transition: none !important; animation: none !important; caret-color: transparent !important;
}`;

for (const dir of ['a', 'b', 'diff', 'diff-masked']) mkdirSync(join(OUT, dir), { recursive: true });

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  // Lazy images load only when near the viewport: walk the page, then wait for every image.
  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 30_000 });
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))));
}

async function shoot(browser, base, view, size, mask) {
  const context = await browser.newContext({ viewport: size, locale: 'it-IT', reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.clock.setFixedTime(FIXED_TIME);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: FREEZE_CSS });
  // Sensitivity check only: B_EXTRA_CSS injects a deliberate defect into B to prove the diff catches it.
  if (base === B_URL && process.env.B_EXTRA_CSS) await page.addStyleTag({ content: process.env.B_EXTRA_CSS });
  await settle(page);
  if (view.prepare) await view.prepare(page);
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  if (view.kind === 'viewport') {
    // Images inside the open dialog/drawer.
    await page.evaluate(() => Promise.all([...document.querySelectorAll('dialog[open] img')].map((img) => img.decode().catch(() => {}))));
  }

  const options = { animations: 'disabled', caret: 'hide', scale: 'css' };
  if (mask) {
    options.mask = [page.locator('img')];
    options.maskColor = '#ff00ff';
  }

  let buffer;
  if (view.kind === 'page') {
    buffer = await page.screenshot({ ...options, fullPage: true });
  } else if (view.kind === 'viewport') {
    buffer = await page.screenshot(options);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    const box = await page.locator(view.target).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
    });
    buffer = await page.screenshot({ ...options, fullPage: true, clip: box });
  }
  await context.close();
  return buffer;
}

/** Compares the common area; returns the % of differing pixels and the diff image. */
function compare(bufferA, bufferB) {
  const a = PNG.sync.read(bufferA);
  const b = PNG.sync.read(bufferB);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const crop = (img) => {
    if (img.width === width && img.height === height) return img;
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(crop(a).data, crop(b).data, diff.data, width, height, { threshold: 0.1 });
  return {
    percent: (pixels / (width * height)) * 100,
    pixels,
    sizeA: `${a.width}×${a.height}`,
    sizeB: `${b.width}×${b.height}`,
    sameSize: a.width === b.width && a.height === b.height,
    diffPng: PNG.sync.write(diff),
  };
}

const stop = await ensureServers();
const browser = await chromium.launch();
const results = [];

try {
  for (const view of VIEWS.filter((v) => !ONLY || ONLY.includes(v.id))) {
    for (const size of WIDTHS) {
      const name = `${view.id}-${size.width}`;
      const [a, b, aMasked, bMasked] = [
        await shoot(browser, A_URL, view, size, false),
        await shoot(browser, B_URL, view, size, false),
        await shoot(browser, A_URL, view, size, true),
        await shoot(browser, B_URL, view, size, true),
      ];
      writeFileSync(join(OUT, 'a', `${name}.png`), a);
      writeFileSync(join(OUT, 'b', `${name}.png`), b);
      const raw = compare(a, b);
      const masked = compare(aMasked, bMasked);
      writeFileSync(join(OUT, 'diff', `${name}.png`), raw.diffPng);
      writeFileSync(join(OUT, 'diff-masked', `${name}.png`), masked.diffPng);

      const row = {
        view: view.id,
        label: view.label,
        width: size.width,
        diff: Number(raw.percent.toFixed(3)),
        diffMasked: Number(masked.percent.toFixed(3)),
        pixels: raw.pixels,
        pixelsMasked: masked.pixels,
        sizeA: raw.sizeA,
        sizeB: raw.sizeB,
        sameSize: raw.sameSize,
      };
      results.push(row);
      console.log(
        `${name.padEnd(22)} diff ${row.diff.toFixed(2).padStart(6)} %   sin fotos ${row.diffMasked.toFixed(2).padStart(6)} %   ${row.sameSize ? row.sizeA : `A ${row.sizeA} · B ${row.sizeB}`}`,
      );
    }
  }
} finally {
  await browser.close();
  stop();
}

writeFileSync(join(OUT, 'results.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), A_URL, B_URL, results }, null, 2)}\n`);
console.log(`\n${results.length} comparisons → ${OUT}`);

#!/usr/bin/env node
/**
 * Compares key computed values between A and B at 375 / 768 / 1280: font sizes, line heights, header
 * height, grid columns and gaps, card and control sizes, section heights. Selectors are semantic and
 * shared by both versions (roles, ids, HANDOFF §4), never framework classes.
 *
 *   node computed.mjs [--out out/<name>]
 *
 * Boxes are compared with a 0.5px tolerance (sub-pixel text rounding); every other value exactly.
 * Output: <out>/computed.json and the list of differences on stdout.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { A_URL, B_URL, ensureServers } from './servers.mjs';
import { WIDTHS } from './views.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const args = process.argv.slice(2);
const OUT = join(HERE, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'out/latest');
const BOX_TOLERANCE = 0.5;

const TYPE = ['fontFamily', 'fontSize', 'lineHeight', 'fontWeight', 'letterSpacing', 'color'];
const BOX = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius', 'borderTopWidth', 'boxShadow'];
const GRID = ['display', 'gridTemplateColumns', 'columnGap', 'rowGap'];

const PROBES = [
  ['body', 'body', ['fontFamily', 'fontSize', 'lineHeight', 'color', 'backgroundColor']],
  ['header', 'header', ['position', 'backgroundColor', 'borderBottomWidth']],
  ['header › row', 'header > div', ['paddingLeft', 'paddingRight', 'columnGap']],
  ['hero', 'section[aria-labelledby="hero-title"]', []],
  ['hero › grid', 'section[aria-labelledby="hero-title"] > div', [...GRID, 'paddingTop', 'paddingBottom']],
  ['hero › h1', '#hero-title', TYPE],
  ['hero › lead', '#hero-title + p', TYPE],
  ['hero › CTA 1', 'section[aria-labelledby="hero-title"] a[href="#catalogo"]', [...TYPE, ...BOX]],
  ['hero › stats', 'section[aria-labelledby="hero-title"] dl', GRID],
  ['hero › stat value', 'section[aria-labelledby="hero-title"] dd', TYPE],
  ['catalog', '#catalogo', ['paddingTop', 'paddingBottom']],
  ['catalog › h2', '#catalogo-title', TYPE],
  ['catalog › pill (Tutti)', '[role="group"][aria-label="Filtra per categoria"] button', [...TYPE, ...BOX, 'backgroundColor']],
  ['catalog › grid', '#catalogo ul[role="list"]', GRID],
  ['card', '#catalogo article', ['borderRadius', 'boxShadow', 'borderTopColor']],
  ['card › image box', '#catalogo article > div:first-child', ['aspectRatio']],
  ['card › badge', '#catalogo article > div:first-child > span', [...TYPE, ...BOX]],
  ['card › h3', '#catalogo article h3', TYPE],
  ['card › description', '#catalogo article h3 + p', TYPE],
  ['card › dl', '#catalogo article dl', [...GRID, 'fontSize']],
  ['card › original price', '#catalogo article s', TYPE],
  ['card › action', '#catalogo article button', [...TYPE, ...BOX]],
  ['trust › list', 'section[aria-labelledby="trust-title"] ul', [...GRID, 'paddingTop']],
  ['contact', '#contatti', ['paddingTop', 'paddingBottom']],
  ['contact › grid', '#contatti > div', GRID],
  ['contact › h2', '#contatti-title', TYPE],
  ['form › Nome', '#contact-nome', [...TYPE, ...BOX, 'borderTopColor']],
  ['form › Messaggio', '#contact-messaggio', [...TYPE, ...BOX]],
  ['form › submit', '#contatti button[type="submit"]', [...TYPE, ...BOX]],
  ['footer', 'footer', ['backgroundColor']],
  ['footer › grid', 'footer > div:first-child', [...GRID, 'paddingTop']],
  ['footer › column title', 'footer nav h2', TYPE],
  ['footer › link', 'footer nav a', [...TYPE]],
];

async function measure(browser, base, size) {
  const context = await browser.newContext({ viewport: size, locale: 'it-IT', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const values = await page.evaluate((probes) => {
    const out = {};
    for (const [name, selector, props] of probes) {
      const el = document.querySelector(selector);
      if (!el) {
        out[name] = null;
        continue;
      }
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const entry = { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height };
      for (const prop of props) entry[prop] = prop === 'fontFamily' ? cs.fontFamily.split(',')[0].replaceAll('"', '') : cs[prop];
      out[name] = entry;
    }
    return out;
  }, PROBES);
  await context.close();
  return values;
}

const stop = await ensureServers();
const browser = await chromium.launch();
const report = [];
const differences = [];

try {
  for (const size of WIDTHS) {
    const a = await measure(browser, A_URL, size);
    const b = await measure(browser, B_URL, size);
    for (const [name] of PROBES) {
      if (!a[name] || !b[name]) {
        differences.push({ width: size.width, probe: name, property: 'element', a: a[name] ? 'found' : 'missing', b: b[name] ? 'found' : 'missing' });
        continue;
      }
      for (const property of Object.keys(a[name])) {
        const va = a[name][property];
        const vb = b[name][property];
        const isBox = ['x', 'y', 'width', 'height'].includes(property);
        const equal = isBox ? Math.abs(va - vb) <= BOX_TOLERANCE : va === vb;
        report.push({ width: size.width, probe: name, property, a: va, b: vb, equal });
        if (!equal) differences.push({ width: size.width, probe: name, property, a: va, b: vb });
      }
    }
  }
} finally {
  await browser.close();
  stop();
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'computed.json'), `${JSON.stringify({ measuredAt: new Date().toISOString(), tolerancePx: BOX_TOLERANCE, report, differences }, null, 2)}\n`);

const compared = report.length;
console.log(`${compared} values compared (${PROBES.length} probes × ${WIDTHS.length} widths), ${differences.length} differences`);
for (const d of differences) {
  const fmt = (v) => (typeof v === 'number' ? v.toFixed(2) : v);
  console.log(`  ${String(d.width).padEnd(5)} ${d.probe.padEnd(24)} ${d.property.padEnd(20)} A=${fmt(d.a)}  B=${fmt(d.b)}`);
}

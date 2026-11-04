#!/usr/bin/env node
/**
 * Pixel comparison of docs/screenshots/version-b against docs/screenshots/version-a (docs/PLAN-B.md §6).
 * For every B capture with an A counterpart of the same name: % of differing pixels (pixelmatch,
 * threshold 0.1, anti-aliasing ignored) and a diff image in docs/screenshots/diff/.
 *
 *   npm run compare:screenshots [-- prefix…]     e.g. -- 01 02
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const DOCS = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'docs', 'screenshots');
const A = join(DOCS, 'version-a');
const B = join(DOCS, 'version-b');
const DIFF = join(DOCS, 'diff');
const prefixes = process.argv.slice(2);
mkdirSync(DIFF, { recursive: true });

const rows = [];
for (const name of readdirSync(B).filter((n) => n.endsWith('.png')).sort()) {
  if (prefixes.length && !prefixes.some((p) => name.startsWith(p))) continue;
  if (!existsSync(join(A, name))) continue;

  const a = PNG.sync.read(readFileSync(join(A, name)));
  const b = PNG.sync.read(readFileSync(join(B, name)));
  if (a.width !== b.width || a.height !== b.height) {
    rows.push({ name, size: `A ${a.width}×${a.height} · B ${b.width}×${b.height}`, diff: 'tamaños distintos' });
    continue;
  }
  const out = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 });
  writeFileSync(join(DIFF, name), PNG.sync.write(out));
  rows.push({ name, size: `${a.width}×${a.height}`, diff: `${((pixels / (a.width * a.height)) * 100).toFixed(2)} %`, pixels });
}

console.table(rows);

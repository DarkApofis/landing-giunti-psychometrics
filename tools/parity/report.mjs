#!/usr/bin/env node
/**
 * Builds the evidence for docs/PARITY.md from out/before and out/after:
 *   - docs/parity/results.json, docs/parity/computed.json   (raw data of the "after" run)
 *   - docs/parity/<view>-<width>.png                        A | B | diff side by side, for the worst cases
 *   - Markdown tables on stdout (view × width × %, before/after, computed differences)
 *
 *   node report.mjs [--worst 6] [--extra view-width,…]
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DOCS = join(HERE, '..', '..', 'docs', 'parity');
const BEFORE = join(HERE, 'out', 'before');
const AFTER = join(HERE, 'out', 'after');
const args = process.argv.slice(2);
const WORST = args.includes('--worst') ? Number(args[args.indexOf('--worst') + 1]) : 6;
const EXTRA = args.includes('--extra') ? args[args.indexOf('--extra') + 1].split(',') : [];
const MAX_HEIGHT = 900; // composites show the 900px band where the differences start
const GUTTER = 12;

mkdirSync(DOCS, { recursive: true });
const before = JSON.parse(readFileSync(join(BEFORE, 'results.json'), 'utf8')).results;
const after = JSON.parse(readFileSync(join(AFTER, 'results.json'), 'utf8')).results;
const computedAfter = JSON.parse(readFileSync(join(AFTER, 'computed.json'), 'utf8'));
const computedBefore = existsSync(join(BEFORE, 'computed.json')) ? JSON.parse(readFileSync(join(BEFORE, 'computed.json'), 'utf8')) : null;

copyFileSync(join(AFTER, 'results.json'), join(DOCS, 'results.json'));
writeFileSync(
  join(DOCS, 'computed.json'),
  `${JSON.stringify({ tolerancePx: computedAfter.tolerancePx, compared: computedAfter.report.length, differences: computedAfter.differences }, null, 2)}\n`,
);

/** First row that contains a differing (red) pixel of the diff image, so the crop shows it. */
function firstDiffRow(diff) {
  for (let y = 0; y < diff.height; y += 1) {
    for (let x = 0; x < diff.width; x += 1) {
      const i = (diff.width * y + x) << 2;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) return y;
    }
  }
  return 0;
}

function composite(name) {
  const read = (dir) => PNG.sync.read(readFileSync(join(AFTER, dir, `${name}.png`)));
  const [a, b, diff] = [read('a'), read('b'), read('diff')];
  const top = Math.max(0, Math.min(firstDiffRow(diff) - 80, diff.height - MAX_HEIGHT));
  const height = Math.min(MAX_HEIGHT, diff.height - top);
  const width = a.width;
  const out = new PNG({ width: width * 3 + GUTTER * 2, height, fill: true });
  out.data.fill(255);
  [a, b, diff].forEach((img, column) => {
    PNG.bitblt(img, out, 0, top, Math.min(width, img.width), Math.min(height, img.height - top), column * (width + GUTTER), 0);
  });
  writeFileSync(join(DOCS, `${name}.png`), PNG.sync.write(out));
  return { file: `parity/${name}.png`, top };
}

// ── Tables ──────────────────────────────────────────────────────────────────
const pct = (n) => `${n.toFixed(2).replace('.', ',')} %`;
const views = [...new Set(after.map((r) => r.view))];
const widths = [375, 768, 1280];
const cell = (rows, view, width, key) => rows.find((r) => r.view === view && r.width === width)?.[key];

console.log('### Diferencia por vista y ancho (después)\n');
console.log('| Vista | 375 | 768 | 1280 | 375 sin fotos | 768 sin fotos | 1280 sin fotos | Tamaño igual |');
console.log('|---|---|---|---|---|---|---|---|');
for (const view of views) {
  const label = after.find((r) => r.view === view).label;
  const same = widths.every((w) => cell(after, view, w, 'sameSize')) ? 'sí' : '**no**';
  console.log(
    `| ${label} | ${widths.map((w) => pct(cell(after, view, w, 'diff'))).join(' | ')} | ${widths.map((w) => pct(cell(after, view, w, 'diffMasked'))).join(' | ')} | ${same} |`,
  );
}
const maxAfter = Math.max(...after.map((r) => r.diff));
const meanAfter = after.reduce((s, r) => s + r.diff, 0) / after.length;
console.log(`\nMáximo ${pct(maxAfter)} · media ${pct(meanAfter)} · ${after.length} comparaciones · objetivo < 1,50 %.`);

console.log('\n### Antes / después (vistas que cambiaron)\n');
console.log('| Vista | Ancho | Antes | Después | Antes sin fotos | Después sin fotos |');
console.log('|---|---|---|---|---|---|');
let changed = 0;
for (const row of after) {
  const old = before.find((r) => r.view === row.view && r.width === row.width);
  if (!old || (old.pixels === row.pixels && old.pixelsMasked === row.pixelsMasked)) continue;
  changed += 1;
  console.log(`| ${row.label} | ${row.width} | ${pct(old.diff)} | ${pct(row.diff)} | ${pct(old.diffMasked)} | ${pct(row.diffMasked)} |`);
}
if (changed === 0) console.log('| (ninguna: los píxeles no cambiaron) | | | | | |');

console.log('\n### Valores computados\n');
if (computedBefore) console.log(`Antes: ${computedBefore.differences.length} diferencias de ${computedBefore.report.length} valores.`);
console.log(`Después: ${computedAfter.differences.length} diferencias de ${computedAfter.report.length} valores (tolerancia ${computedAfter.tolerancePx} px en cajas).\n`);
console.log('| Ancho | Elemento | Propiedad | A | B |');
console.log('|---|---|---|---|---|');
for (const d of computedAfter.differences) {
  const short = (v) => (typeof v === 'string' && v.length > 60 ? `${v.slice(0, 57)}…` : v);
  console.log(`| ${d.width} | ${d.probe} | ${d.property} | \`${short(d.a)}\` | \`${short(d.b)}\` |`);
}

// ── Side-by-side images of the worst cases ─────────────────────────────────
const worst = [...after].sort((x, y) => y.diff - x.diff).slice(0, WORST).map((r) => `${r.view}-${r.width}`);
console.log('\n### Composiciones generadas (A | B | diferencia)\n');
for (const name of [...new Set([...worst, ...EXTRA])]) {
  const { file, top } = composite(name);
  console.log(`- \`${name}\` → ${file} (desde y = ${top})`);
}

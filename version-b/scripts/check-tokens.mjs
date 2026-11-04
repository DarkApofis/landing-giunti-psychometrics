#!/usr/bin/env node
/**
 * Fails if a raw colour value appears outside the token file (DESIGN-SPEC §1, docs/PLAN-B.md task 2.5):
 * styles, views and scripts must use var(--color-…) or the Stylus variables of settings/_tokens.styl.
 *
 *   npm run check:tokens
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIRS = ['resources/stylus', 'resources/views', 'resources/js'].map((dir) => join(ROOT, dir));
const ALLOWED = new Set([join('resources', 'stylus', 'settings', '_tokens.styl')]);
const EXTENSIONS = /\.(styl|blade\.php|js)$/;
// #rgb, #rrggbb, #rrggbbaa (not followed by a word character, so "#main" or "#catalogo" never match),
// and colour functions.
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|hwb)\(/g;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const violations = [];
for (const file of DIRS.flatMap(walk)) {
  const rel = relative(ROOT, file);
  if (!EXTENSIONS.test(file) || ALLOWED.has(rel)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(RAW_COLOUR)) {
        violations.push(`${rel.split(sep).join('/')}:${index + 1}  ${match[0]}  →  ${line.trim()}`);
      }
    });
}

if (violations.length > 0) {
  console.error(`✗ check:tokens — ${violations.length} raw colour value(s) outside settings/_tokens.styl:`);
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}
console.log('✓ check:tokens — no raw colour values outside settings/_tokens.styl');

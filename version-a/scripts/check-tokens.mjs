#!/usr/bin/env node
/**
 * Fails if raw colour values appear outside the token files.
 * Rule (DESIGN-SPEC §1): components must use tokens (Tailwind classes / CSS variables), never raw hex/rgb/hsl.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');

/** Files allowed to contain raw colour values. */
const ALLOWED = new Set(
  ['src/styles/tokens.css', 'src/data/site.ts', 'src/app/icon.svg'].map((p) =>
    p.split('/').join(sep),
  ),
);
const EXTENSIONS = /\.(tsx?|css|svg)$/;
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}(?![\w-])|\b(?:rgba?|hsla?|oklch)\(/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (!EXTENSIONS.test(file) || ALLOWED.has(rel)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const match of line.matchAll(RAW_COLOUR)) {
        violations.push(`${rel}:${i + 1}  ${match[0]}`);
      }
    });
}

if (violations.length > 0) {
  console.error(
    `✗ Raw colour values found (use tokens from src/styles/tokens.css):\n  ${violations.join('\n  ')}`,
  );
  process.exit(1);
}
console.log('✓ check:tokens — no raw colour values outside token files');

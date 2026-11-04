#!/usr/bin/env node
/**
 * Copies the handoff dataset (docs/handoff/*.json, generated from version-a's TypeScript sources)
 * into resources/data, so that version-b deploys on its own without the rest of the monorepo.
 * The copy is byte for byte; tests/Unit/HandoffSyncTest.php fails if the two ever drift apart.
 *
 *   npm run sync:handoff
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'docs', 'handoff');
const target = join(root, 'resources', 'data');

if (!existsSync(source)) {
  console.error(`✗ sync:handoff — ${source} not found (run it from the monorepo checkout).`);
  process.exit(1);
}

const files = readdirSync(source).filter((name) => name.endsWith('.json'));
if (files.length === 0) {
  console.error('✗ sync:handoff — no JSON files in docs/handoff.');
  process.exit(1);
}

mkdirSync(target, { recursive: true });
for (const name of files) copyFileSync(join(source, name), join(target, name));

console.log(`✓ sync:handoff — ${files.join(', ')} → resources/data/`);

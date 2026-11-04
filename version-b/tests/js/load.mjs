/**
 * Loads browser scripts of resources/js into an isolated context, exactly as the browser runs them
 * (IIFEs that register on window.GP), and returns that window. No bundler, no DOM needed.
 */
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

export function loadScripts(...files) {
  const window = { URLSearchParams };
  window.window = window;
  const context = createContext(window);
  for (const file of files) {
    const path = new URL(`../../resources/js/${file}`, import.meta.url);
    runInContext(readFileSync(path, 'utf8'), context, { filename: file });
  }
  return window;
}

/** Results labels as in lang/it/ui.php (pinned by tests/Unit/UiStringsTest.php). */
export const RESULTS_LABELS = {
  none: 'Nessun prodotto trovato',
  one: '1 prodotto trovato',
  many: ':count prodotti trovati',
};

/**
 * Search normalisation shared by the catalogue filter.
 * Lowercase, accent-insensitive, punctuation-insensitive (see docs/PLAN.md §4.1).
 */

const DIACRITICS = /\p{Diacritic}/gu;
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]+/gu;

/** "NEURA-Q — Età" → "neura q eta" */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLocaleLowerCase('it-IT')
    .replace(NON_ALPHANUMERIC, ' ')
    .trim();
}

/**
 * True when every word of `query` appears in `text` (AND, any order),
 * or when the query without spaces appears in the text without spaces ("neuraq" → "NEURA-Q").
 * A blank query matches everything.
 */
export function matchesQuery(text: string, query: string): boolean {
  const q = normalize(query);
  if (q === '') return true;

  const haystack = normalize(text);
  const tokens = q.split(' ');
  if (tokens.every((token) => haystack.includes(token))) return true;

  return haystack.replaceAll(' ', '').includes(q.replaceAll(' ', ''));
}

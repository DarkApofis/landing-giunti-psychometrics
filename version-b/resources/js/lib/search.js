/**
 * Search normalisation, ported 1:1 from version-a/src/lib/search.ts (docs/HANDOFF-LARAVEL.md §6.1):
 * lowercase, accent-insensitive, punctuation-insensitive.
 * Pure functions; registered as GP.lib.search (tests run this same file, see tests/js).
 */
(function (window) {
  'use strict';

  var DIACRITICS = /\p{Diacritic}/gu;
  var NON_ALPHANUMERIC = /[^\p{L}\p{N}]+/gu;

  /** "NEURA-Q — Età" → "neura q eta" */
  function normalize(input) {
    return String(input)
      .normalize('NFD')
      .replace(DIACRITICS, '')
      .toLocaleLowerCase('it-IT')
      .replace(NON_ALPHANUMERIC, ' ')
      .trim();
  }

  /**
   * True when every word of `query` appears in `text` (AND, any order), or when the query without
   * spaces appears in the text without spaces ("neuraq" → "NEURA-Q"). A blank query matches everything.
   */
  function matchesQuery(text, query) {
    var q = normalize(query);
    if (q === '') return true;

    var haystack = normalize(text);
    var tokens = q.split(' ');
    if (tokens.every(function (token) { return haystack.indexOf(token) !== -1; })) return true;

    return haystack.replace(/ /g, '').indexOf(q.replace(/ /g, '')) !== -1;
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.search = { normalize: normalize, matchesQuery: matchesQuery };
})(window);

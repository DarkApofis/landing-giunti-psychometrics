/**
 * Catalogue filtering, ported from version-a/src/lib/catalog.ts (docs/HANDOFF-LARAVEL.md §6.1).
 * Pure functions over plain items { id, category, name }; texts come from the config (lang/it),
 * never from this file. Registered as GP.lib.catalog (tests run this same file, see tests/js).
 */
(function (window) {
  'use strict';

  var ALL = 'tutti';
  var URL_PARAMS = { category: 'categoria', query: 'q' };
  var MAX_QUERY_LENGTH = 100;
  var DEFAULT_FILTERS = Object.freeze({ category: ALL, query: '' });

  function search() {
    return window.GP.lib.search;
  }

  /** Order-preserving filter: category AND name query. */
  function filterItems(items, filters) {
    return items.filter(function (item) {
      return (
        (filters.category === ALL || item.category === filters.category) &&
        search().matchesQuery(item.name, filters.query)
      );
    });
  }

  /** Number of items per category (and "tutti") with the current query applied; unmatched → 0. */
  function countByCategory(items, query, categoryIds) {
    var counts = {};
    counts[ALL] = 0;
    categoryIds.forEach(function (id) {
      counts[id] = 0;
    });

    filterItems(items, { category: ALL, query: query }).forEach(function (item) {
      counts[item.category] += 1;
      counts[ALL] += 1;
    });
    return counts;
  }

  /** "Nessun prodotto trovato" · "1 prodotto trovato" · "8 prodotti trovati" (labels from lang/it). */
  function resultsLabel(count, labels) {
    if (count === 0) return labels.none;
    return count === 1 ? labels.one : window.GP.lib.text.fill(labels.many, { count: count });
  }

  /** Reads filters from a query string; an unknown category falls back to "tutti", q ≤ 100 chars. */
  function parseFilters(queryString, categoryIds) {
    var params = new URLSearchParams(queryString);
    var category = params.get(URL_PARAMS.category);
    return {
      category: category !== null && categoryIds.indexOf(category) !== -1 ? category : ALL,
      query: (params.get(URL_PARAMS.query) || '').slice(0, MAX_QUERY_LENGTH),
    };
  }

  /** Serialises filters; the default state gives "" so the URL stays clean. */
  function filtersToSearch(filters) {
    var params = new URLSearchParams();
    if (filters.category !== ALL) params.set(URL_PARAMS.category, filters.category);
    var q = filters.query.trim();
    if (q !== '') params.set(URL_PARAMS.query, q);
    var result = params.toString();
    return result === '' ? '' : '?' + result;
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.catalog = {
    ALL: ALL,
    DEFAULT_FILTERS: DEFAULT_FILTERS,
    filterItems: filterItems,
    countByCategory: countByCategory,
    resultsLabel: resultsLabel,
    parseFilters: parseFilters,
    filtersToSearch: filtersToSearch,
  };
})(window);

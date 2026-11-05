/**
 * Catalogue behaviour (docs/HANDOFF-LARAVEL.md §6.1; mirrors version-a's Catalog, CategoryFilter,
 * ResultsStatus, EmptyState, SearchBox, CatalogLink and CatalogFiltersProvider).
 *
 * State { category, query }. Visible = (category is "tutti" or matches) AND the name matches the query.
 * The server-rendered <li>s are shown/hidden with `hidden`, never reordered. Every change updates:
 * pills (aria-pressed, counts with the search applied, aria-label "{label} {n} prodotti"), the visible
 * counter (at once) and its live region (400 ms after the last change), the empty state, the search
 * box (value, clear button) and the URL (?categoria=&q=, history.replaceState).
 * All texts come from the config (lang/it via Blade).
 */
(function (window, document, $) {
  'use strict';

  var ANNOUNCE_DELAY_MS = 400;

  function init($root, config) {
    var $catalog = $root.find('[data-catalog]');
    if ($catalog.length === 0) return;

    var lib = window.GP.lib;
    var fill = lib.text.fill;
    var texts = config.i18n.catalog;
    var categories = config.catalog.categories;
    var categoryIds = categories.map(function (c) { return c.id; });
    var labels = { tutti: config.catalog.allLabel };
    categories.forEach(function (c) { labels[c.id] = c.label; });

    var $scroller = $catalog.find('.category-filter');
    var $pills = $scroller.find('.pill');
    var $grid = $catalog.find('.product-grid');
    var $empty = $catalog.find('.empty-state');
    var $emptyContext = $empty.find('[data-empty-context]');
    var $counter = $catalog.find('.results-status__visible');
    var $live = $catalog.find('.results-status [role="status"]');
    var $input = $('#site-search-input');
    var $clear = $('.site-search__clear');

    // Items read once from the server-rendered cards. data-search = normalised name (docs/ASSUMPTIONS.md B10).
    var items = $grid.children('.product-grid__item').map(function () {
      var $li = $(this);
      var name = $li.find('.product-card__title').text().trim(); // $.trim was removed in jQuery 4
      $li.attr('data-search', lib.search.normalize(name));
      return { id: $li.data('id'), category: $li.data('category'), name: name, el: this };
    }).get();

    var state = { category: lib.catalog.ALL, query: '' };
    var announceTimer = null;

    function render(options) {
      var visible = lib.catalog.filterItems(items, state);
      var visibleIds = {};
      visible.forEach(function (item) { visibleIds[item.id] = true; });
      items.forEach(function (item) { item.el.hidden = !visibleIds[item.id]; });

      // Pills: pressed state and counts with the current search applied.
      var counts = lib.catalog.countByCategory(items, state.query, categoryIds);
      $pills.each(function () {
        var id = $(this).data('category');
        var pressed = id === state.category;
        $(this)
          .attr('aria-pressed', pressed ? 'true' : 'false')
          .toggleClass('is-active', pressed)
          .attr('aria-label', fill(texts.pill_label, { label: labels[id], count: counts[id] }))
          .find('.pill__count').text(counts[id]);
      });

      // Counter: visible text at once, announcement once typing pauses.
      var label = lib.catalog.resultsLabel(visible.length, texts.results);
      $counter.text(label);
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(function () { $live.text(label); }, ANNOUNCE_DELAY_MS);

      // Empty state with context: "Nessun risultato per «…» in …. " (each part only when it applies).
      var empty = visible.length === 0;
      $grid.prop('hidden', empty);
      $empty.prop('hidden', !empty);
      if (empty) $emptyContext.text(emptyContext());

      // Search box mirrors the state (deep links, reset).
      if ($input.val() !== state.query) $input.val(state.query);
      $clear.prop('hidden', state.query === '');

      if (!options || options.updateUrl !== false) writeUrl();
    }

    function emptyContext() {
      var parts = [];
      var query = state.query.trim();
      if (query !== '') parts.push(fill(texts.empty_context.query, { query: query }));
      if (state.category !== lib.catalog.ALL) {
        parts.push(fill(texts.empty_context.category, { category: labels[state.category] }));
      }
      return parts.length === 0 ? '' : texts.empty_context.lead + ' ' + parts.join(' ') + '. ';
    }

    function writeUrl() {
      var location = window.location;
      var next = lib.catalog.filtersToSearch(state);
      if (next !== location.search) {
        window.history.replaceState(window.history.state, '', location.pathname + next + location.hash);
      }
    }

    function setCategory(category) {
      state.category = category;
      render();
      scrollActivePillIntoView();
    }

    function setQuery(query) {
      state.query = query;
      render();
    }

    /** Mobile scroller: keep the active pill visible without touching the page's vertical scroll. */
    function scrollActivePillIntoView() {
      var scroller = $scroller[0];
      var active = $pills.filter('[aria-pressed="true"]')[0];
      if (!active || scroller.scrollWidth <= scroller.clientWidth) return;
      var left = active.offsetLeft - scroller.offsetLeft;
      var right = left + active.offsetWidth;
      if (left < scroller.scrollLeft || right > scroller.scrollLeft + scroller.clientWidth) {
        scroller.scrollTo({ left: Math.max(0, left - 16) });
      }
    }

    // ── Events ────────────────────────────────────────────────────────────────
    $pills.on('click', function () {
      setCategory($(this).data('category'));
    });

    // A focused pill is always scrolled fully into the row (no scroll-snap: docs/AUDIT.md H2).
    $pills.on('focus', function () {
      this.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    $input.on('input', function () {
      setQuery(this.value);
    });

    $clear.on('click', function () {
      setQuery('');
      $input.trigger('focus');
    });

    // Enter scrolls to the catalogue; smoothness follows the CSS scroll-behavior (reduced motion aware).
    $input.closest('form').on('submit', function (event) {
      event.preventDefault();
      $catalog[0].scrollIntoView({ block: 'start' });
    });

    $empty.find('[data-reset-filters]').on('click', function () {
      state = { category: lib.catalog.ALL, query: '' };
      render();
      $pills.filter('[data-category="' + lib.catalog.ALL + '"]').trigger('focus');
    });

    // Links that pre-filter (nav "Test"/"Formazione", hero CTA, footer "Esplora", cart "Scopri i corsi"):
    // apply the category and let the anchor do the native scroll.
    $(document).on('click', 'a[data-category]', function () {
      var category = $(this).attr('data-category');
      if (category === lib.catalog.ALL || categoryIds.indexOf(category) !== -1) setCategory(category);
    });

    // Initial state from the URL (unknown category → "Tutti", query ≤ 100 characters).
    state = lib.catalog.parseFilters(window.location.search, categoryIds);
    render({ updateUrl: false });
    scrollActivePillIntoView();
    // Pill widths change when the web fonts replace the fallback: place the active pill again then
    // (on a slow connection the first placement used the fallback metrics).
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scrollActivePillIntoView);
  }

  window.GP.modules.catalog = { init: init };
})(window, document, window.jQuery);

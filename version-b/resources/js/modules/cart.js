/**
 * Cart (docs/HANDOFF-LARAVEL.md §6.5; mirrors version-a's CartProvider, CartButton, CartDrawer,
 * QuantityStepper and AddToCartButton). Only courses are cartable.
 *
 * State { items: [{ productId, quantity }] } in memory, persisted to localStorage "giunti-cart"
 * (GP.lib.storage never throws; GP.lib.cart.parseStored reads defensively) and synced across tabs
 * with the `storage` event. The server always renders the EMPTY cart; the stored one is restored
 * here once the DOM is ready, WITHOUT announcing it. Money is computed in integer cents.
 * The drawer lines are updated in place (never rebuilt), so keyboard focus is never lost.
 */
(function (window, document, $) {
  'use strict';

  var FEEDBACK_MS = 2000;

  function init($root, config) {
    var $drawer = $root.find('[data-cart-drawer]');
    if ($drawer.length === 0) return;

    var lib = window.GP.lib;
    var cart = lib.cart;
    var texts = config.i18n.cart;
    var productTexts = config.i18n.product;
    var products = config.products || {};
    var validIds = Object.keys(products);
    var modal = window.GP.ui.modalDialog($drawer[0]);

    var $button = $root.find('.cart-button');
    var $badge = $button.find('.cart-button__badge');
    var $countLive = $root.find('[data-cart-live]');
    var $count = $drawer.find('[data-cart-count]');
    var $empty = $drawer.find('[data-cart-empty]');
    var $emptyAction = $empty.find('a');
    var $content = $drawer.find('[data-cart-content]');
    var $list = $drawer.find('[data-cart-list]');
    var $subtotal = $drawer.find('[data-cart-subtotal]');
    var $savingsRow = $drawer.find('[data-cart-savings-row]');
    var $savings = $drawer.find('[data-cart-savings]');
    var template = document.getElementById('cart-line-template');

    var state = cart.EMPTY_CART;
    var lineElements = {}; // productId → <li>
    var lastCount = 0;

    function fillText(text, values) {
      return Object.keys(values).reduce(function (result, key) {
        return result.replace(':' + key, values[key]);
      }, text);
    }

    // ── Rendering ─────────────────────────────────────────────────────────────
    function render(options) {
      var lines = cart.lines(state, products);
      var totals = cart.totals(lines);

      renderButton(totals.count, options && options.announce);
      $count.text(totals.count);
      $empty.prop('hidden', lines.length > 0);
      $content.prop('hidden', lines.length === 0);
      renderLines(lines);
      $subtotal.text(lib.format.cents(totals.subtotalCents));
      $savingsRow.prop('hidden', totals.savingsCents <= 0);
      $savings.text(lib.format.cents(totals.savingsCents));
    }

    function renderButton(count, announce) {
      var label = cart.countLabel(count, texts.count);
      $button.attr('aria-label', count === 0 ? texts.button.empty : texts.button.with_items.replace(':count', label));
      $badge.prop('hidden', count === 0).text(count > 99 ? '99+' : String(count));
      // Polite announcement of the new total, only for real changes (never when restoring).
      if (announce && count !== lastCount) $countLive.text(label);
      lastCount = count;
    }

    function renderLines(lines) {
      var keep = {};
      lines.forEach(function (line, index) {
        var id = line.product.id;
        keep[id] = true;
        var li = lineElements[id] || (lineElements[id] = createLine(line.product));
        updateLine(li, line);
        // Keep DOM order = cart order without moving nodes that are already in place (focus stays).
        var current = $list[0].children[index];
        if (current !== li) $list[0].insertBefore(li, current || null);
      });
      Object.keys(lineElements).forEach(function (id) {
        if (!keep[id]) {
          $(lineElements[id]).remove();
          delete lineElements[id];
        }
      });
    }

    function createLine(product) {
      var li = template.content.firstElementChild.cloneNode(true);
      var $li = $(li);
      var name = product.name;
      $li.attr('data-product-id', product.id);
      $li.find('[data-slot="thumb"]').attr('src', product.image.thumb);
      $li.find('[data-slot="name"]').text(name);
      $li.find('[data-slot="format"]').text(product.format.label);
      $li.find('[data-slot="date"]').attr('datetime', product.startDate).text(product.startDateShort);
      $li.find('[data-slot="stepper"]').attr('aria-label', fillText(texts.stepper, { name: name }));
      $li.find('[data-step="-1"]').attr('aria-label', fillText(texts.decrease, { name: name }));
      $li.find('[data-step="1"]').attr('aria-label', fillText(texts.increase, { name: name }));
      $li.find('[data-cart-remove]').attr('aria-label', fillText(texts.remove, { name: name }));
      return li;
    }

    function updateLine(li, line) {
      var $li = $(li);
      $li.find('[data-slot="unit"]').text(lib.format.cents(line.unitCents));
      $li.find('[data-slot="quantity"]').text(line.quantity).attr('aria-label', fillText(texts.quantity, { count: line.quantity }));
      $li.find('[data-slot="total"]').text(lib.format.cents(line.lineCents));
      // aria-disabled, not disabled: a control that becomes disabled while focused drops focus to <body>.
      $li.find('[data-step="-1"]').attr('aria-disabled', line.quantity <= 1 ? 'true' : null);
      $li.find('[data-step="1"]').attr('aria-disabled', line.quantity >= cart.MAX_QUANTITY ? 'true' : null);
    }

    // ── State changes ─────────────────────────────────────────────────────────
    function commit(action, options) {
      state = cart.reduce(state, action);
      if (!options || options.persist !== false) lib.storage.write(cart.STORAGE_KEY, cart.serialize(state));
      render({ announce: true });
    }

    function restore() {
      state = cart.parseStored(lib.storage.read(cart.STORAGE_KEY), validIds);
    }

    // ── Events ────────────────────────────────────────────────────────────────
    $button.on('click', function () {
      modal.open();
    });

    // "Aggiungi al carrello": add, announce, and confirm on the button for 2 s.
    $root.on('click', '[data-add-to-cart]', function () {
      var $add = $(this);
      var product = products[$add.attr('data-add-to-cart')];
      if (!product || !cart.isCartable(product)) return;

      commit({ type: 'add', productId: product.id });
      window.GP.announce(fillText(texts.added, { name: product.name }));

      window.clearTimeout($add.data('feedbackTimer'));
      setAddedFeedback($add, product, true);
      $add.data('feedbackTimer', window.setTimeout(function () {
        setAddedFeedback($add, product, false);
      }, FEEDBACK_MS));
    });

    function setAddedFeedback($add, product, added) {
      var action = added ? productTexts.added : productTexts.add;
      $add
        .toggleClass('is-added', added)
        .attr('aria-label', fillText(productTexts.actionLabel, { action: action, name: product.name }))
        .find('.product-card__add-text').text(action);
    }

    $list.on('click', '[data-step]', function () {
      if (this.getAttribute('aria-disabled') === 'true') return;
      var id = $(this).closest('[data-product-id]').attr('data-product-id');
      var item = state.items.filter(function (i) { return i.productId === id; })[0];
      if (!item) return;
      commit({ type: 'setQuantity', productId: id, quantity: item.quantity + Number(this.getAttribute('data-step')) });
    });

    // Remove: announce it and move focus to the next line's "Rimuovi" (or the previous one, or the
    // empty-state action), never to <body>.
    $list.on('click', '[data-cart-remove]', function () {
      var $li = $(this).closest('[data-product-id]');
      var id = $li.attr('data-product-id');
      var neighbour = $li.next()[0] || $li.prev()[0];
      var neighbourId = neighbour ? neighbour.getAttribute('data-product-id') : null;

      commit({ type: 'remove', productId: id });
      window.GP.announce(fillText(texts.removed, { name: products[id].name }));

      if (neighbourId && lineElements[neighbourId]) $(lineElements[neighbourId]).find('[data-cart-remove]').trigger('focus');
      else $emptyAction.trigger('focus');
    });

    $drawer.on('click', '[data-cart-clear]', function () {
      commit({ type: 'clear' });
      window.GP.announce(texts.cleared);
      $emptyAction.trigger('focus');
    });

    // Another tab changed the cart: reload it (and do not write it back).
    $(window).on('storage', function (event) {
      if (event.originalEvent.key !== cart.STORAGE_KEY) return;
      restore();
      render({ announce: true });
    });

    // First paint was the empty cart (server): restore the stored one silently.
    restore();
    render({ announce: false });
  }

  window.GP.modules.cart = { init: init };
})(window, document, window.jQuery);

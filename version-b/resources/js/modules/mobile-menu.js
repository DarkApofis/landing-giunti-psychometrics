/**
 * Mobile menu, < 1024px (docs/HANDOFF-LARAVEL.md §6.3; mirrors version-a's MobileMenu.tsx).
 *
 * - Toggle: aria-expanded true/false, label "Apri il menu" ↔ "Chiudi il menu" (from the config),
 *   icon Menu ↔ X (CSS, from aria-expanded).
 * - Open: un-hide the panel, focus the first link, lock the page scroll.
 * - Simple focus trap: Tab from the last control → toggle; Shift+Tab from the toggle → last control.
 * - Esc closes and returns focus to the toggle. A click on the backdrop or on a link closes
 *   (without moving focus: the link navigates). Crossing to desktop (≥ 64rem) closes it.
 */
(function (window, document, $) {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';
  var DESKTOP_QUERY = '(min-width: 64rem)';

  function init($root, config) {
    var $menu = $root.find('[data-mobile-menu]');
    if ($menu.length === 0) return;

    var labels = (config.i18n && config.i18n.menu) || {};
    var $toggle = $menu.find('.mobile-menu__toggle');
    var $panel = $('#' + $toggle.attr('aria-controls'));
    var root = document.documentElement;
    var isOpen = false;
    var previousOverflow = '';

    /** Toggle first, then the visible controls of the panel (Accedi is hidden from 768px). */
    function focusables() {
      return [$toggle[0]].concat($panel.find(FOCUSABLE).filter(':visible').get());
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      $panel.prop('hidden', false);
      $toggle.attr({ 'aria-expanded': 'true', 'aria-label': labels.close });
      previousOverflow = root.style.overflow;
      root.style.overflow = 'hidden';
      $panel.find(FOCUSABLE).filter(':visible').first().trigger('focus');
      $(document).on('keydown.mobileMenu', onKeydown);
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      $panel.prop('hidden', true);
      $toggle.attr({ 'aria-expanded': 'false', 'aria-label': labels.open });
      root.style.overflow = previousOverflow;
      $(document).off('keydown.mobileMenu');
      if (returnFocus) $toggle.trigger('focus');
    }

    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== 'Tab') return;

      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (items.indexOf(active) === -1) {
        // Focus escaped (e.g. after a click elsewhere): bring it back inside.
        event.preventDefault();
        first.focus();
      }
    }

    $toggle.on('click', function () {
      if (isOpen) close(false);
      else open();
    });

    $panel.on('click', '.mobile-menu__backdrop', function () {
      close(false);
    });

    // A link closes the menu and lets the browser follow the anchor (native scroll).
    $panel.on('click', 'a[href]', function () {
      close(false);
    });

    var desktop = window.matchMedia(DESKTOP_QUERY);
    desktop.addEventListener('change', function (event) {
      if (event.matches) close(false);
    });
  }

  window.GP.modules.mobileMenu = { init: init };
})(window, document, window.jQuery);

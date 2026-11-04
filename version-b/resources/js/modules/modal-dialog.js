/**
 * Common pattern of the native modal <dialog> (docs/HANDOFF-LARAVEL.md §6.4; mirrors version-a's
 * useModalDialog), shared by the details dialog and the cart drawer:
 *
 * - showModal() gives role="dialog", aria-modal, an inert background and Esc (native `cancel`).
 * - On open the active element is saved; on `close` focus returns to it (if still in the page).
 * - A click whose target is the <dialog> itself hit the backdrop (the content fills the box) → close.
 * - Tab / Shift+Tab wrap between the first and last visible focusable control.
 * - [data-dialog-close] closes; [data-dialog-leave] (links to another part of the page, e.g.
 *   "Richiedi informazioni", "Scopri i corsi") closes WITHOUT returning focus, and the link navigates.
 *
 * Exposed as GP.ui.modalDialog(dialogElement) → { open, close, isOpen }.
 */
(function (window, document, $) {
  'use strict';

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function modalDialog(dialog) {
    var $dialog = $(dialog);
    var returnFocusTo = null;

    function focusables() {
      return $dialog.find(FOCUSABLE).filter(function () {
        return this.offsetParent !== null || this === document.activeElement;
      }).get();
    }

    $dialog.on('close', function () {
      var target = returnFocusTo;
      returnFocusTo = null;
      if (target && target.isConnected) target.focus();
    });

    $dialog.on('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    $dialog.on('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    $dialog.on('click', '[data-dialog-close]', function () {
      dialog.close();
    });

    $dialog.on('click', '[data-dialog-leave]', function () {
      returnFocusTo = null;
      dialog.close();
    });

    return {
      open: function () {
        if (dialog.open) return;
        returnFocusTo = document.activeElement;
        dialog.showModal();
      },
      close: function (returnFocus) {
        if (returnFocus === false) returnFocusTo = null;
        if (dialog.open) dialog.close();
      },
      isOpen: function () {
        return dialog.open;
      },
    };
  }

  var GP = window.GP;
  GP.ui = GP.ui || {};
  GP.ui.modalDialog = modalDialog;
})(window, document, window.jQuery);

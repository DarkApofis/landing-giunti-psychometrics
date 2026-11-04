/**
 * Entry point: initialises every module once the DOM is ready (the bundle is loaded with defer).
 * Each module registers itself in GP.modules as { init: function ($root, config) {} }.
 * Modules start independently: an error in one is reported and does not stop the others.
 */
(function (window, $) {
  'use strict';

  $(function () {
    var GP = window.GP;
    var $root = $(document.body);

    $.each(GP.modules, function (name, module) {
      if (!module || typeof module.init !== 'function') return;
      try {
        module.init($root, GP.config);
      } catch (error) {
        window.console.error('[GP] module "' + name + '" failed to start', error);
      }
    });
  });
})(window, window.jQuery);

/**
 * Entry point: initialises every module once the DOM is ready (the bundle is loaded with defer).
 * Each module registers itself in GP.modules as { init: function ($root, config) {} }.
 */
(function (window, $) {
  'use strict';

  $(function () {
    var GP = window.GP;
    var $root = $(document.body);

    $.each(GP.modules, function (_name, module) {
      if (module && typeof module.init === 'function') module.init($root, GP.config);
    });
  });
})(window, window.jQuery);

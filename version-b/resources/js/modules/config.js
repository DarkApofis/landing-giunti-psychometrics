/**
 * Reads, once, the configuration that Blade renders as JSON
 * (<script type="application/json" id="app-config">) and exposes it frozen as GP.config.
 * JSON is never executed, so it is neither inline JS nor render-blocking.
 */
(function (window, document) {
  'use strict';

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  var node = document.getElementById('app-config');
  var config = {};

  if (node) {
    try {
      config = JSON.parse(node.textContent || '{}');
    } catch (error) {
      config = {};
    }
  }

  GP.config = Object.freeze(config);
})(window, document);

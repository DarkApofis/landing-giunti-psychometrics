/**
 * One polite live region for transient events ("… aggiunto al carrello"), as version-a's Announcer.
 * Clearing first and writing on the next frame makes a repeated identical message be announced again.
 * Exposed as GP.announce(message).
 */
(function (window, document) {
  'use strict';

  var GP = window.GP;
  var frame = null;

  GP.announce = function (message) {
    var region = document.querySelector('[data-announcer]');
    if (!region) return;
    if (frame !== null) window.cancelAnimationFrame(frame);
    region.textContent = '';
    frame = window.requestAnimationFrame(function () {
      frame = null;
      region.textContent = message;
    });
  };
})(window, document);

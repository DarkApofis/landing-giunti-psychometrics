/**
 * localStorage access that never throws (ported from version-a/src/lib/storage.ts): storage can be
 * blocked (privacy settings, sandboxed iframes), full (QuotaExceededError) or disabled (some private
 * modes), and even reading `window.localStorage` can throw. Callers get null / false and keep working
 * in memory. Registered as GP.lib.storage.
 */
(function (window) {
  'use strict';

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.storage = { read: read, write: write };
})(window);

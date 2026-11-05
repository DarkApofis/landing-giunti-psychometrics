/**
 * Fills the :placeholders of the lang/it strings (Laravel style) that reach the JS through #app-config.
 * The only templating helper of version B: String.prototype.replace with a string value would treat
 * "$&", "$`", "$'" and "$$" in user text (a name, a search query from the URL) as replacement patterns.
 * Longer keys go first, so :count never eats the start of :counted.
 * Registered as GP.lib.text.
 */
(function (window) {
  'use strict';

  /** fill('Grazie :name', { name: 'Ana' }) → "Grazie Ana" (every occurrence, values inserted literally). */
  function fill(template, values) {
    return Object.keys(values)
      .sort(function (a, b) { return b.length - a.length; })
      .reduce(function (text, key) {
        return text.split(':' + key).join(String(values[key]));
      }, String(template));
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.text = { fill: fill };
})(window);

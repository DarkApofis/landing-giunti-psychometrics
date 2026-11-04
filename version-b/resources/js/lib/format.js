/**
 * Price formatting for what only the browser can compute (cart line totals, subtotal, savings).
 * Everything else arrives already formatted by PHP (App\Support\Format). Same options as
 * version-a/src/lib/format.ts; both sides pass the same cases (tests/js/format.test.mjs and
 * tests/Unit/FormatTest.php). `useGrouping: 'always'` is required: CLDR gives Italian
 * minimumGroupingDigits = 2, so without it 1250 prints as "1250,00 €".
 * Registered as GP.lib.format.
 */
(function (window) {
  'use strict';

  var formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    useGrouping: 'always',
  });

  /** 1250 → "1.250,00 €" (no-break space before the euro sign). */
  function price(euros) {
    return formatter.format(euros);
  }

  /** 125000 → "1.250,00 €" — integer cents, as the cart computes them. */
  function cents(value) {
    return formatter.format(value / 100);
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.format = { price: price, cents: cents };
})(window);

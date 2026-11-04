/**
 * Cart domain logic, ported from version-a/src/lib/cart.ts (docs/HANDOFF-LARAVEL.md §6.5).
 * Pure functions; registered as GP.lib.cart (tests run this same file, see tests/js).
 *
 * - The state stores only product ids and quantities: names and prices are resolved against the
 *   catalogue on every render, so stored data can never become stale.
 * - Money is computed in integer cents (19.99 × 3 = 59.97000000000001 in floats).
 * - Only courses are cartable: tests need a professional-qualification check first.
 */
(function (window) {
  'use strict';

  var MAX_QUANTITY = 99;
  var STORAGE_KEY = 'giunti-cart';
  var STORAGE_VERSION = 1;
  var EMPTY_CART = Object.freeze({ items: Object.freeze([]) });

  function clamp(n) {
    return Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(n)));
  }

  /** Returns a new state; never mutates the previous one. */
  function reduce(state, action) {
    switch (action.type) {
      case 'add': {
        var existing = state.items.filter(function (i) { return i.productId === action.productId; })[0];
        if (!existing) {
          return { items: state.items.concat([{ productId: action.productId, quantity: 1 }]) };
        }
        return reduce(state, { type: 'setQuantity', productId: action.productId, quantity: existing.quantity + 1 });
      }
      case 'setQuantity': {
        var quantity = clamp(action.quantity);
        if (quantity === 0) return reduce(state, { type: 'remove', productId: action.productId });
        return {
          items: state.items.map(function (i) {
            return i.productId === action.productId ? { productId: i.productId, quantity: quantity } : i;
          }),
        };
      }
      case 'remove':
        return { items: state.items.filter(function (i) { return i.productId !== action.productId; }) };
      case 'clear':
        return EMPTY_CART;
      case 'hydrate':
        return action.state;
      default:
        return state;
    }
  }

  function count(state) {
    return state.items.reduce(function (sum, i) { return sum + i.quantity; }, 0);
  }

  /** Euros → integer cents. toFixed(6) first absorbs binary noise (1.005 × 100 = 100.49999…). */
  function toCents(euros) {
    return Math.round(Number((euros * 100).toFixed(6)));
  }

  function isCartable(product) {
    return product.type === 'corso';
  }

  /**
   * Resolves stored items against the catalogue (map id → product with originalPrice/discountPrice);
   * unknown or non-cartable ids are skipped.
   */
  function lines(state, productsById) {
    return state.items.reduce(function (result, item) {
      var product = productsById[item.productId];
      if (!product || !isCartable(product)) return result;
      var unitCents = toCents(product.discountPrice === null ? product.originalPrice : product.discountPrice);
      result.push({
        product: product,
        quantity: item.quantity,
        unitCents: unitCents,
        listUnitCents: toCents(product.originalPrice),
        lineCents: unitCents * item.quantity,
      });
      return result;
    }, []);
  }

  function totals(cartLines) {
    var result = { count: 0, subtotalCents: 0, listTotalCents: 0, savingsCents: 0 };
    cartLines.forEach(function (line) {
      result.count += line.quantity;
      result.subtotalCents += line.lineCents;
      result.listTotalCents += line.listUnitCents * line.quantity;
    });
    result.savingsCents = result.listTotalCents - result.subtotalCents;
    return result;
  }

  /** "Nessun articolo nel carrello" · "1 articolo nel carrello" · "3 articoli nel carrello" (labels from lang/it). */
  function countLabel(n, labels) {
    if (n === 0) return labels.none;
    return n === 1 ? labels.one : labels.many.replace(':count', String(n));
  }

  function serialize(state) {
    return JSON.stringify({ version: STORAGE_VERSION, items: state.items });
  }

  /**
   * Defensive parse of whatever is in localStorage (corrupted, edited by hand, from an older catalogue):
   * invalid JSON or shape → empty cart; unknown ids and malformed lines dropped; duplicates merged;
   * quantities truncated and clamped to 1–99. `validIds` is an array of known product ids.
   */
  function parseStored(raw, validIds) {
    if (raw === null || raw === undefined) return EMPTY_CART;
    var data;
    try {
      data = JSON.parse(raw);
    } catch {
      return EMPTY_CART;
    }
    if (typeof data !== 'object' || data === null || !Array.isArray(data.items)) return EMPTY_CART;

    var order = [];
    var merged = {};
    data.items.forEach(function (entry) {
      if (typeof entry !== 'object' || entry === null) return;
      var id = entry.productId;
      var quantity = entry.quantity;
      if (typeof id !== 'string' || validIds.indexOf(id) === -1) return;
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return;
      var q = Math.trunc(quantity);
      if (q < 1) return;
      if (!Object.prototype.hasOwnProperty.call(merged, id)) {
        order.push(id);
        merged[id] = 0;
      }
      merged[id] += q;
    });

    return {
      items: order.map(function (id) { return { productId: id, quantity: clamp(merged[id]) }; }),
    };
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.cart = {
    MAX_QUANTITY: MAX_QUANTITY,
    STORAGE_KEY: STORAGE_KEY,
    EMPTY_CART: EMPTY_CART,
    reduce: reduce,
    count: count,
    toCents: toCents,
    isCartable: isCartable,
    lines: lines,
    totals: totals,
    countLabel: countLabel,
    serialize: serialize,
    parseStored: parseStored,
  };
})(window);

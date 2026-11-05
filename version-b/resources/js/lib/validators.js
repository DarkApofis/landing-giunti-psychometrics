/**
 * Contact form validation, ported from version-a/src/lib/validators.ts (docs/HANDOFF-LARAVEL.md §6.2).
 * Pure functions; the messages and limits are injected (they come from lang/it and content.json through
 * the page configuration, never written here). Values are trimmed before checking and lengths count
 * characters (code points, Array.from), not UTF-16 units.
 *
 *   var v = GP.lib.validators.create(messages, limits);
 *   v.validateField('email', 'x') → "Inserisci un indirizzo email valido, …"
 *
 * Registered as GP.lib.validators (tests run this same file, see tests/js).
 */
(function (window) {
  'use strict';

  /** Visual (and focus) order of the fields. */
  var FIELDS = ['nome', 'email', 'messaggio'];

  // Pragmatic address check (not full RFC 5322), identical to version-a: dot-separated local part
  // without leading, trailing or doubled dots; domain labels that do not start/end with "-";
  // alphabetic TLD of at least 2 letters.
  var EMAIL =
    /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  function length(value) {
    return Array.from(value).length;
  }

  function fill(template, values) {
    return window.GP.lib.text.fill(template, values);
  }

  function create(messages, limits) {
    function isValidEmail(value) {
      return value.length <= limits.emailMax && EMAIL.test(value);
    }

    function validateNome(raw) {
      var value = raw.trim();
      var m = messages.nome;
      if (value === '') return m.required;
      if (length(value) < limits.nomeMin) return fill(m.min, { min: limits.nomeMin });
      if (length(value) > limits.nomeMax) return fill(m.max, { max: limits.nomeMax });
      return undefined;
    }

    function validateEmail(raw) {
      var value = raw.trim();
      var m = messages.email;
      if (value === '') return m.required;
      if (!isValidEmail(value)) return m.invalid;
      return undefined;
    }

    function validateMessaggio(raw) {
      var value = raw.trim();
      var m = messages.messaggio;
      if (value === '') return m.required;
      var count = length(value);
      if (count < limits.messaggioMin) {
        var missing = limits.messaggioMin - count;
        var missingText = missing === 1 ? m.missing_one : fill(m.missing_many, { count: missing });
        return fill(m.min, { min: limits.messaggioMin, missing: missingText });
      }
      if (count > limits.messaggioMax) return fill(m.max, { max: limits.messaggioMax });
      return undefined;
    }

    var validators = { nome: validateNome, email: validateEmail, messaggio: validateMessaggio };

    function validateField(field, value) {
      return validators[field](value);
    }

    /** { field: message } for every invalid field (no key for valid ones). */
    function validateContact(values) {
      var errors = {};
      FIELDS.forEach(function (field) {
        var message = validateField(field, values[field]);
        if (message) errors[field] = message;
      });
      return errors;
    }

    return {
      isValidEmail: isValidEmail,
      validateNome: validateNome,
      validateEmail: validateEmail,
      validateMessaggio: validateMessaggio,
      validateField: validateField,
      validateContact: validateContact,
    };
  }

  function hasErrors(errors) {
    return FIELDS.some(function (field) { return errors[field] !== undefined; });
  }

  function firstInvalidField(errors) {
    var found = FIELDS.filter(function (field) { return errors[field] !== undefined; });
    return found.length > 0 ? found[0] : null;
  }

  var GP = (window.GP = window.GP || { lib: {}, modules: {} });
  GP.lib.validators = { FIELDS: FIELDS, create: create, hasErrors: hasErrors, firstInvalidField: firstInvalidField };
})(window);

/**
 * Contact form state machine (docs/HANDOFF-LARAVEL.md §6.2; mirrors version-a's ContactForm). No backend.
 *
 * 1. editing: no validation while leaving a field before the first submit.
 * 2. submit (novalidate, preventDefault): validate everything. With errors → mark each field
 *    (aria-invalid, error message, aria-describedby = hint + error), show the summary (role="alert")
 *    and focus the first invalid field in visual order (nome → email → messaggio).
 * 3. After the first attempt: re-validate a field on input and on blur; hide the summary as soon as
 *    the user types.
 * 4. submitting (no errors): spinner + "Invio in corso…", aria-disabled (NOT disabled: the focused
 *    button keeps focus), fields readonly, further submits ignored, internal status announced; 900 ms.
 * 5. success: hide the form, show the role="status" panel and focus its heading (tabindex="-1").
 * 6. "Invia un altro messaggio": empty form, no errors, focus on Nome.
 *
 * Messages, limits and the delay come from the page configuration (lang/it + content.json).
 */
(function (window) {
  'use strict';

  function init($root, config) {
    var $form = $root.find('[data-contact-form]');
    if ($form.length === 0) return;

    var texts = config.i18n.contact;
    var lib = window.GP.lib.validators;
    var fill = window.GP.lib.text.fill;
    var validator = lib.create(texts.validation, config.contact.limits);
    var fields = lib.FIELDS;

    var $alert = $form.find('.form-alert');
    var $alertText = $alert.find('[data-form-alert-text]');
    var $submit = $form.find('.contact-form__submit');
    var $submitLabel = $submit.find('[data-submit-label]');
    var $status = $form.find('[data-form-status]');
    var $success = $root.find('[data-form-success]');
    var $successTitle = $success.find('.form-success__title');
    var $successBody = $success.find('[data-success-body]');

    var status = 'editing';
    var submitAttempted = false;
    var timer = null;

    function control(field) {
      return $form.find('#contact-' + field);
    }

    function value(field) {
      return control(field).val();
    }

    /** Shows or clears the error of one field and keeps aria-describedby = hint (+ error). */
    function setFieldError(field, message) {
      var $control = control(field);
      var id = 'contact-' + field;
      var $error = $form.find('#' + id + '-error');
      var hintId = $form.find('#' + id + '-hint').length ? id + '-hint' : null;
      var describedBy = [hintId, message ? id + '-error' : null].filter(Boolean).join(' ');

      $control.attr('aria-invalid', message ? 'true' : null);
      $control.attr('aria-describedby', describedBy || null);
      $error.find('[data-field-error]').text(message || '');
      $error.prop('hidden', !message);
    }

    function hideSummary() {
      $alert.prop('hidden', true);
      $alertText.text('');
    }

    /** Clear first, write on the next frame: a repeated identical summary is announced again. */
    function showSummary(count) {
      var text = count === 1 ? texts.errorSummary.one : fill(texts.errorSummary.many, { count: count });
      $alertText.text('');
      $alert.prop('hidden', false);
      window.requestAnimationFrame(function () {
        $alertText.text(text);
      });
    }

    function revalidate(field) {
      if (status !== 'editing' || !submitAttempted) return;
      setFieldError(field, validator.validateField(field, value(field)));
    }

    function setSubmitting(submitting) {
      $form.toggleClass('is-submitting', submitting).attr('aria-busy', submitting ? 'true' : null);
      $submit.attr('aria-disabled', submitting ? 'true' : null);
      $submitLabel.text(submitting ? texts.submitting : texts.submit);
      $status.text(submitting ? texts.submitting : '');
      fields.forEach(function (field) {
        control(field).prop('readOnly', submitting);
      });
    }

    function reset() {
      window.clearTimeout(timer);
      status = 'editing';
      submitAttempted = false;
      fields.forEach(function (field) {
        control(field).val('');
        setFieldError(field, undefined);
      });
      hideSummary();
      setSubmitting(false);
    }

    // ── Events ────────────────────────────────────────────────────────────────
    fields.forEach(function (field) {
      control(field)
        .on('input', function () {
          if (status !== 'editing') return;
          hideSummary();
          revalidate(field);
        })
        .on('blur', function () {
          revalidate(field);
        });
    });

    $form.on('submit', function (event) {
      event.preventDefault();
      if (status !== 'editing') return; // ignore double submits while sending

      var values = {};
      fields.forEach(function (field) { values[field] = value(field); });
      var errors = validator.validateContact(values);

      if (lib.hasErrors(errors)) {
        submitAttempted = true;
        fields.forEach(function (field) { setFieldError(field, errors[field]); });
        showSummary(Object.keys(errors).length);
        control(lib.firstInvalidField(errors)).trigger('focus');
        return;
      }

      var name = values.nome.trim();
      hideSummary();
      status = 'submitting';
      setSubmitting(true);

      timer = window.setTimeout(function () {
        status = 'success';
        $successBody.text(fill(texts.successBody, { name: name }));
        $form.prop('hidden', true);
        $success.prop('hidden', false);
        $successTitle.trigger('focus');
      }, config.contact.submitDelayMs);
    });

    $success.on('click', '[data-form-again]', function () {
      reset();
      $success.prop('hidden', true);
      $form.prop('hidden', false);
      control('nome').trigger('focus');
    });
  }

  window.GP.modules.contactForm = { init: init };
})(window);

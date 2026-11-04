/**
 * "Scopri di più" for the tests (docs/HANDOFF-LARAVEL.md §6.4; mirrors version-a's ProductDialog):
 * fills the single <dialog id="product-dialog"> from the products of the page configuration (already
 * formatted by PHP) and opens it with the common modal pattern. "Chiudi" is first in the DOM, so it
 * receives the initial focus.
 */
(function (window, $) {
  'use strict';

  var FORMAT_MODIFIERS = ['cartaceo', 'digitale', 'online', 'presenza'];

  function init($root, config) {
    var dialog = $root.find('[data-product-dialog]')[0];
    if (!dialog) return;

    var $dialog = $(dialog);
    var products = config.products || {};
    var savingLabel = config.i18n.product.saving;
    var modal = window.GP.ui.modalDialog(dialog);

    function slot(name) {
      return $dialog.find('[data-slot="' + name + '"]');
    }

    function fill(product) {
      // A fresh <img> per product (from the Blade template), inserted before the badge.
      var template = $dialog.find('template[data-dialog-image]')[0];
      slot('image').remove();
      $(template.content.firstElementChild.cloneNode(true))
        .attr({ srcset: product.dialogImage.srcset, src: product.dialogImage.src, alt: product.image.alt })
        .insertAfter(template);

      var $badge = slot('badge');
      FORMAT_MODIFIERS.forEach(function (modifier) {
        $badge.removeClass('format-badge--' + modifier);
      });
      $badge.addClass('format-badge--' + product.format.modifier);
      $badge.find('[data-format-icon]').each(function () {
        $(this).attr('hidden', this.getAttribute('data-format-icon') === product.format.modifier ? null : '');
      });

      slot('format').text(product.format.label);
      slot('category').text(product.categoryLabel);
      slot('name').text(product.name);
      slot('description').text(product.description);
      slot('author').text(product.author);
      slot('age').text(product.age);
      slot('administration').text(product.administration);
      slot('qualification-label').text(product.qualification.label);
      slot('qualification-description').text(product.qualification.description);

      var discounted = product.price.percent !== null;
      slot('price-single').prop('hidden', discounted);
      slot('price-discounted').prop('hidden', !discounted);
      slot('price-final').text(product.price.final);
      slot('price-original').text(product.price.original || '');
      slot('price-percent').text(discounted ? product.price.percent : '');
      slot('price-saving').text(discounted ? savingLabel.replace(':percent', product.price.percent) : '');
    }

    $root.on('click', '[data-details]', function () {
      var product = products[$(this).attr('data-details')];
      if (!product || product.type !== 'test') return;
      fill(product);
      modal.open();
    });
  }

  window.GP.modules.productDialog = { init: init };
})(window, window.jQuery);

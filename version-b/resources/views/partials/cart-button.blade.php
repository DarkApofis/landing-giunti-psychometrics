{{--
  Header cart button (HANDOFF §4.1, DESIGN-SPEC §6.7). The first render is always an empty cart; the
  JS restores the stored cart without announcing it. The drawer (#cart-drawer) arrives with the cart block.
--}}
<button
    class="cart-button"
    type="button"
    aria-label="{{ __('ui.cart_button.empty') }}"
    aria-haspopup="dialog"
    aria-controls="cart-drawer"
>
    <x-icon name="shopping-bag" :size="24" />
    <span class="cart-button__badge" aria-hidden="true" hidden>0</span>
</button>
<span class="sr-only" role="status" aria-live="polite" data-cart-live></span>

{{--
  Cart drawer (HANDOFF §4.4, DESIGN-SPEC §6.7): native modal <dialog> anchored to the right.
  The first render is always the EMPTY cart; resources/js/modules/cart.js restores the stored cart and
  builds the lines from <template id="cart-line-template">. Texts: content.json → cart and lang/it.
--}}
<dialog class="cart-drawer" id="cart-drawer" aria-modal="true" aria-labelledby="cart-title" data-cart-drawer>
    <div class="cart-drawer__inner">
        <div class="cart-drawer__head">
            <h2 class="cart-drawer__title" id="cart-title">{{ $cart['title'] }} <span class="cart-drawer__count">(<span data-cart-count>0</span>)</span></h2>
            <button class="cart-drawer__close" type="button" aria-label="{{ $cart['close'] }}" data-dialog-close>
                <x-icon name="x" :size="24" />
            </button>
        </div>

        <div class="cart-drawer__empty" data-cart-empty>
            <span class="cart-drawer__empty-icon"><x-icon name="shopping-bag" :size="32" /></span>
            <p class="cart-drawer__empty-title">{{ $cart['empty']['title'] }}</p>
            <p class="cart-drawer__empty-text">{{ $cart['empty']['text'] }}</p>
            <a class="btn btn--primary cart-drawer__empty-action" href="#{{ $sectionIds['catalog'] }}" data-category="formazione" data-dialog-leave>{{ $cart['empty']['action'] }}</a>
        </div>

        <div class="cart-drawer__content" data-cart-content hidden>
            <ul class="cart-drawer__list" aria-label="{{ $cart['listLabel'] }}" data-cart-list></ul>

            <div class="cart-drawer__foot">
                <dl class="cart-drawer__totals">
                    <div class="cart-drawer__total-row">
                        <dt class="cart-drawer__subtotal-label">{{ $cart['subtotal'] }}</dt>
                        <dd class="cart-drawer__subtotal" data-cart-subtotal></dd>
                    </div>
                    <div class="cart-drawer__total-row is-saving" data-cart-savings-row hidden>
                        <dt>{{ $cart['savings'] }}</dt>
                        <dd class="cart-drawer__savings">&minus;<span data-cart-savings></span></dd>
                    </div>
                </dl>
                <p class="cart-drawer__vat">{{ $cart['vat'] }}</p>

                {{-- Visual only: there is no checkout in the demo (docs/ASSUMPTIONS.md A1). --}}
                <button class="btn btn--primary btn--block cart-drawer__checkout" type="button" aria-describedby="cart-demo-note">{{ $cart['checkout'] }}</button>
                <p class="cart-drawer__note" id="cart-demo-note">{{ $cart['demoNote'] }}</p>
                <button class="btn btn--ghost btn--block btn--danger-text cart-drawer__clear" type="button" data-cart-clear>
                    <x-icon name="trash-2" :size="16" />
                    {{ $cart['clear'] }}
                </button>
            </div>
        </div>
    </div>
</dialog>

{{-- One cart line; [data-slot] receive the product data, aria-labels are filled from the config. --}}
<template id="cart-line-template">
    <li class="cart-line">
        <div class="cart-line__thumb"><img class="cart-line__img" alt="" width="64" height="64" data-slot="thumb"></div>
        <div class="cart-line__body">
            <p class="cart-line__name" data-slot="name"></p>
            <p class="cart-line__meta"><span data-slot="format"></span> · <time data-slot="date"></time></p>
            <p class="cart-line__unit"><span data-slot="unit"></span> <span class="sr-only">{{ __('ui.cart.unit_sr') }}</span><span aria-hidden="true">{{ __('ui.cart.unit_visible') }}</span></p>
            <div class="cart-line__row">
                <div class="stepper" role="group" data-slot="stepper">
                    <button class="stepper__btn" type="button" data-step="-1"><x-icon name="minus" :size="16" /></button>
                    <output class="stepper__value" data-slot="quantity"></output>
                    <button class="stepper__btn" type="button" data-step="1"><x-icon name="plus" :size="16" /></button>
                </div>
                <p class="cart-line__total"><span class="sr-only">{{ __('ui.cart.line_total') }} </span><span data-slot="total"></span></p>
            </div>
            <button class="cart-line__remove" type="button" data-cart-remove>
                <x-icon name="trash-2" :size="16" />
                {{ __('ui.cart.remove_visible') }}
            </button>
        </div>
    </li>
</template>

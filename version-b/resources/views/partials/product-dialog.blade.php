{{--
  Details dialog of the tests (HANDOFF §4.4, DESIGN-SPEC §6.12): ONE native <dialog>, filled by
  resources/js/modules/product-dialog.js from the products embedded in the page configuration
  (already formatted by PHP). Static labels live here; [data-slot] elements receive the product data.
  "Chiudi" is FIRST in the DOM so showModal() gives it the initial focus.
  Tests are not sold through the cart: "Richiedi informazioni" leads to the contact form.
--}}
<dialog class="product-dialog" id="product-dialog" aria-modal="true" aria-labelledby="product-dialog-title" data-product-dialog>
    <div class="product-dialog__inner">
        <button class="product-dialog__close" type="button" aria-label="{{ __('ui.dialog.close') }}" data-dialog-close>
            <x-icon name="x" :size="20" />
        </button>

        <div class="product-dialog__media">
            {{-- The image exists only while a product is shown (as in version-a): an <img> without its
                 real alt never sits in the page. The JS clones this template when filling the dialog. --}}
            <template data-dialog-image>
                <img class="product-dialog__img" width="1200" height="800" sizes="(min-width: 672px) 640px, calc(100vw - 2rem)" data-slot="image">
            </template>
            {{-- One badge; the JS sets the modifier and shows the icon of the format. --}}
            <span class="format-badge product-dialog__badge" data-slot="badge">
                @foreach (['cartaceo' => 'book-open', 'digitale' => 'monitor-smartphone', 'online' => 'circle-play', 'presenza' => 'map-pin'] as $modifier => $icon)
                    <x-icon :name="$icon" :size="14" stroke-width="2.25" data-format-icon="{{ $modifier }}" />
                @endforeach
                <span><span class="sr-only">{{ __('ui.product.format') }} </span><span data-slot="format"></span></span>
            </span>
        </div>

        <div class="product-dialog__body">
            <p class="eyebrow eyebrow--muted" data-slot="category"></p>
            <h2 class="product-dialog__title" id="product-dialog-title" data-slot="name"></h2>
            <p class="product-dialog__desc" data-slot="description"></p>

            <dl class="product-dialog__meta">
                <dt>{{ __('ui.product.meta.author') }}</dt>
                <dd data-slot="author"></dd>
                <dt>{{ __('ui.product.meta.age') }}</dt>
                <dd data-slot="age"></dd>
                <dt>{{ __('ui.dialog.administration') }}</dt>
                <dd data-slot="administration"></dd>
                <dt>{{ __('ui.dialog.format') }}</dt>
                <dd data-slot="format"></dd>
            </dl>

            <div class="qualification-note">
                <p class="qualification-note__title" data-slot="qualification-label"></p>
                <p class="qualification-note__text" data-slot="qualification-description"></p>
            </div>

            <div class="product-dialog__footer">
                <div>
                    {{-- Both price variants; the JS shows the one that applies. --}}
                    <p class="price" data-slot="price-single">
                        <span class="price__final"><span class="sr-only">{{ __('ui.product.price') }} </span><span data-slot="price-final"></span></span>
                    </p>
                    <p class="price price--discounted" data-slot="price-discounted">
                        <span class="price__final"><span class="sr-only">{{ __('ui.product.price_discounted') }} </span><span data-slot="price-final"></span></span>
                        <span class="price__original"><span class="sr-only">{{ __('ui.product.price_original') }} </span><s data-slot="price-original"></s></span>
                        <span class="price__saving"><span aria-hidden="true">&minus;<span data-slot="price-percent"></span>%</span><span class="sr-only" data-slot="price-saving"></span></span>
                    </p>
                    <p class="price__vat">{{ __('ui.dialog.vat_note') }}</p>
                </div>
                <a class="btn btn--primary" href="#{{ $sectionIds['contact'] }}" data-dialog-leave>
                    <x-icon name="mail" :size="20" />
                    {{ __('ui.dialog.request') }}
                </a>
            </div>
        </div>
    </div>
</dialog>

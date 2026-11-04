{{--
  Price hierarchy (DESIGN-SPEC §6.2): final price 24/700 → struck original 14px → saving chip.
  Screen readers hear "Prezzo scontato: …, prezzo originale: …, risparmi il 15%".
--}}
@if ($price['percent'] === null)
    <p class="price">
        <span class="price__final"><span class="sr-only">{{ __('ui.product.price') }} </span>{{ $price['final'] }}</span>
    </p>
@else
    <p class="price price--discounted">
        <span class="price__final"><span class="sr-only">{{ __('ui.product.price_discounted') }} </span>{{ $price['final'] }}</span>
        <span class="price__original"><span class="sr-only">{{ __('ui.product.price_original') }} </span><s>{{ $price['original'] }}</s></span>
        <span class="price__saving"><span aria-hidden="true">&minus;{{ $price['percent'] }}%</span><span class="sr-only">{{ __('ui.product.saving', ['percent' => $price['percent']]) }}</span></span>
    </p>
@endif

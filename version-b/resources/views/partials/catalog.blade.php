{{--
  Catalogue (HANDOFF §4.3, DESIGN-SPEC §6.2–6.5). The 12 cards are rendered on the server in the order
  of products.json; resources/js/modules/catalog.js filters them by toggling `hidden` (never reorders).
  Initial state = "Tutti" and no search; the JS applies ?categoria=&q= on load (HANDOFF §6.1).
--}}
<section class="catalog container" id="{{ $sectionIds['catalog'] }}" aria-labelledby="catalogo-title" data-catalog>
    <div class="catalog__head">
        <p class="eyebrow">{{ $catalog['eyebrow'] }}</p>
        <h2 class="catalog__title section-title" id="catalogo-title">{{ $catalog['title'] }}</h2>
        <p class="catalog__intro lead">{{ $catalog['intro'] }}</p>
    </div>

    <div class="catalog__toolbar">
        @include('partials.category-filter')

        <div class="results-status">
            {{-- Visible text updates at once; the live region waits for typing to pause (400 ms). --}}
            <p class="results-status__visible" aria-hidden="true">{{ $resultsLabel }}</p>
            <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ $resultsLabel }}</p>
        </div>
    </div>

    <div class="catalog__results">
        <ul class="product-grid" role="list">
            @foreach ($products as $product)
                <li class="product-grid__item" data-id="{{ $product['id'] }}" data-category="{{ $product['category'] }}">
                    @include('partials.product-card', ['product' => $product])
                </li>
            @endforeach
        </ul>

        @include('partials.empty-state')
    </div>

    @include('partials.product-dialog')
</section>

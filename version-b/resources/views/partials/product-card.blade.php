{{--
  Product card (HANDOFF §4.3, DESIGN-SPEC §6.2). Data prepared by App\Content\ProductPresenter.
  Not clickable as a whole: the only control is the action button, whose accessible name is the
  visible text + ": " + the product name. Variants: test → "Scopri di più" (details dialog),
  corso → "Aggiungi al carrello".
--}}
<article class="product-card" aria-labelledby="{{ $product['titleId'] }}">
    <div class="product-card__media">
        <img
            class="product-card__img"
            src="{{ $product['image']['src'] }}"
            srcset="{{ $product['image']['srcset'] }}"
            sizes="{{ $product['image']['sizes'] }}"
            alt="{{ $product['image']['alt'] }}"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
        >
        <span class="format-badge format-badge--{{ $product['format']['modifier'] }} product-card__badge">
            <x-icon :name="$product['format']['icon']" :size="14" stroke-width="2.25" />
            <span><span class="sr-only">{{ __('ui.product.format') }} </span>{{ $product['format']['label'] }}</span>
        </span>
    </div>

    <div class="product-card__body">
        <p class="eyebrow eyebrow--muted">{{ $product['categoryLabel'] }}</p>
        <h3 class="product-card__title" id="{{ $product['titleId'] }}">{{ $product['name'] }}</h3>
        <p class="product-card__desc">{{ $product['description'] }}</p>

        <dl class="product-card__meta">
            @foreach ($product['meta'] as $row)
                <div>
                    <dt>{{ $row['label'] }}</dt>
                    <dd>
                        @isset($row['datetime'])
                            <time datetime="{{ $row['datetime'] }}">{{ $row['value'] }}</time>
                        @else
                            {{ $row['value'] }}
                        @endisset
                    </dd>
                </div>
            @endforeach
        </dl>

        <div class="product-card__footer">
            <div class="product-card__pricing">
                @include('partials.price', ['price' => $product['price']])
                <p class="price__vat">{{ __('ui.product.vat') }}</p>
            </div>

            <div class="product-card__action">
                @if ($product['type'] === 'test')
                    <button
                        class="btn btn--secondary btn--block"
                        type="button"
                        aria-haspopup="dialog"
                        aria-label="{{ $product['action']['ariaLabel'] }}"
                        data-details="{{ $product['id'] }}"
                    >
                        <x-icon name="info" :size="20" />
                        {{ $product['action']['label'] }}
                    </button>
                @else
                    {{-- "Added" state (2 s): the cart JS sets .is-added and swaps text and aria-label. --}}
                    <button
                        class="btn btn--primary btn--block product-card__add"
                        type="button"
                        aria-label="{{ $product['action']['ariaLabel'] }}"
                        data-add-to-cart="{{ $product['id'] }}"
                    >
                        <x-icon name="shopping-bag" :size="20" class="product-card__add-icon" />
                        <x-icon name="check" :size="20" class="product-card__added-icon" />
                        <span class="product-card__add-text">{{ $product['action']['label'] }}</span>
                    </button>
                @endif
            </div>
        </div>
    </div>
</article>

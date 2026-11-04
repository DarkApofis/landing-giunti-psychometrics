{{--
  Category pills (DESIGN-SPEC §6.3): toggle buttons with aria-pressed inside a labelled group.
  The explicit aria-label "{label} {n} prodotti" contains the visible text "{label} {n}" (label-in-name);
  the count is aria-hidden. < 768px: one row that scrolls horizontally, full bleed, no scroll-snap.
--}}
<div class="category-filter" role="group" aria-label="{{ $catalog['filterLabel'] }}">
    <ul class="category-filter__list">
        @foreach ($pills as $pill)
            <li>
                <button
                    @class(['pill', 'is-active' => $pill['active']])
                    type="button"
                    aria-pressed="{{ $pill['active'] ? 'true' : 'false' }}"
                    aria-label="{{ __('ui.catalog.pill_label', ['label' => $pill['label'], 'count' => $pill['count']]) }}"
                    data-category="{{ $pill['id'] }}"
                ><x-icon name="check" :size="16" stroke-width="2.5" class="pill__check" />{{ $pill['label'] }} <span class="pill__count" aria-hidden="true">{{ $pill['count'] }}</span></button>
            </li>
        @endforeach
    </ul>
</div>

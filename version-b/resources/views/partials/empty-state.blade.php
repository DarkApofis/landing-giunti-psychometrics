{{--
  Empty state (DESIGN-SPEC §6.5): says what was searched ("Nessun risultato per «…» in …. ", written by
  the JS into [data-empty-context]) and offers one way back. "Azzera filtri" resets everything and moves
  focus to the "Tutti" pill.
--}}
<div class="empty-state" hidden>
    <span class="empty-state__icon"><x-icon name="search-x" :size="28" /></span>
    <h3 class="empty-state__title">{{ $catalog['empty']['title'] }}</h3>
    <p class="empty-state__text"><span data-empty-context></span>{{ $catalog['empty']['hint'] }}</p>
    <button class="btn btn--primary empty-state__reset" type="button" data-reset-filters>
        <x-icon name="rotate-ccw" :size="20" />
        {{ $catalog['empty']['reset'] }}
    </button>
</div>

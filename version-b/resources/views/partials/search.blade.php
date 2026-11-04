{{--
  Catalogue search (HANDOFF §4.1, DESIGN-SPEC §6.4). The catalogue JS filters the grid live, shows the
  clear button only while there is text and turns Enter into a scroll to #catalogo (HANDOFF §6.1).
--}}
<search class="site-search">
    <form class="site-search__form">
        <label class="sr-only" for="site-search-input">{{ __('ui.search.label') }}</label>
        <x-icon name="search" :size="20" class="site-search__icon" />
        <input
            id="site-search-input"
            class="site-search__input"
            type="search"
            name="q"
            placeholder="{{ __('ui.search.placeholder') }}"
            autocomplete="off"
            enterkeyhint="search"
            spellcheck="false"
        >
        <button class="site-search__clear" type="button" aria-label="{{ __('ui.search.clear') }}" hidden>
            <x-icon name="x" :size="20" />
        </button>
    </form>
</search>

{{--
  Mobile menu, < 1024px (HANDOFF §4.1 and §6.3, DESIGN-SPEC §6.8). Behaviour: resources/js/modules/mobile-menu.js.
  Both icons are rendered; CSS shows Menu or X from aria-expanded, so the JS never writes SVG.
--}}
<div class="mobile-menu" data-mobile-menu>
    <button
        class="mobile-menu__toggle"
        type="button"
        aria-label="{{ __('ui.menu.open') }}"
        aria-expanded="false"
        aria-controls="mobile-menu-panel"
    >
        <x-icon name="menu" :size="24" class="mobile-menu__icon mobile-menu__icon--open" />
        <x-icon name="x" :size="24" class="mobile-menu__icon mobile-menu__icon--close" />
    </button>

    <div class="mobile-menu__panel" id="mobile-menu-panel" hidden>
        <div class="mobile-menu__backdrop" aria-hidden="true"></div>
        <div class="mobile-menu__sheet">
            <nav class="mobile-menu__nav container" aria-label="{{ __('ui.nav.label') }}">
                <ul class="mobile-menu__list">
                    @foreach ($mainNav as $item)
                        <li>
                            <a class="mobile-menu__link" href="{{ $homeHref($item['href'], $item['category'] ?? null) }}" @isset($item['category']) data-category="{{ $item['category'] }}" @endisset>{{ $item['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
                <div class="mobile-menu__login">
                    <button class="btn btn--secondary btn--block" type="button">
                        <x-icon name="user-round" :size="20" />
                        {{ __('ui.login') }}
                    </button>
                </div>
            </nav>
        </div>
    </div>
</div>

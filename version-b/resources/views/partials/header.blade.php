{{--
  Header (HANDOFF §4.1, DESIGN-SPEC §6.8). Fixed row heights → no layout shift:
    < 768    [logo ······ cart · menu] / [search ·············]   120px
    768–1023 [logo · search ····· Accedi · cart · menu]               64px
    ≥ 1024   [logo · nav ····· search · Accedi · cart]                72px
  Sticky only when the viewport is at least 30rem tall (docs/AUDIT.md H4).
  The header is the containing block of the mobile menu panel (full width).
--}}
<header class="site-header">
    <div class="site-header__bar container">
        <div class="site-header__brand">
            <x-logo :name="$site['name']" />
        </div>

        <nav class="main-nav" aria-label="{{ __('ui.nav.label') }}">
            <ul class="main-nav__list">
                @foreach ($mainNav as $item)
                    <li>
                        <a class="main-nav__link" href="{{ $homeHref($item['href'], $item['category'] ?? null) }}" @isset($item['category']) data-category="{{ $item['category'] }}" @endisset>{{ $item['label'] }}</a>
                    </li>
                @endforeach
            </ul>
        </nav>

        @include('partials.search')

        <div class="site-header__actions">
            {{-- Visibility lives on a wrapper so it never fights the button's own display. --}}
            <div class="site-header__login">
                <button class="btn btn--secondary" type="button">
                    <x-icon name="user-round" :size="20" />
                    {{ __('ui.login') }}
                </button>
            </div>

            @include('partials.cart-button')

            @include('partials.mobile-menu')
        </div>
    </div>
</header>

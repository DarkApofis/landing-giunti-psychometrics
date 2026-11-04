{{--
  Footer (HANDOFF §4.5, DESIGN-SPEC §6.13): ink background, 1 → 2 → 4 columns, three labelled <nav>,
  social links that open a new tab (and say so), dynamic copyright year and the demo disclaimer.
  "Esplora" links pre-filter the catalogue (data-category). `#risorse` is the anchor of the nav item "Risorse".
--}}
<footer class="site-footer on-dark" id="{{ $sectionIds['resources'] }}">
    <div class="site-footer__grid container">
        <div class="site-footer__brand">
            <x-logo :name="$site['name']" tone="on-dark" />
            <p class="site-footer__tagline">{{ $footer['copy']['tagline'] }}</p>
            <ul class="social" aria-label="{{ __('ui.footer.social_label') }}">
                @foreach ($footer['social'] as $social)
                    <li>
                        <a
                            class="social__link"
                            href="{{ $social['href'] }}"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="{{ __('ui.footer.social_link', ['site' => $site['name'], 'network' => $social['label']]) }}"
                        ><x-social-icon :network="$social['network']" class="social__icon" /></a>
                    </li>
                @endforeach
            </ul>
        </div>

        @foreach ($footer['columns'] as $column)
            <nav class="site-footer__col" aria-labelledby="footer-{{ $column['title'] }}">
                <h2 class="site-footer__heading" id="footer-{{ $column['title'] }}">{{ $column['title'] }}</h2>
                <ul class="site-footer__links">
                    @foreach ($column['links'] as $link)
                        <li><a class="site-footer__link" href="{{ $link['href'] }}" @isset($link['category']) data-category="{{ $link['category'] }}" @endisset>{{ $link['label'] }}</a></li>
                    @endforeach
                </ul>
            </nav>
        @endforeach
    </div>

    <div class="site-footer__bottom">
        <div class="site-footer__bottom-inner container">
            <div>
                <p>{{ __('ui.footer.copyright', ['year' => now()->year, 'legal' => $site['legalName']]) }}</p>
                <p class="site-footer__disclaimer">{{ $footer['copy']['disclaimer'] }}</p>
            </div>
            <div class="site-footer__meta">
                <ul class="site-footer__legal" aria-label="{{ __('ui.footer.legal_label') }}">
                    @foreach ($footer['legal'] as $link)
                        <li><a class="site-footer__link" href="{{ $link['href'] }}">{{ $link['label'] }}</a></li>
                    @endforeach
                </ul>
                <a class="site-footer__top" href="#{{ $sectionIds['main'] }}">
                    {{ $footer['copy']['backToTop'] }}
                    <x-icon name="arrow-up" :size="16" />
                </a>
            </div>
        </div>
    </div>
</footer>

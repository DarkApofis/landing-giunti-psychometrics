{{--
  Hero (HANDOFF §4.2, DESIGN-SPEC §6.9). No photo: the LCP element is text. Key figures are computed
  from the dataset (App\Content\CatalogStats). The illustration is decorative and shown from 1024px.
--}}
<section class="hero on-dark" aria-labelledby="hero-title">
    <div class="hero__inner container">
        <div class="hero__content">
            <p class="eyebrow eyebrow--on-dark">{{ $hero['eyebrow'] }}</p>
            <h1 class="hero__title display-title" id="hero-title">{{ $hero['title'] }}</h1>
            <p class="hero__lead lead lead--on-dark">{{ $hero['lead'] }}</p>

            <div class="hero__ctas">
                <a class="btn btn--on-dark btn--lg" href="#{{ $sectionIds['catalog'] }}">
                    {{ $hero['primaryCta'] }}
                    <x-icon name="arrow-down" :size="20" />
                </a>
                <a class="btn btn--on-dark-outline btn--lg" href="#{{ $sectionIds['catalog'] }}" data-category="formazione">
                    {{ $hero['secondaryCta'] }}
                    <x-icon name="arrow-right" :size="20" />
                </a>
            </div>

            <dl class="hero__stats">
                @foreach ($heroStats as $stat)
                    <div class="hero__stat">
                        <dt class="hero__stat-label">{{ $stat['label'] }}</dt>
                        <dd class="hero__stat-value">{{ $stat['value'] }}</dd>
                    </div>
                @endforeach
            </dl>
        </div>

        <x-hero-illustration :geometry="$heroIllustration" />
    </div>
</section>

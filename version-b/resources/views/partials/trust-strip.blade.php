{{--
  Trust strip (HANDOFF §4.5, DESIGN-SPEC §6.10): between the catalogue and Contatti; sr-only h2 for the
  heading hierarchy; 1 / 2 (≥ 640) / 4 (≥ 1024) columns; decorative icons.
--}}
@php
    $trustIcons = ['spedizione' => 'truck', 'pagamenti' => 'shield-check', 'validati' => 'badge-check', 'assistenza' => 'headset'];
@endphp
<section class="trust" aria-labelledby="trust-title">
    <h2 class="sr-only" id="trust-title">{{ __('ui.trust_title') }}</h2>
    <ul class="trust__list container">
        @foreach ($trust as $item)
            <li class="trust__item">
                <span class="icon-circle icon-circle--lg"><x-icon :name="$trustIcons[$item['id']]" :size="24" stroke-width="1.75" /></span>
                <div>
                    <h3 class="trust__title">{{ $item['title'] }}</h3>
                    <p class="trust__text">{{ $item['text'] }}</p>
                </div>
            </li>
        @endforeach
    </ul>
</section>

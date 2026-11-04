{{--
  Contatti (HANDOFF §4.5, DESIGN-SPEC §6.11): intro + fictional channels on the left, the form panel
  on the right from 1024px (2fr / 3fr).
--}}
@php
    $channelIcons = ['email' => 'mail', 'phone' => 'phone', 'hours' => 'clock'];
@endphp
<section class="contact container" id="{{ $sectionIds['contact'] }}" aria-labelledby="contatti-title">
    <div class="contact__grid">
        <div class="contact__intro">
            <p class="eyebrow">{{ $contact['copy']['eyebrow'] }}</p>
            <h2 class="contact__title section-title" id="contatti-title">{{ $contact['copy']['title'] }}</h2>
            <p class="contact__lead lead">{{ $contact['copy']['intro'] }}</p>

            <ul class="contact__channels">
                @foreach ($contact['channels'] as $channel)
                    <li class="contact__channel">
                        <span class="icon-circle"><x-icon :name="$channelIcons[$channel['kind']]" :size="20" /></span>
                        <span>
                            <span class="contact__channel-label">{{ $channel['label'] }}</span>
                            @if ($channel['href'])
                                <a class="contact__link" href="{{ $channel['href'] }}">{{ $channel['value'] }}</a>
                            @else
                                <span class="contact__value">{{ $channel['value'] }}</span>
                            @endif
                        </span>
                    </li>
                @endforeach
            </ul>
        </div>

        <div class="contact__panel">
            @include('partials.contact-form')
        </div>
    </div>
</section>

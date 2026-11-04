{{--
  Local-only styleguide (routes/web.php registers it only when APP_ENV=local).
  Each button in the states matrix carries data-force-state; the verification script forces that
  pseudo-class through the Chrome DevTools Protocol, so every state is visible in one capture.
--}}
@extends('layouts.app')

@section('title', __('styleguide.title'))

@push('head')
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="@asset('css/styleguide.css')">
@endpush

@php
    $buttonLabel = static fn (string $variant): string => match (true) {
        str_contains($variant, 'danger-text') => $cart['clear'],
        $variant === 'ghost' => $catalog['empty']['reset'],
        $variant === 'secondary', $variant === 'on-dark-outline' => $hero['secondaryCta'],
        default => $hero['primaryCta'],
    };
@endphp

@section('content')
    <div class="styleguide container">
        <p class="eyebrow">/_styleguide</p>
        <h1 class="section-title" data-specimen="page-title">{{ __('styleguide.title') }}</h1>
        <p class="styleguide__note">{{ __('styleguide.intro') }}</p>

        {{-- ── Typography ─────────────────────────────────────────────── --}}
        <section class="styleguide__section" aria-labelledby="sg-typography">
            <h2 class="styleguide__heading" id="sg-typography">{{ __('styleguide.typography') }}</h2>

            <div class="styleguide__stack">
                <div class="styleguide__specimen">
                    <span class="styleguide__label">.display-title — {{ __('styleguide.specimens.display') }}</span>
                    <p class="display-title" data-specimen="display">{{ $hero['title'] }}</p>
                </div>
                <div class="styleguide__specimen">
                    <span class="styleguide__label">.section-title — {{ __('styleguide.specimens.h2') }}</span>
                    <h3 class="section-title" data-specimen="h2">{{ $catalog['title'] }}</h3>
                </div>
                <div class="styleguide__specimen">
                    <span class="styleguide__label">.eyebrow — {{ __('styleguide.specimens.eyebrow') }}</span>
                    <p class="eyebrow" data-specimen="eyebrow">{{ $catalog['eyebrow'] }}</p>
                </div>
                <div class="styleguide__specimen">
                    <span class="styleguide__label">.eyebrow.eyebrow--muted — {{ __('styleguide.specimens.eyebrow_muted') }}</span>
                    <p class="eyebrow eyebrow--muted" data-specimen="eyebrow-muted">{{ $catalog['eyebrow'] }}</p>
                </div>
                <div class="styleguide__specimen">
                    <span class="styleguide__label">.lead — {{ __('styleguide.specimens.lead') }}</span>
                    <p class="lead" data-specimen="lead">{{ $catalog['intro'] }}</p>
                </div>
                <div class="styleguide__specimen">
                    <span class="styleguide__label">body — {{ __('styleguide.specimens.body') }}</span>
                    <p data-specimen="body">{{ $hero['lead'] }}</p>
                </div>
            </div>

            <div class="styleguide__dark on-dark styleguide__stack">
                <span class="styleguide__label">{{ __('styleguide.on_dark') }}</span>
                <p class="eyebrow eyebrow--on-dark" data-specimen="eyebrow-on-dark">{{ $hero['eyebrow'] }}</p>
                <p class="display-title">{{ $hero['title'] }}</p>
                <p class="lead lead--on-dark" data-specimen="lead-on-dark">{{ $hero['lead'] }}</p>
            </div>
        </section>

        {{-- ── Colours ────────────────────────────────────────────────── --}}
        <section class="styleguide__section" aria-labelledby="sg-colors">
            <h2 class="styleguide__heading" id="sg-colors">{{ __('styleguide.colors') }}</h2>

            @foreach ($swatches as $group => $tokens)
                <h3 class="styleguide__label">{{ __('styleguide.groups.'.$group) }}</h3>
                <ul class="styleguide__swatches" role="list" style="margin-block: 0.5rem 1.5rem">
                    @foreach ($tokens as $token)
                        <li class="styleguide__swatch" data-swatch="{{ $token }}">
                            <div class="styleguide__chip" style="background-color: var(--color-{{ $token }})"></div>
                            <p class="styleguide__swatch-name styleguide__label">--color-{{ $token }}</p>
                        </li>
                    @endforeach
                </ul>
            @endforeach
        </section>

        {{-- ── Buttons ────────────────────────────────────────────────── --}}
        <section class="styleguide__section" aria-labelledby="sg-buttons">
            <h2 class="styleguide__heading" id="sg-buttons">{{ __('styleguide.buttons') }}</h2>
            <p class="styleguide__note">{{ __('styleguide.states_note') }}</p>

            @foreach ([['variants' => $lightVariants, 'dark' => false], ['variants' => $darkVariants, 'dark' => true]] as $panel)
                <div @class(['styleguide__states', 'styleguide__dark on-dark' => $panel['dark']]) style="margin-top: 1.5rem" data-states-panel="{{ $panel['dark'] ? 'dark' : 'light' }}">
                    <span class="styleguide__state-head">{{ __('styleguide.states.variant') }}</span>
                    @foreach ($states as $state)
                        <span class="styleguide__state-head">{{ __('styleguide.states.'.$state) }}</span>
                    @endforeach

                    @foreach ($panel['variants'] as $variant)
                        <span class="styleguide__label">.btn--{{ $variant }}</span>
                        @foreach ($states as $state)
                            <div>
                                <button
                                    type="button"
                                    class="btn btn--{{ $variant }}"
                                    data-variant="{{ $variant }}"
                                    @if ($state === 'disabled') disabled @endif
                                    @unless (in_array($state, ['rest', 'disabled'], true)) data-force-state="{{ $state === 'focus' ? 'focus-visible' : $state }}" @endunless
                                >{{ $buttonLabel($variant) }}</button>
                            </div>
                        @endforeach
                    @endforeach
                </div>
            @endforeach

            <h3 class="styleguide__heading" style="margin-top: 2rem">{{ __('styleguide.sizes') }}</h3>
            <div class="styleguide__row">
                <button type="button" class="btn btn--primary" data-specimen="btn-md">{{ $hero['primaryCta'] }}</button>
                <button type="button" class="btn btn--primary btn--lg" data-specimen="btn-lg">{{ $hero['primaryCta'] }}</button>
                <button type="button" class="btn btn--secondary btn--lg">{{ $hero['secondaryCta'] }}</button>
            </div>
            <div class="styleguide__block-demo" style="margin-top: 1rem">
                <button type="button" class="btn btn--primary btn--block" data-specimen="btn-block">{{ $hero['primaryCta'] }}</button>
            </div>
            <div class="styleguide__dark on-dark styleguide__row">
                <a class="btn btn--on-dark btn--lg" href="#sg-buttons" data-specimen="btn-on-dark-lg">{{ $hero['primaryCta'] }}</a>
                <a class="btn btn--on-dark-outline btn--lg" href="#sg-buttons">{{ $hero['secondaryCta'] }}</a>
            </div>
        </section>
    </div>
@endsection

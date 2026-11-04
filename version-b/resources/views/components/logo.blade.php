{{--
  Monogram + wordmark (version-a/src/components/ui/Logo.tsx). The accessible name comes from the
  visible text ("Giunti Psychometrics"). Tone "on-dark" (footer): white tile, primary glyph.
--}}
@props(['tone' => 'default', 'name'])
@php
    [$first, $rest] = array_pad(explode(' ', $name, 2), 2, '');
    $onDark = $tone === 'on-dark';
@endphp
<a {{ $attributes->class(['logo', 'logo--on-dark' => $onDark]) }} href="{{ route('home') }}">
    <svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="7" fill="{{ $onDark ? 'var(--color-white)' : 'var(--color-primary)' }}"></rect>
        <path d="M21.5 11.2A7 7 0 1 0 23 16h-6.5" fill="none" stroke="{{ $onDark ? 'var(--color-primary)' : 'var(--color-white)' }}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
        <circle cx="24.5" cy="8.5" r="2.5" fill="var(--color-accent)"></circle>
    </svg>
    <span>{{ $first }} <span class="logo__accent">{{ $rest }}</span></span>
</a>

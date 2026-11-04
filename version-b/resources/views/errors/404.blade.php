{{--
  404 (DESIGN-SPEC §6.14; mirrors version-a/src/app/not-found.tsx). The footer links to institutional
  pages that are not part of the demo (Chi siamo, Privacy…): instead of a bare 404, explain it and
  offer a way back. Not indexed.
--}}
@extends('layouts.app')

@section('title', __('ui.not_found.title').' | '.$site['name'])
@section('robots', 'noindex')

@section('content')
    <section class="not-found container">
        <p class="eyebrow">{{ __('ui.not_found.eyebrow') }}</p>
        <h1 class="not-found__title section-title">{{ __('ui.not_found.heading') }}</h1>
        <p class="not-found__text lead">{{ __('ui.not_found.text') }}</p>
        <a class="btn btn--primary not-found__home" href="{{ route('home') }}">{{ __('ui.not_found.home') }}</a>
    </section>
@endsection

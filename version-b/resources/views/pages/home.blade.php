{{--
  Home page. Scaffold stage: only the hero heading, to exercise the whole pipeline (layout, data,
  hashed CSS/JS, fonts). The sections of HANDOFF §3 replace it in phase 4 of docs/PLAN-B.md.
--}}
@extends('layouts.app')

@section('content')
    <section aria-labelledby="hero-title">
        <h1 id="hero-title">{{ $hero['title'] }}</h1>
        <p>{{ $hero['lead'] }}</p>
    </section>
@endsection

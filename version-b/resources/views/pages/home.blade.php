{{--
  Home page. Sections inside <main>, in the mandatory order of HANDOFF §3:
  hero → catalogue → trust strip → contact. Header, footer and cart drawer live in the layout.
--}}
@extends('layouts.app')

@section('content')
    @include('partials.hero')
    @include('partials.catalog')
    @include('partials.trust-strip')
    @include('partials.contact')
@endsection

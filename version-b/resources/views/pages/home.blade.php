{{--
  Home page. Sections inside <main>, in the order of HANDOFF §3:
  hero → catalogue → trust strip → contact. The last two arrive in the next blocks of docs/PLAN-B.md.
--}}
@extends('layouts.app')

@section('content')
    @include('partials.hero')
    @include('partials.catalog')
@endsection

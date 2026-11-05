{{--
  Base layout: <head> (SEO / Open Graph from content.json → site, the same tags version-a's
  metadata API emits), preloaded latin fonts, one stylesheet, one deferred script, and the JSON
  configuration the JS reads. Header and footer stay outside <main> (HANDOFF §3).
--}}
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php
        // Pages other than the home pass $meta (title, description, url); the home uses the site's.
        $metaTitle = $meta['title'] ?? $site['title'];
        $metaDescription = $meta['description'] ?? $site['description'];
        $metaUrl = $meta['url'] ?? url('/');
    @endphp
    <title>@yield('title', $metaTitle)</title>
    <meta name="description" content="{{ $metaDescription }}">
    <meta name="application-name" content="{{ $site['name'] }}">
    <meta name="keywords" content="{{ implode(',', __('ui.meta.keywords')) }}">
    <meta name="robots" content="@yield('robots', 'index, follow')">
    <link rel="canonical" href="{{ $metaUrl }}">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="{{ $site['locale'] }}">
    <meta property="og:url" content="{{ $metaUrl }}">
    <meta property="og:site_name" content="{{ $site['name'] }}">
    <meta property="og:title" content="{{ $metaTitle }}">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $metaTitle }}">
    <meta name="twitter:description" content="{{ $metaDescription }}">

    <meta name="theme-color" content="{{ $site['themeColor'] }}">
    <meta name="color-scheme" content="light">
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">

    <link rel="preload" href="@asset('fonts/figtree-latin-wght-normal.woff2')" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="@asset('fonts/noto-sans-latin-wght-normal.woff2')" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="@asset('css/app.css')">
    <script src="@asset('js/app.js')" defer></script>
    @stack('head')
</head>
<body>
    @include('partials.skip-link')

    @include('partials.header')

    {{-- Home order inside <main> (HANDOFF §3): hero → catalogue → trust strip → contact. --}}
    <main id="{{ $sectionIds['main'] }}" tabindex="-1">
        @yield('content')
    </main>

    @include('partials.footer')

    @include('partials.cart-drawer')

    {{-- One polite live region for transient events ("… aggiunto al carrello"): resources/js/modules/announcer.js. --}}
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-announcer></div>

    <script type="application/json" id="app-config">@json($appConfig)</script>
</body>
</html>

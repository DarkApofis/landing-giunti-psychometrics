{{--
  Institutional page of the footer ("Azienda" / "Assistenza" / legal links) (content.json → pages; mirrors
  version-a/src/components/sections/InfoPageView.tsx). Breadcrumb, title and lead with the demo notice,
  the content blocks (text, facts, cards, faq), a contact call to action and the navigation of the
  other pages of the same footer column. FAQ answers use native <details>: no JS.
--}}
@extends('layouts.app')

@section('content')
    @php
        $current = '/'.$page['slug'];
    @endphp
    <div class="info-page container">
        <nav aria-label="{{ $pageCopy['breadcrumbLabel'] }}">
            <ol class="breadcrumb">
                <li class="breadcrumb__item">
                    <a class="breadcrumb__link" href="{{ route('home') }}">{{ $pageCopy['home'] }}</a>
                    <x-icon name="chevron-right" :size="16" />
                </li>
                <li class="breadcrumb__item">
                    {{ $page['section'] }}
                    <x-icon name="chevron-right" :size="16" />
                </li>
                <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">{{ $page['title'] }}</li>
            </ol>
        </nav>

        <header class="info-page__header">
            <p class="eyebrow">{{ $page['section'] }}</p>
            <h1 class="info-page__title section-title">{{ $page['title'] }}</h1>
            <p class="info-page__lead lead">{{ $page['lead'] }}</p>
            <p class="info-page__notice">
                <x-icon name="info" :size="16" class="info-page__notice-icon" />
                {{ $page['notice'] ?? $pageCopy['demoNotice'] }}
            </p>
        </header>

        <div class="info-page__layout">
            <div class="info-page__blocks">
                @foreach ($page['blocks'] as $block)
                    @php($id = $page['slug'].'-'.$loop->index)
                    <section aria-labelledby="{{ $id }}">
                        <h2 class="info-page__heading" id="{{ $id }}">{{ $block['heading'] }}</h2>

                        @isset($block['intro'])
                            <p class="info-page__intro">{{ $block['intro'] }}</p>
                        @endisset

                        @switch($block['kind'])
                            @case('text')
                                <div class="info-page__text">
                                    @foreach ($block['paragraphs'] as $paragraph)
                                        <p>{{ $paragraph }}</p>
                                    @endforeach
                                </div>
                                @break

                            @case('facts')
                                <dl class="info-grid">
                                    @foreach ($block['items'] as $item)
                                        <div class="info-card">
                                            <dt class="info-card__label">{{ $item['label'] }}</dt>
                                            <dd class="info-card__value">{{ $item['value'] }}</dd>
                                        </div>
                                    @endforeach
                                </dl>
                                @break

                            @case('cards')
                                <ul class="info-grid">
                                    @foreach ($block['items'] as $item)
                                        <li class="info-card">
                                            <h3 class="info-card__title">{{ $item['title'] }}</h3>
                                            @isset($item['meta'])
                                                <p class="info-card__meta">{{ $item['meta'] }}</p>
                                            @endisset
                                            <p class="info-card__text">{{ $item['text'] }}</p>
                                        </li>
                                    @endforeach
                                </ul>
                                @break

                            @case('faq')
                                <div class="faq">
                                    @foreach ($block['items'] as $item)
                                        <details class="faq__item">
                                            <summary class="faq__question">
                                                {{ $item['question'] }}
                                                <x-icon name="chevron-down" :size="20" class="faq__chevron" />
                                            </summary>
                                            <p class="faq__answer">{{ $item['answer'] }}</p>
                                        </details>
                                    @endforeach
                                </div>
                                @break
                        @endswitch
                    </section>
                @endforeach

                <section class="info-page__cta" aria-labelledby="{{ $page['slug'] }}-cta">
                    <h2 class="info-page__cta-title" id="{{ $page['slug'] }}-cta">{{ $pageCopy['cta']['title'] }}</h2>
                    <p class="info-page__cta-text">{{ $pageCopy['cta']['text'] }}</p>
                    <a class="btn btn--primary info-page__cta-action" href="{{ $homeHref('#'.$sectionIds['contact']) }}">{{ $pageCopy['cta']['action'] }}</a>
                </section>
            </div>

            <nav class="section-nav" aria-labelledby="{{ $page['slug'] }}-section-nav">
                <h2 class="eyebrow" id="{{ $page['slug'] }}-section-nav">{{ $pageCopy['sectionNavLabel'] }}: {{ $page['section'] }}</h2>
                <ul class="section-nav__list">
                    @foreach ($siblings as $link)
                        @php($active = $link['href'] === $current)
                        <li>
                            <a
                                @class(['section-nav__link', 'is-active' => $active])
                                href="{{ $homeHref($link['href']) }}"
                                @if ($active) aria-current="page" @endif
                            >{{ $link['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
            </nav>
        </div>
    </div>
@endsection

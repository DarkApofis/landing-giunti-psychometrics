{{--
  Placeholder social glyphs in lucide style (lucide 1.x ships no brand icons), copied from
  version-a/src/components/ui/SocialIcon.tsx. Always decorative.
--}}
@props(['network'])
<svg {{ $attributes->class(['social-icon']) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    @switch($network)
        @case('linkedin')
            <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"></path>
            @break
        @case('instagram')
            <rect x="3" y="3" width="18" height="18" rx="5"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M17.5 6.5v.01"></path>
            @break
        @case('youtube')
            <rect x="2.5" y="5" width="19" height="14" rx="4"></rect>
            <path d="m10 9 5 3-5 3z"></path>
            @break
        @case('facebook')
            <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7.5a.5.5 0 0 1 .5-.5H17V3z"></path>
            @break
    @endswitch
</svg>

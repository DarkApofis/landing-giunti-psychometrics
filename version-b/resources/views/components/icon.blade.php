{{-- Decorative lucide icon: <x-icon name="search" :size="20" class="site-search__icon" /> (App\Support\Icons). --}}
@props(['name', 'size' => 24, 'strokeWidth' => null])
{{ app(\App\Support\Icons::class)->svg($name, (int) $size, $attributes->get('class'), $strokeWidth === null ? null : (float) $strokeWidth) }}

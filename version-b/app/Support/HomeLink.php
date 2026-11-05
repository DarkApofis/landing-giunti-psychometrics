<?php

namespace App\Support;

/**
 * Links to the home sections (#catalogo, #contatti) from other pages (/chi-siamo, /faq…), where
 * those sections do not exist. Mirrors hrefFromOtherPage() in version-a/src/lib/catalog.ts: the
 * link goes to the home and carries the category in the URL, which the catalogue reads on load.
 */
final class HomeLink
{
    /**
     * @param  list<string>  $layoutAnchors  anchors of sections every page has (#main, #risorse)
     */
    public static function href(string $href, ?string $category, bool $onHome, array $layoutAnchors): string
    {
        if ($onHome || ! str_starts_with($href, '#') || in_array($href, $layoutAnchors, true)) {
            return $href;
        }

        $query = $category !== null && $category !== 'tutti' ? '?'.http_build_query(['categoria' => $category]) : '';

        return '/'.$query.$href;
    }
}

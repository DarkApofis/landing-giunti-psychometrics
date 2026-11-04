<?php

namespace App\Support;

/**
 * Responsive URLs for the Unsplash images of the dataset (docs/ASSUMPTIONS.md B14). Version B has no
 * image optimiser like next/image: the Unsplash CDN (imgix) resizes, and `auto=format` serves AVIF/WebP
 * to browsers that accept them. The 3:2 crop of the dataset URL (w=1200&h=800) is kept at every width.
 */
final class UnsplashImage
{
    /** Candidate widths of the card srcset (HANDOFF §4.3). */
    public const WIDTHS = [384, 750, 1200];

    /** JPEG/AVIF quality: next/image's default (75), the one version-a serves (was the dataset's 80). */
    public const QUALITY = 75;

    /** Rendered card width per breakpoint (DESIGN-SPEC §6.2), the same `sizes` as version-a. */
    public const CARD_SIZES = '(min-width: 1280px) 360px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 2rem)';

    /** URL at a given width, keeping the aspect ratio of the source crop. */
    public static function url(string $src, int $width, ?int $height = null): string
    {
        $parts = parse_url($src);
        parse_str($parts['query'] ?? '', $query);

        $ratio = isset($query['w'], $query['h']) && (int) $query['w'] > 0 ? (int) $query['h'] / (int) $query['w'] : 2 / 3;
        unset($query['fm']);
        $query['w'] = $width;
        $query['h'] = $height ?? (int) round($width * $ratio);
        $query['q'] = self::QUALITY;
        $query['auto'] = 'format';

        return "{$parts['scheme']}://{$parts['host']}{$parts['path']}?".http_build_query($query);
    }

    /** "…?w=384… 384w, …?w=750… 750w, …?w=1200… 1200w" */
    public static function srcset(string $src): string
    {
        return implode(', ', array_map(
            static fn (int $width): string => self::url($src, $width)." {$width}w",
            self::WIDTHS,
        ));
    }
}

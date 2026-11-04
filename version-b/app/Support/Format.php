<?php

namespace App\Support;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Server-side output formats (docs/HANDOFF-LARAVEL.md §5). They print exactly the strings version-a
 * prints with Intl in src/lib/format.ts and src/lib/cart.ts; tests/Unit/FormatTest.php uses its cases.
 *
 * NumberFormatter is deliberately not used: CLDR gives Italian minimumGroupingDigits = 2, so ICU prints
 * "1250,00 €" instead of "1.250,00 €" (the same bug version-a caught), and the intl extension is optional.
 */
final class Format
{
    private const NBSP = "\u{00A0}";

    private const EN_DASH = "\u{2013}";

    private const MINUS = "\u{2212}";

    private const MONTHS_LONG = [
        1 => 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
    ];

    private const MONTHS_SHORT = [
        1 => 'gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic',
    ];

    /** 1250 → "1.250,00 €" (no-break space before the euro sign, so it never wraps alone). */
    public static function price(int|float $euros): string
    {
        return number_format($euros, 2, ',', '.').self::NBSP.'€';
    }

    /** "2027-01-19" → "19 gennaio 2027". */
    public static function dateLong(string $iso): string
    {
        [$year, $month, $day] = self::parseIsoDate($iso);

        return "{$day} ".self::MONTHS_LONG[$month]." {$year}";
    }

    /** "2027-01-19" → "19 gen 2027" (cart lines). */
    public static function dateShort(string $iso): string
    {
        [$year, $month, $day] = self::parseIsoDate($iso);

        return "{$day} ".self::MONTHS_SHORT[$month]." {$year}";
    }

    /**
     * { 6, 14, anni } → "6–14 anni" (en dash); { 18, null, anni } → "18+ anni".
     *
     * @param  array{min: int, max: int|null, unit: string}  $range
     */
    public static function ageRange(array $range): string
    {
        return $range['max'] === null
            ? "{$range['min']}+ {$range['unit']}"
            : $range['min'].self::EN_DASH."{$range['max']} {$range['unit']}";
    }

    /** Rounded percentage saved, or null when there is no actual discount. */
    public static function discountPercent(int|float $originalPrice, int|float|null $discountPrice): ?int
    {
        if ($discountPrice === null || $discountPrice >= $originalPrice || $originalPrice <= 0) {
            return null;
        }

        return (int) round((1 - $discountPrice / $originalPrice) * 100);
    }

    /** "−15%" with the minus sign U+2212, or null (no chip) when there is no discount. */
    public static function discountLabel(int|float $originalPrice, int|float|null $discountPrice): ?string
    {
        $percent = self::discountPercent($originalPrice, $discountPrice);

        return $percent === null ? null : self::MINUS."{$percent}%";
    }

    /**
     * Euros → integer cents. The inner round(…, 6) absorbs binary noise first
     * (1.005 × 100 = 100.49999…), mirroring toCents() in version-a.
     */
    public static function toCents(int|float $euros): int
    {
        return (int) round(round($euros * 100, 6));
    }

    /**
     * Parses a calendar date (YYYY-MM-DD) without any timezone, and rejects values a date
     * library would silently roll over (2027-13-45, 2027-02-30).
     *
     * @return array{int, int, int} year, month, day
     */
    private static function parseIsoDate(string $iso): array
    {
        $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $iso) === 1
            ? DateTimeImmutable::createFromFormat('!Y-m-d', $iso)
            : false;

        if ($date === false || $date->format('Y-m-d') !== $iso) {
            throw new InvalidArgumentException("Invalid ISO date: \"{$iso}\"");
        }

        return [(int) $date->format('Y'), (int) $date->format('n'), (int) $date->format('j')];
    }
}

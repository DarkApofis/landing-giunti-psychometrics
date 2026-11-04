<?php

namespace App\Support;

/**
 * Geometry of the decorative hero "score report" (a normal distribution with a highlighted
 * percentile), ported from version-a/src/components/sections/HeroIllustration.tsx with the same
 * constants and rounding, so the SVG is identical (tests/Unit/HeroIllustrationTest.php).
 */
final class HeroIllustration
{
    private const BARS = 13;

    private const BAR_STEP = 26;

    private const BAR_WIDTH = 16;

    private const BASELINE = 300;

    private const MAX_HEIGHT = 150;

    private const ORIGIN_X = 70;

    private const HIGHLIGHT = 9;

    private const SIGMA = 2.6;

    private const CURVE_POINTS = 60;

    /**
     * @return array{
     *     bars: list<array{x: int, y: int, height: int, highlight: bool}>,
     *     barWidth: int,
     *     curve: string,
     *     highlightX: int|float,
     *     baseline: int
     * }
     */
    public static function geometry(): array
    {
        $bars = [];
        for ($i = 0; $i < self::BARS; $i++) {
            $height = self::jsRound(16 + self::gaussian($i) * self::MAX_HEIGHT);
            $bars[] = [
                'x' => self::ORIGIN_X + $i * self::BAR_STEP,
                'y' => self::BASELINE - $height,
                'height' => $height,
                'highlight' => $i === self::HIGHLIGHT,
            ];
        }

        $points = [];
        for ($k = 0; $k <= self::CURVE_POINTS; $k++) {
            $i = ($k / self::CURVE_POINTS) * (self::BARS - 1);
            $x = self::ORIGIN_X + self::BAR_WIDTH / 2 + $i * self::BAR_STEP;
            $y = self::BASELINE - 24 - self::gaussian($i) * self::MAX_HEIGHT;
            $points[] = ($k === 0 ? 'M' : 'L').self::toFixed1($x).' '.self::toFixed1($y);
        }

        return [
            'bars' => $bars,
            'barWidth' => self::BAR_WIDTH,
            'curve' => implode(' ', $points),
            'highlightX' => self::ORIGIN_X + self::HIGHLIGHT * self::BAR_STEP + self::BAR_WIDTH / 2,
            'baseline' => self::BASELINE,
        ];
    }

    private static function gaussian(float $i): float
    {
        return exp(-(($i - (self::BARS - 1) / 2) ** 2) / (2 * self::SIGMA ** 2));
    }

    /** JavaScript's Math.round: halves round towards +∞ (PHP's round() rounds them away from zero). */
    private static function jsRound(float $value): int
    {
        return (int) floor($value + 0.5);
    }

    /** JavaScript's Number.prototype.toFixed(1). */
    private static function toFixed1(float $value): string
    {
        return number_format($value, 1, '.', '');
    }
}

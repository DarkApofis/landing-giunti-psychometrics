<?php

namespace Tests\Unit;

use App\Support\Format;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Output formats of docs/HANDOFF-LARAVEL.md §5. The cases are the ones version-a tests in
 * src/lib/format.test.ts and src/lib/cart.test.ts, so both versions print exactly the same strings.
 */
class FormatTest extends TestCase
{
    private const NBSP = "\u{00A0}";

    /** Compares with a plain space too, as version-a's tests do. */
    private static function visible(string $value): string
    {
        return str_replace(self::NBSP, ' ', $value);
    }

    // ── Price ───────────────────────────────────────────────────────────────

    #[Test]
    public function price_formats_1250_with_italian_grouping_comma_decimals_and_trailing_euro(): void
    {
        $this->assertSame('1.250,00 €', self::visible(Format::price(1250)));
    }

    #[Test]
    public function price_separates_the_euro_sign_with_a_no_break_space(): void
    {
        $this->assertSame('1.250,00'.self::NBSP.'€', Format::price(1250));
        $this->assertStringNotContainsString(' ', Format::price(1250), 'no ordinary space');
    }

    #[Test]
    public function price_groups_four_digit_amounts_unlike_icu_for_italian(): void
    {
        // ICU (NumberFormatter it_IT) prints "1250,00 €" because CLDR sets minimumGroupingDigits = 2.
        $this->assertSame('2.450,00 €', self::visible(Format::price(2450)));
    }

    #[Test]
    #[DataProvider('prices')]
    public function price_formats_amounts(int|float $euros, string $expected): void
    {
        $this->assertSame($expected, self::visible(Format::price($euros)));
    }

    /** @return array<string, array{int|float, string}> */
    public static function prices(): array
    {
        return [
            'zero' => [0, '0,00 €'],
            'one decimal' => [99.9, '99,90 €'],
            'integer' => [119, '119,00 €'],
            'discounted' => [1062.5, '1.062,50 €'],
            'four digits' => [2450, '2.450,00 €'],
            'millions, rounded' => [1234567.891, '1.234.567,89 €'],
        ];
    }

    // ── Dates ───────────────────────────────────────────────────────────────

    #[Test]
    public function date_long_uses_the_italian_month_name(): void
    {
        $this->assertSame('19 gennaio 2027', Format::dateLong('2027-01-19'));
    }

    #[Test]
    public function date_short_uses_the_abbreviated_month(): void
    {
        $this->assertSame('19 gen 2027', Format::dateShort('2027-01-19'));
    }

    #[Test]
    public function dates_do_not_shift_with_the_timezone_and_drop_the_leading_zero(): void
    {
        $this->assertSame('1 marzo 2027', Format::dateLong('2027-03-01'));
    }

    #[Test]
    #[DataProvider('months')]
    public function every_month_has_its_long_and_short_italian_name(int $month, string $long, string $short): void
    {
        $iso = sprintf('2027-%02d-10', $month);
        $this->assertSame("10 {$long} 2027", Format::dateLong($iso));
        $this->assertSame("10 {$short} 2027", Format::dateShort($iso));
    }

    /** @return array<string, array{int, string, string}> */
    public static function months(): array
    {
        $long = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
        $short = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
        $cases = [];
        foreach ($long as $i => $name) {
            $cases[$name] = [$i + 1, $name, $short[$i]];
        }

        return $cases;
    }

    #[Test]
    #[DataProvider('invalidDates')]
    public function dates_reject_invalid_iso_values(string $iso): void
    {
        $this->expectException(InvalidArgumentException::class);
        Format::dateLong($iso);
    }

    /** @return array<string, array{string}> */
    public static function invalidDates(): array
    {
        return [
            'overflowing month and day' => ['2027-13-45'],
            'not a date' => ['not-a-date'],
            'non-existent day' => ['2027-02-30'],
            'with time' => ['2027-01-19T10:00:00'],
        ];
    }

    // ── Age range ───────────────────────────────────────────────────────────

    #[Test]
    public function age_range_uses_an_en_dash(): void
    {
        $this->assertSame("6\u{2013}14 anni", Format::ageRange(['min' => 6, 'max' => 14, 'unit' => 'anni']));
    }

    #[Test]
    public function age_range_is_open_ended_when_max_is_null(): void
    {
        $this->assertSame('18+ anni', Format::ageRange(['min' => 18, 'max' => null, 'unit' => 'anni']));
    }

    #[Test]
    public function age_range_supports_months(): void
    {
        $this->assertSame("0\u{2013}42 mesi", Format::ageRange(['min' => 0, 'max' => 42, 'unit' => 'mesi']));
    }

    // ── Discount ────────────────────────────────────────────────────────────

    #[Test]
    public function discount_percent_is_the_rounded_percentage_saved(): void
    {
        $this->assertSame(15, Format::discountPercent(1250, 1062.5));
        $this->assertSame(20, Format::discountPercent(690, 552));
        $this->assertSame(18, Format::discountPercent(145, 119));
    }

    #[Test]
    public function discount_percent_is_null_without_a_real_discount(): void
    {
        $this->assertNull(Format::discountPercent(180, null));
        $this->assertNull(Format::discountPercent(180, 180));
        $this->assertNull(Format::discountPercent(180, 200));
        $this->assertNull(Format::discountPercent(0, 0));
    }

    #[Test]
    public function discount_label_uses_the_minus_sign_and_no_space(): void
    {
        $this->assertSame("\u{2212}15%", Format::discountLabel(1250, 1062.5));
    }

    #[Test]
    public function discount_label_is_null_so_no_chip_is_rendered(): void
    {
        $this->assertNull(Format::discountLabel(180, null));
    }

    // ── Cents ───────────────────────────────────────────────────────────────

    #[Test]
    #[DataProvider('cents')]
    public function to_cents_returns_exact_integer_cents(float|int $euros, int $expected): void
    {
        $this->assertSame($expected, Format::toCents($euros));
    }

    /** @return array<string, array{float|int, int}> */
    public static function cents(): array
    {
        return [
            'zero' => [0, 0],
            'two decimals' => [19.99, 1999],
            'one decimal' => [382.5, 38250],
            'binary noise 0.1 + 0.2' => [0.1 + 0.2, 30],
            'classic trap 1.005' => [1.005, 101],
        ];
    }
}

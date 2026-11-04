<?php

namespace Tests\Feature;

use App\Support\HeroIllustration;
use Illuminate\Support\Facades\Blade;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The hero illustration must be the same SVG version-a renders. The fixture is the <svg> copied
 * from version-a's production HTML; only the class attribute (Tailwind vs BEM) may differ.
 */
class HeroIllustrationTest extends TestCase
{
    private static function normalise(string $svg): string
    {
        $svg = (string) preg_replace('/\sclass="[^"]*"/', '', trim($svg));

        // React renders camelCase SVG attributes as their hyphenated names, already in the fixture.
        return (string) preg_replace('/>\s+</', '><', $svg);
    }

    #[Test]
    public function the_rendered_svg_is_identical_to_version_a(): void
    {
        $rendered = Blade::render('<x-hero-illustration :geometry="$geometry" />', [
            'geometry' => HeroIllustration::geometry(),
        ]);
        $expected = (string) file_get_contents(base_path('tests/Fixtures/hero-illustration.version-a.svg'));

        $this->assertSame(self::normalise($expected), self::normalise($rendered));
    }

    #[Test]
    public function the_geometry_has_13_bars_and_the_9th_is_highlighted(): void
    {
        $geometry = HeroIllustration::geometry();

        $this->assertCount(13, $geometry['bars']);
        $this->assertSame([9], array_keys(array_filter(array_column($geometry['bars'], 'highlight'))));
        $this->assertSame(312, $geometry['highlightX']);
    }
}

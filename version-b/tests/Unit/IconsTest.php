<?php

namespace Tests\Unit;

use App\Support\Icons;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class IconsTest extends TestCase
{
    private static function icons(): Icons
    {
        return new Icons(dirname(__DIR__, 2).'/resources/svg/lucide');
    }

    #[Test]
    public function it_inlines_a_decorative_lucide_icon_with_the_requested_size(): void
    {
        $svg = (string) self::icons()->svg('search', 20, 'site-search__icon');

        $this->assertStringStartsWith('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"', $svg);
        $this->assertStringContainsString('class="icon icon--search site-search__icon"', $svg);
        $this->assertStringContainsString('aria-hidden="true"', $svg);
        // Same paths as lucide-react 1.67.0 renders in version-a.
        $this->assertStringContainsString('<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>', $svg);
        $this->assertStringNotContainsString('@license', $svg);
    }

    #[Test]
    public function the_stroke_width_can_be_overridden(): void
    {
        $this->assertStringContainsString('stroke-width="1.75"', (string) self::icons()->svg('truck', 24, null, 1.75));
    }

    #[Test]
    public function every_icon_of_the_design_spec_is_available(): void
    {
        $names = ['search', 'x', 'menu', 'user-round', 'shopping-bag', 'arrow-down', 'arrow-right', 'arrow-up', 'check',
            'info', 'book-open', 'monitor-smartphone', 'circle-play', 'map-pin', 'search-x', 'rotate-ccw', 'mail', 'phone',
            'clock', 'send', 'loader-circle', 'circle-alert', 'circle-check', 'truck', 'shield-check', 'badge-check',
            'headset', 'plus', 'minus', 'trash-2'];

        foreach ($names as $name) {
            $this->assertStringStartsWith('<svg', (string) self::icons()->svg($name), $name);
        }
    }

    #[Test]
    public function an_unknown_or_unsafe_name_fails(): void
    {
        $this->expectException(InvalidArgumentException::class);
        self::icons()->svg('../secrets');
    }
}

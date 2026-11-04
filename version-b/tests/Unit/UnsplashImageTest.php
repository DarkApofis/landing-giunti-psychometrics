<?php

namespace Tests\Unit;

use App\Support\UnsplashImage;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class UnsplashImageTest extends TestCase
{
    private const SRC = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?fm=jpg&fit=crop&w=1200&h=800&q=80';

    #[Test]
    public function it_resizes_keeping_the_3_2_crop_and_lets_the_cdn_pick_the_format(): void
    {
        $this->assertSame(
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?fit=crop&w=384&h=256&q=80&auto=format',
            UnsplashImage::url(self::SRC, 384),
        );
    }

    #[Test]
    public function the_srcset_offers_384_750_and_1200(): void
    {
        $candidates = array_map(static fn (string $c): string => substr($c, strrpos($c, ' ') + 1), explode(', ', UnsplashImage::srcset(self::SRC)));

        $this->assertSame(['384w', '750w', '1200w'], $candidates);
        $this->assertStringContainsString('w=750&h=500', UnsplashImage::srcset(self::SRC));
    }

    #[Test]
    public function the_sizes_are_the_ones_of_the_design_spec(): void
    {
        $this->assertSame('(min-width: 1280px) 360px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 2rem)', UnsplashImage::CARD_SIZES);
    }
}

<?php

namespace Tests\Unit;

use App\Content\ContentRepository;
use OutOfBoundsException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class ContentRepositoryTest extends TestCase
{
    private static function repository(): ContentRepository
    {
        return new ContentRepository(dirname(__DIR__, 2).'/resources/data');
    }

    #[Test]
    public function it_reads_the_twelve_products_in_file_order(): void
    {
        $products = self::repository()->products();

        $this->assertCount(12, $products);
        $this->assertSame('neura-q', $products[0]['id']);
        $this->assertSame(array_values(array_unique(array_column($products, 'id'))), array_column($products, 'id'));
    }

    #[Test]
    public function it_finds_a_product_by_id(): void
    {
        $this->assertSame('NEURA-Q — Batteria di valutazione neurocognitiva', self::repository()->product('neura-q')['name']);
        $this->assertNull(self::repository()->product('does-not-exist'));
    }

    #[Test]
    public function it_reads_content_by_dot_path(): void
    {
        $repository = self::repository();

        $this->assertSame('Giunti Psychometrics — Test psicologici e formazione per professionisti', $repository->content('site.title'));
        $this->assertSame('catalogo', $repository->content('sectionIds.catalog'));
        $this->assertIsArray($repository->content());
    }

    #[Test]
    public function an_unknown_key_is_an_error_not_an_empty_string(): void
    {
        $this->expectException(OutOfBoundsException::class);
        self::repository()->content('hero.doesNotExist');
    }

    #[Test]
    public function a_missing_data_directory_explains_how_to_fix_it(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('npm run sync:handoff');
        (new ContentRepository(sys_get_temp_dir().'/no-such-dir'))->products();
    }
}

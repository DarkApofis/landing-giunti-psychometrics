<?php

namespace Tests\Unit;

use App\Content\CatalogStats;
use App\Content\ContentRepository;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class CatalogStatsTest extends TestCase
{
    private static function repository(): ContentRepository
    {
        return new ContentRepository(dirname(__DIR__, 2).'/resources/data');
    }

    #[Test]
    public function hero_stats_are_computed_from_the_dataset_8_4_46(): void
    {
        $stats = (new CatalogStats(self::repository()))->heroStats();

        $this->assertSame([
            ['value' => 8, 'label' => 'test e questionari'],
            ['value' => 4, 'label' => 'corsi in calendario'],
            ['value' => 46, 'label' => 'crediti ECM disponibili'],
        ], $stats);
    }

    #[Test]
    public function they_match_the_figures_version_a_exported_to_content_json(): void
    {
        $repository = self::repository();

        $this->assertSame($repository->content('heroStats'), (new CatalogStats($repository))->heroStats());
    }
}

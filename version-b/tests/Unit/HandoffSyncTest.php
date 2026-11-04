<?php

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * resources/data must be a byte-for-byte copy of docs/handoff (generated from version-a's sources).
 * Fix a failure with `npm run sync:handoff`; never edit resources/data by hand.
 * Skipped when docs/ is not around, e.g. when version-b is deployed on its own.
 */
class HandoffSyncTest extends TestCase
{
    private const FILES = ['products.json', 'content.json'];

    private static function handoffDir(): string
    {
        return dirname(__DIR__, 3).'/docs/handoff';
    }

    private static function dataDir(): string
    {
        return dirname(__DIR__, 2).'/resources/data';
    }

    protected function setUp(): void
    {
        if (! is_dir(self::handoffDir())) {
            $this->markTestSkipped('docs/handoff is not available (standalone checkout of version-b).');
        }
    }

    #[Test]
    public function resources_data_holds_exactly_the_handoff_json_files(): void
    {
        $names = static fn (string $dir): array => array_map('basename', glob($dir.'/*.json') ?: []);

        $this->assertEqualsCanonicalizing(self::FILES, $names(self::handoffDir()));
        $this->assertEqualsCanonicalizing(self::FILES, $names(self::dataDir()), 'run `npm run sync:handoff`');
    }

    #[Test]
    public function every_file_is_identical_to_the_handoff_copy(): void
    {
        foreach (self::FILES as $file) {
            $this->assertSame(
                hash_file('sha256', self::handoffDir().'/'.$file),
                hash_file('sha256', self::dataDir().'/'.$file),
                "resources/data/{$file} differs from docs/handoff/{$file}: run `npm run sync:handoff`",
            );
        }
    }
}

<?php

namespace Tests\Unit;

use App\Support\AssetManifest;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class AssetManifestTest extends TestCase
{
    private static function manifest(): AssetManifest
    {
        return new AssetManifest(dirname(__DIR__).'/Fixtures/rev-manifest.json');
    }

    #[Test]
    public function it_resolves_the_hashed_file_of_an_asset(): void
    {
        $this->assertSame('build/css/app-0123456789.css', self::manifest()->path('css/app.css'));
        $this->assertSame('build/js/app-9876543210.js', self::manifest()->path('js/app.js'));
    }

    #[Test]
    public function an_unknown_asset_fails_with_the_fix(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Asset [css/missing.css] is not in the build manifest. Run `npm run build`.');
        self::manifest()->path('css/missing.css');
    }

    #[Test]
    public function a_missing_manifest_fails_with_the_fix(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Run `npm run build`');
        (new AssetManifest(sys_get_temp_dir().'/no-such-manifest.json'))->path('css/app.css');
    }
}

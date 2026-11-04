<?php

namespace App\Support;

use RuntimeException;

/**
 * Resolves the hashed file names Gulp writes to public/build/rev-manifest.json
 * ("css/app.css" → "build/css/app-1a2b3c4d5e.css"). Used by the Blade directive @asset.
 * The manifest is read once per process; a missing file or entry fails loudly with the fix.
 */
final class AssetManifest
{
    /** @var array<string, string>|null */
    private ?array $entries = null;

    public function __construct(
        private readonly string $manifestPath,
        private readonly string $buildDirectory = 'build',
    ) {}

    /** Absolute URL of a built asset, e.g. url('css/app.css'). */
    public function url(string $asset): string
    {
        return asset($this->path($asset));
    }

    /** Public path of a built asset, relative to public/ (e.g. "build/css/app-1a2b3c4d5e.css"). */
    public function path(string $asset): string
    {
        $entries = $this->entries ??= $this->load();

        if (! isset($entries[$asset])) {
            throw new RuntimeException("Asset [{$asset}] is not in the build manifest. Run `npm run build`.");
        }

        return $this->buildDirectory.'/'.$entries[$asset];
    }

    /** @return array<string, string> */
    private function load(): array
    {
        if (! is_file($this->manifestPath)) {
            throw new RuntimeException("Build manifest [{$this->manifestPath}] not found. Run `npm run build`.");
        }

        return json_decode((string) file_get_contents($this->manifestPath), true, 512, JSON_THROW_ON_ERROR);
    }
}

<?php

namespace App\Content;

use Illuminate\Support\Arr;
use OutOfBoundsException;
use RuntimeException;

/**
 * Read-only access to the handoff dataset in resources/data (products.json and content.json, copied
 * from docs/handoff by `npm run sync:handoff`). It is the only class that knows where the data lives.
 * Each file is read and decoded once per process; a missing key is an error, never a silent empty string.
 */
final class ContentRepository
{
    /** @var list<array<string, mixed>>|null */
    private ?array $products = null;

    /** @var array<string, mixed>|null */
    private ?array $content = null;

    public function __construct(private readonly string $dataPath) {}

    /** @return list<array<string, mixed>> The catalogue, in the order of the JSON file. */
    public function products(): array
    {
        return $this->products ??= $this->read('products.json');
    }

    /** @return array<string, mixed>|null */
    public function product(string $id): ?array
    {
        return Arr::first($this->products(), static fn (array $product): bool => $product['id'] === $id);
    }

    /**
     * Whole content.json, or one entry by dot path ("hero.title", "contact.channels").
     *
     * @throws OutOfBoundsException when the key does not exist
     */
    public function content(?string $key = null): mixed
    {
        $content = $this->content ??= $this->read('content.json');

        if ($key === null) {
            return $content;
        }
        if (! Arr::has($content, $key)) {
            throw new OutOfBoundsException("Unknown content key [{$key}] in content.json.");
        }

        return Arr::get($content, $key);
    }

    /** @return array<mixed> */
    private function read(string $file): array
    {
        $path = $this->dataPath.DIRECTORY_SEPARATOR.$file;

        if (! is_file($path)) {
            throw new RuntimeException("Missing data file [{$path}]. Run `npm run sync:handoff`.");
        }

        return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    }
}

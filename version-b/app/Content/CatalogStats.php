<?php

namespace App\Content;

/**
 * Figures derived from the catalogue, never written by hand. Mirrors version-a/src/data/hero.ts:
 * tests = products of type "test", courses = type "corso", ECM credits = sum over courses (null = 0).
 */
final class CatalogStats
{
    public function __construct(private readonly ContentRepository $content) {}

    /**
     * Hero key figures, in the order and with the labels of content.json → heroStats.
     *
     * @return list<array{value: int, label: string}>
     */
    public function heroStats(): array
    {
        $products = $this->content->products();
        $tests = array_filter($products, static fn (array $p): bool => $p['type'] === 'test');
        $courses = array_filter($products, static fn (array $p): bool => $p['type'] === 'corso');
        $ecmCredits = array_sum(array_map(static fn (array $c): int => (int) ($c['ecmCredits'] ?? 0), $courses));

        $values = [count($tests), count($courses), $ecmCredits];
        $labels = array_column($this->content->content('heroStats'), 'label');

        return array_map(
            static fn (int $value, string $label): array => ['value' => $value, 'label' => $label],
            $values,
            $labels,
        );
    }
}

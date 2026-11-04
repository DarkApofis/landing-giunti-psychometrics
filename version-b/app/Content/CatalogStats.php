<?php

namespace App\Content;

/**
 * Figures derived from the catalogue, never written by hand. Mirrors version-a/src/data/hero.ts:
 * tests = products of type "test", courses = type "corso", ECM credits = sum over courses (null = 0).
 */
final class CatalogStats
{
    public function __construct(private readonly ContentRepository $content) {}

    /** "Nessun prodotto trovato" · "1 prodotto trovato" · "12 prodotti trovati" (same keys the JS uses). */
    public static function resultsLabel(int $count): string
    {
        return match ($count) {
            0 => __('ui.catalog.results.none'),
            1 => __('ui.catalog.results.one'),
            default => __('ui.catalog.results.many', ['count' => $count]),
        };
    }

    /**
     * Category pills with their initial counts (no search applied): "Tutti" first, then the categories
     * in the order of content.json. The JS recomputes the counts with the search applied.
     *
     * @return list<array{id: string, label: string, count: int, active: bool}>
     */
    public function pills(string $active = 'tutti'): array
    {
        $products = $this->content->products();
        $pills = [[
            'id' => 'tutti',
            'label' => $this->content->content('allCategoriesLabel'),
            'count' => count($products),
            'active' => $active === 'tutti',
        ]];

        foreach ($this->content->content('categories') as $category) {
            $pills[] = [
                'id' => $category['id'],
                'label' => $category['label'],
                'count' => count(array_filter($products, static fn (array $p): bool => $p['category'] === $category['id'])),
                'active' => $active === $category['id'],
            ];
        }

        return $pills;
    }

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

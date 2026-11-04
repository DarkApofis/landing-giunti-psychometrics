<?php

namespace App\Content;

use App\Support\Format;
use App\Support\UnsplashImage;

/**
 * Turns a raw product of products.json into everything a card needs, already formatted on the server
 * (docs/HANDOFF-LARAVEL.md §4.3 and §5): metadata rows, price parts, badge, image srcset and the
 * accessible name of the action. Blade only prints these values.
 */
final class ProductPresenter
{
    /** Format → badge modifier and lucide icon (DESIGN-SPEC §1.3). */
    private const FORMATS = [
        'Cartaceo' => ['modifier' => 'cartaceo', 'icon' => 'book-open'],
        'Digitale' => ['modifier' => 'digitale', 'icon' => 'monitor-smartphone'],
        'Corso online' => ['modifier' => 'online', 'icon' => 'circle-play'],
        'In presenza' => ['modifier' => 'presenza', 'icon' => 'map-pin'],
    ];

    public function __construct(private readonly ContentRepository $content) {}

    /** @return list<array<string, mixed>> every product, in the order of the JSON */
    public function all(): array
    {
        return array_map($this->present(...), $this->content->products());
    }

    /** @param array<string, mixed> $product */
    public function present(array $product): array
    {
        $isTest = $product['type'] === 'test';
        $action = $isTest ? __('ui.product.details') : __('ui.product.add');

        return [
            'id' => $product['id'],
            'type' => $product['type'],
            'name' => $product['name'],
            'description' => $product['description'],
            'category' => $product['category'],
            'categoryLabel' => $this->categoryLabel($product['category']),
            'titleId' => "product-{$product['id']}-title",
            'format' => ['label' => $product['format']] + self::FORMATS[$product['format']],
            'meta' => $isTest ? $this->testMeta($product) : $this->courseMeta($product),
            'price' => $this->price($product['originalPrice'], $product['discountPrice']),
            'image' => [
                'src' => UnsplashImage::url($product['image']['src'], 1200),
                'srcset' => UnsplashImage::srcset($product['image']['src']),
                'sizes' => UnsplashImage::CARD_SIZES,
                'alt' => $product['image']['alt'],
            ],
            'action' => [
                'label' => $action,
                'ariaLabel' => __('ui.product.action_label', ['action' => $action, 'name' => $product['name']]),
            ],
        ];
    }

    /**
     * What the JS needs per product (embedded in the page configuration): the details dialog of the
     * tests and the cart lines of the courses. Every visible value is already formatted here; the JS
     * only computes money totals (in cents, from the raw prices).
     *
     * @return array<string, array<string, mixed>> keyed by product id
     */
    public function forScript(): array
    {
        $result = [];
        foreach ($this->content->products() as $product) {
            $card = $this->present($product);
            $entry = [
                'id' => $product['id'],
                'type' => $product['type'],
                'name' => $product['name'],
                'format' => $card['format'],
                'originalPrice' => $product['originalPrice'],
                'discountPrice' => $product['discountPrice'],
                'image' => [
                    'alt' => $product['image']['alt'],
                    // 64px square thumbnail, object-fit cover: a 192×128 crop covers it up to 2× density.
                    'thumb' => UnsplashImage::url($product['image']['src'], 192),
                ],
            ];

            if ($product['type'] === 'test') {
                $qualification = $this->content->content("qualifications.{$product['qualification']}");
                $entry += [
                    'categoryLabel' => $card['categoryLabel'],
                    'description' => $product['description'],
                    'author' => $product['author'],
                    'age' => Format::ageRange($product['ageRange']),
                    'administration' => __('ui.dialog.administration_value', ['count' => $product['administrationMinutes']]),
                    'qualification' => ['label' => $qualification['label'], 'description' => $qualification['description']],
                    'price' => $card['price'],
                    'dialogImage' => [
                        'src' => UnsplashImage::url($product['image']['src'], 1200),
                        'srcset' => UnsplashImage::srcset($product['image']['src']),
                    ],
                ];
            } else {
                $entry += [
                    'startDate' => $product['startDate'],
                    'startDateShort' => Format::dateShort($product['startDate']),
                ];
            }

            $result[$product['id']] = $entry;
        }

        return $result;
    }

    /**
     * Final price first (24/700), then the struck original and the saving chip; every part carries its
     * sr-only prefix so screen readers hear "Prezzo scontato …, prezzo originale …, risparmi il 15%".
     *
     * @return array{final: string, original: string|null, percent: int|null}
     */
    public function price(int|float $originalPrice, int|float|null $discountPrice): array
    {
        $percent = Format::discountPercent($originalPrice, $discountPrice);

        return $percent === null || $discountPrice === null
            ? ['final' => Format::price($originalPrice), 'original' => null, 'percent' => null]
            : ['final' => Format::price($discountPrice), 'original' => Format::price($originalPrice), 'percent' => $percent];
    }

    private function categoryLabel(string $id): string
    {
        foreach ($this->content->content('categories') as $category) {
            if ($category['id'] === $id) {
                return $category['label'];
            }
        }

        return '';
    }

    /** @return list<array{label: string, value: string, datetime?: string}> */
    private function testMeta(array $product): array
    {
        $qualification = $this->content->content("qualifications.{$product['qualification']}.label");

        return [
            ['label' => __('ui.product.meta.author'), 'value' => $product['author']],
            ['label' => __('ui.product.meta.age'), 'value' => Format::ageRange($product['ageRange'])],
            // "Qualifica C" → "C", as version-a does
            ['label' => __('ui.product.meta.qualification'), 'value' => str_replace(__('ui.product.meta.qualification').' ', '', $qualification)],
            ['label' => __('ui.product.meta.duration'), 'value' => __('ui.product.minutes', ['count' => $product['administrationMinutes']])],
        ];
    }

    /** @return list<array{label: string, value: string, datetime?: string}> */
    private function courseMeta(array $product): array
    {
        $duration = __('ui.product.hours', ['count' => $product['durationHours']]);
        if ($product['ecmCredits'] !== null) {
            $duration .= ' · '.__('ui.product.ecm', ['count' => $product['ecmCredits']]);
        }

        return [
            ['label' => __('ui.product.meta.instructor'), 'value' => $product['instructor']],
            ['label' => __('ui.product.meta.start'), 'value' => Format::dateLong($product['startDate']), 'datetime' => $product['startDate']],
            ['label' => __('ui.product.meta.duration'), 'value' => $duration],
            ['label' => __('ui.product.meta.location'), 'value' => $product['location'] ?? __('ui.product.online')],
        ];
    }
}

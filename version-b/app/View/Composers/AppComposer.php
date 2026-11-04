<?php

namespace App\View\Composers;

use App\Content\ContentRepository;
use Illuminate\View\View;

/**
 * Data every page layout needs: site metadata (SEO / Open Graph), section ids, the main navigation
 * and the configuration object the JS reads from <script type="application/json" id="app-config">.
 */
final class AppComposer
{
    public function __construct(private readonly ContentRepository $content) {}

    public function compose(View $view): void
    {
        $view->with([
            'site' => $this->content->content('site'),
            'sectionIds' => $this->content->content('sectionIds'),
            'mainNav' => $this->content->content('mainNav'),
            'appConfig' => $this->appConfig(),
        ]);
    }

    /**
     * Everything the JS needs, so no visible text is written in JS (docs/PLAN-B.md §3.2).
     * Grows with each behaviour (catalogue, cart, form).
     *
     * @return array<string, mixed>
     */
    private function appConfig(): array
    {
        return [
            'sectionIds' => $this->content->content('sectionIds'),
            'catalog' => [
                'allLabel' => $this->content->content('allCategoriesLabel'),
                'categories' => $this->content->content('categories'),
            ],
            'i18n' => [
                'menu' => __('ui.menu'),
                'catalog' => __('ui.catalog'),
            ],
        ];
    }
}

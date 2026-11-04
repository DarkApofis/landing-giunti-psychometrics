<?php

namespace App\View\Composers;

use App\Content\ContentRepository;
use Illuminate\View\View;

/**
 * Data every page layout needs: site metadata (SEO / Open Graph), section ids and the
 * configuration object the JS reads from <script type="application/json" id="app-config">.
 */
final class AppComposer
{
    public function __construct(private readonly ContentRepository $content) {}

    public function compose(View $view): void
    {
        $view->with([
            'site' => $this->content->content('site'),
            'sectionIds' => $this->content->content('sectionIds'),
            'appConfig' => $this->appConfig(),
        ]);
    }

    /**
     * Grows with each behaviour (texts, limits, products for the dialog and the cart: docs/PLAN-B.md §3.2).
     *
     * @return array<string, mixed>
     */
    private function appConfig(): array
    {
        return [
            'sectionIds' => $this->content->content('sectionIds'),
        ];
    }
}

<?php

namespace App\View\Composers;

use App\Content\ContentRepository;
use App\Content\ProductPresenter;
use App\Support\HomeLink;
use Closure;
use Illuminate\View\View;

/**
 * Data every page layout needs: site metadata (SEO / Open Graph), section ids, the main navigation,
 * the cart copy, $homeHref (links to the home sections that also work from other pages) and the
 * configuration object the JS reads from
 * <script type="application/json" id="app-config">.
 */
final class AppComposer
{
    /** @var array<string, mixed>|null built once per request, shared by every view it composes */
    private ?array $appConfig = null;

    public function __construct(
        private readonly ContentRepository $content,
        private readonly ProductPresenter $presenter,
    ) {}

    public function compose(View $view): void
    {
        $view->with([
            'site' => $this->content->content('site'),
            'sectionIds' => $this->content->content('sectionIds'),
            'mainNav' => $this->content->content('mainNav'),
            'cart' => $this->content->content('cart'),
            'footer' => $this->content->content('footer'),
            'homeHref' => $this->homeHref(),
            'appConfig' => $this->appConfig ??= $this->appConfig(),
        ]);
    }

    /**
     * $homeHref('#catalogo', 'formazione'): unchanged on the home, "/?categoria=formazione#catalogo"
     * on any other page (info pages, 404).
     *
     * @return Closure(string, ?string=): string
     */
    private function homeHref(): Closure
    {
        $ids = $this->content->content('sectionIds');
        $layoutAnchors = ['#'.$ids['main'], '#'.$ids['resources']];

        return static fn (string $href, ?string $category = null): string => HomeLink::href(
            $href,
            $category,
            request()->routeIs('home'),
            $layoutAnchors,
        );
    }

    /**
     * Everything the JS needs, so no visible text is written in JS (docs/PLAN-B.md §3.2):
     * texts from content.json and lang/it, the categories, and the products (dialog and cart data,
     * already formatted by PHP).
     *
     * @return array<string, mixed>
     */
    private function appConfig(): array
    {
        $cart = $this->content->content('cart');

        return [
            'sectionIds' => $this->content->content('sectionIds'),
            'catalog' => [
                'allLabel' => $this->content->content('allCategoriesLabel'),
                'categories' => $this->content->content('categories'),
            ],
            'products' => $this->presenter->forScript(),
            'contact' => [
                'limits' => $this->content->content('validation.limits'),
                'fields' => $this->content->content('validation.fields'),
                'submitDelayMs' => $this->content->content('contact.copy.submitDelayMs'),
            ],
            'i18n' => [
                'menu' => __('ui.menu'),
                'catalog' => __('ui.catalog'),
                'product' => [
                    'add' => __('ui.product.add'),
                    'added' => __('ui.product.added'),
                    'actionLabel' => __('ui.product.action_label'),
                    'saving' => __('ui.product.saving'),
                ],
                'contact' => [
                    'validation' => __('ui.contact.validation'),
                    'errorSummary' => __('ui.contact.error_summary'),
                    'successBody' => __('ui.contact.success_body'),
                    'submit' => $this->content->content('contact.copy.submit'),
                    'submitting' => $this->content->content('contact.copy.submitting'),
                ],
                'cart' => __('ui.cart') + [
                    'cleared' => $cart['cleared'],
                    'button' => __('ui.cart_button'),
                    'count' => __('ui.cart_count'),
                ],
            ],
        ];
    }
}

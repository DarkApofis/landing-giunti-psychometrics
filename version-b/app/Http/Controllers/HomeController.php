<?php

namespace App\Http\Controllers;

use App\Content\CatalogStats;
use App\Content\ContentRepository;
use App\Content\ProductPresenter;
use App\Support\HeroIllustration;
use Illuminate\Contracts\View\View;

final class HomeController extends Controller
{
    public function __invoke(ContentRepository $content, CatalogStats $stats, ProductPresenter $presenter): View
    {
        $products = $presenter->all();

        return view('pages.home', [
            'hero' => $content->content('hero'),
            'heroStats' => $stats->heroStats(),
            'heroIllustration' => HeroIllustration::geometry(),
            'catalog' => $content->content('catalog'),
            'pills' => $stats->pills(),
            'products' => $products,
            'resultsLabel' => CatalogStats::resultsLabel(count($products)),
            'trust' => $content->content('trust'),
            'contact' => $content->content('contact'),
            'limits' => $content->content('validation.limits'),
        ]);
    }
}

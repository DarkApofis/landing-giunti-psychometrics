<?php

namespace App\Http\Controllers;

use App\Content\CatalogStats;
use App\Content\ContentRepository;
use App\Support\HeroIllustration;
use Illuminate\Contracts\View\View;

final class HomeController extends Controller
{
    public function __invoke(ContentRepository $content, CatalogStats $stats): View
    {
        return view('pages.home', [
            'hero' => $content->content('hero'),
            'heroStats' => $stats->heroStats(),
            'heroIllustration' => HeroIllustration::geometry(),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Content\ContentRepository;
use Illuminate\Contracts\View\View;

final class HomeController extends Controller
{
    public function __invoke(ContentRepository $content): View
    {
        return view('pages.home', [
            'hero' => $content->content('hero'),
        ]);
    }
}

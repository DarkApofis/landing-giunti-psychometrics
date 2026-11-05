<?php

namespace App\Http\Controllers;

use App\Content\ContentRepository;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Arr;

/**
 * Institutional pages of the footer: columns "Azienda" / "Assistenza" and the legal links (content.json → pages,
 * fictional content). Mirrors version-a/src/app/(info)/info-route.tsx: any other slug (e.g. /privacy,
 * not part of the demo) is the Italian 404.
 */
final class InfoPageController extends Controller
{
    public function __invoke(ContentRepository $content, string $slug): View
    {
        $page = Arr::first($content->content('pages.list'), static fn (array $page): bool => $page['slug'] === $slug);
        abort_if($page === null, 404);

        // Other pages of the same section: its footer column, or the legal links (infoSectionLinks in A).
        $siblings = $page['section'] === 'Note legali'
            ? $content->content('footer.legal')
            : Arr::first(
                $content->content('footer.columns'),
                static fn (array $column): bool => $column['title'] === $page['section'],
            )['links'] ?? [];

        return view('pages.info', [
            'page' => $page,
            'pageCopy' => $content->content('pages.copy'),
            'siblings' => $siblings,
            'meta' => [
                'title' => $page['title'].' | '.$content->content('site.name'),
                'description' => $page['description'],
                'url' => url($page['slug']),
            ],
        ]);
    }
}

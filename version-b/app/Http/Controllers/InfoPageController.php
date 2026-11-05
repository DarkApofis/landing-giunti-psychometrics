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

        $siblings = self::siblingLinks($content->content('footer'), $page['slug']);

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

    /**
     * Other pages of the same section (infoSectionLinks in A): the footer list (legal links or a column)
     * that links to this page. Found by membership, so renaming a section title in content.json cannot
     * silently break it.
     *
     * @param  array{legal: list<array{href: string}>, columns: list<array{links: list<array{href: string}>}>}  $footer
     * @return list<array{label: string, href: string}>
     */
    public static function siblingLinks(array $footer, string $slug): array
    {
        $lists = [$footer['legal'], ...array_column($footer['columns'], 'links')];

        return Arr::first(
            $lists,
            static fn (array $links): bool => in_array('/'.$slug, array_column($links, 'href'), true),
        ) ?? [];
    }
}

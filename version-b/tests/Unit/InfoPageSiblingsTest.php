<?php

namespace Tests\Unit;

use App\Http\Controllers\InfoPageController;
use PHPUnit\Framework\TestCase;

/** The "other pages of this section" list is found by membership, not by comparing section titles. */
class InfoPageSiblingsTest extends TestCase
{
    private const FOOTER = [
        'legal' => [['label' => 'Privacy', 'href' => '/privacy'], ['label' => 'Cookie', 'href' => '/cookie']],
        'columns' => [
            ['title' => 'Esplora', 'links' => [['label' => 'Tutti i test', 'href' => '#catalogo']]],
            ['title' => 'Chi siamo e dintorni', 'links' => [['label' => 'Chi siamo', 'href' => '/chi-siamo'], ['label' => 'FAQ', 'href' => '/faq']]],
        ],
    ];

    public function test_it_returns_the_column_that_links_to_the_page_whatever_its_title(): void
    {
        $this->assertSame(['/chi-siamo', '/faq'], array_column(InfoPageController::siblingLinks(self::FOOTER, 'faq'), 'href'));
    }

    public function test_it_returns_the_legal_links_for_a_legal_page(): void
    {
        $this->assertSame(['/privacy', '/cookie'], array_column(InfoPageController::siblingLinks(self::FOOTER, 'cookie'), 'href'));
    }

    public function test_a_page_linked_from_nowhere_has_no_siblings(): void
    {
        $this->assertSame([], InfoPageController::siblingLinks(self::FOOTER, 'orfana'));
    }
}

<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use Dom\Element;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** Server-rendered catalogue: HANDOFF §4.3 markup, the 12 cards in JSON order, accessible names. */
class CatalogMarkupTest extends TestCase
{
    private HTMLDocument $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));
        $this->document = HTMLDocument::createFromString($this->get('/')->assertOk()->getContent(), LIBXML_NOERROR);
    }

    private function one(string $selector, ?Element $in = null): Element
    {
        $element = ($in ?? $this->document)->querySelector($selector);
        $this->assertNotNull($element, "missing {$selector}");

        return $element;
    }

    #[Test]
    public function the_section_follows_the_hero_with_its_landmark_and_heading(): void
    {
        $section = $this->one('main > section#catalogo');
        $this->assertSame('catalogo-title', $section->getAttribute('aria-labelledby'));
        $this->assertSame('Strumenti e corsi per la tua pratica professionale', trim($this->one('h2#catalogo-title')->textContent));
        $this->assertSame('hero-title', $section->previousElementSibling->getAttribute('aria-labelledby'));
    }

    #[Test]
    public function the_twelve_cards_are_rendered_in_json_order(): void
    {
        $products = json_decode((string) file_get_contents(resource_path('data/products.json')), true);
        $items = iterator_to_array($this->document->querySelectorAll('ul.product-grid[role="list"] > li.product-grid__item'));

        $this->assertSame(array_column($products, 'id'), array_map(static fn ($li) => $li->getAttribute('data-id'), $items));
        $this->assertSame(array_column($products, 'category'), array_map(static fn ($li) => $li->getAttribute('data-category'), $items));
        foreach ($items as $li) {
            $this->assertFalse($li->hasAttribute('hidden'));
        }
    }

    #[Test]
    public function pills_start_with_tutti_pressed_and_named_with_their_counts(): void
    {
        $this->assertSame('Filtra per categoria', $this->one('.category-filter[role="group"]')->getAttribute('aria-label'));

        $pills = array_map(
            static fn ($b) => [$b->getAttribute('data-category'), $b->getAttribute('aria-pressed'), $b->getAttribute('aria-label'), trim($b->textContent)],
            iterator_to_array($this->document->querySelectorAll('.category-filter button.pill')),
        );
        $this->assertSame([
            ['tutti', 'true', 'Tutti 12 prodotti', 'Tutti 12'],
            ['clinica-neuropsicologia', 'false', 'Clinica e Neuropsicologia 3 prodotti', 'Clinica e Neuropsicologia 3'],
            ['scuola-eta-evolutiva', 'false', 'Scuola ed Età evolutiva 3 prodotti', 'Scuola ed Età evolutiva 3'],
            ['lavoro-organizzazioni', 'false', 'Lavoro e Organizzazioni 2 prodotti', 'Lavoro e Organizzazioni 2'],
            ['formazione', 'false', 'Formazione 4 prodotti', 'Formazione 4'],
        ], $pills);
    }

    #[Test]
    public function the_results_counter_has_a_visible_text_and_a_polite_live_region(): void
    {
        $this->assertSame('12 prodotti trovati', trim($this->one('.results-status__visible[aria-hidden="true"]')->textContent));
        $live = $this->one('.results-status [role="status"]');
        $this->assertSame('polite', $live->getAttribute('aria-live'));
        $this->assertSame('true', $live->getAttribute('aria-atomic'));
        $this->assertSame('12 prodotti trovati', trim($live->textContent));
    }

    #[Test]
    public function a_discounted_test_card_has_the_full_anatomy(): void
    {
        $card = $this->one('li[data-id="neura-q"] article.product-card');
        $this->assertSame('product-neura-q-title', $card->getAttribute('aria-labelledby'));
        $this->assertSame('NEURA-Q — Batteria di valutazione neurocognitiva', trim($this->one('h3#product-neura-q-title', $card)->textContent));

        $img = $this->one('img.product-card__img', $card);
        foreach (['width' => '1200', 'height' => '800', 'loading' => 'lazy', 'decoding' => 'async'] as $attribute => $value) {
            $this->assertSame($value, $img->getAttribute($attribute), $attribute);
        }
        $this->assertStringContainsString('384w', $img->getAttribute('srcset'));
        $this->assertStringContainsString('cervello', $img->getAttribute('alt'));

        $badge = $this->one('.format-badge.format-badge--cartaceo', $card);
        $this->assertSame('Formato: Cartaceo', preg_replace('/\s+/', ' ', trim($badge->textContent)));
        $this->assertSame('Formato:', trim($this->one('.sr-only', $badge)->textContent));

        // Collapse ASCII whitespace only: the no-break space before "€" (U+00A0) must survive.
        $price = preg_replace('/[ \t\r\n]+/', ' ', trim($this->one('.price', $card)->textContent));
        $this->assertSame("Prezzo scontato: 1.062,50\u{00A0}€ , prezzo originale: 1.250,00\u{00A0}€ \u{2212}15%, risparmi il 15%", $price);
        $this->assertSame("1.250,00\u{00A0}€", $this->one('s', $card)->textContent);
        $this->assertSame('true', $this->one('.price__saving > span', $card)->getAttribute('aria-hidden'));

        $button = $this->one('button[data-details="neura-q"]', $card);
        $this->assertSame('dialog', $button->getAttribute('aria-haspopup'));
        $this->assertStringStartsWith(trim($button->textContent).':', $button->getAttribute('aria-label'), 'label-in-name');
    }

    #[Test]
    public function a_course_card_has_its_date_and_add_to_cart_action(): void
    {
        $card = $this->one('li[data-id="corso-valutazione-adulto"] article');
        $time = $this->one('time', $card);
        $this->assertSame('2027-01-19', $time->getAttribute('datetime'));
        $this->assertSame('19 gennaio 2027', $time->textContent);

        $button = $this->one('button[data-add-to-cart="corso-valutazione-adulto"]', $card);
        $this->assertStringStartsWith('Aggiungi al carrello: ', $button->getAttribute('aria-label'));
        $this->assertSame('Aggiungi al carrello', trim($button->textContent));
    }

    #[Test]
    public function a_card_without_discount_shows_one_price(): void
    {
        $card = $this->one('li[data-id="ansia-d"] article');
        $this->assertNull($card->querySelector('s'));
        $this->assertSame("Prezzo: 180,00\u{00A0}€", preg_replace('/[ \t\r\n]+/', ' ', trim($this->one('.price', $card)->textContent)));
    }

    #[Test]
    public function the_empty_state_is_hidden_and_has_its_reset_button(): void
    {
        $empty = $this->one('.empty-state[hidden]');
        $this->assertSame('Nessun prodotto trovato', trim($this->one('h3', $empty)->textContent));
        $this->assertNotNull($empty->querySelector('[data-empty-context]'));
        $this->assertSame('Azzera filtri', trim($this->one('button[data-reset-filters]', $empty)->textContent));
    }

    #[Test]
    public function every_card_action_has_a_unique_name_containing_its_visible_text(): void
    {
        $names = [];
        foreach ($this->document->querySelectorAll('.product-card__action button') as $button) {
            $visible = trim(preg_replace('/\s+/', ' ', $button->textContent));
            $this->assertStringStartsWith($visible.': ', $button->getAttribute('aria-label'));
            $names[] = $button->getAttribute('aria-label');
        }
        $this->assertCount(12, array_unique($names));
    }
}

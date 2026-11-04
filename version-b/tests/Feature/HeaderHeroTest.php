<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use Dom\Element;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** Header and hero markup: the ids, ARIA and data-* attributes of HANDOFF §4.1–4.2, kept verbatim. */
class HeaderHeroTest extends TestCase
{
    private HTMLDocument $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));
        $this->document = HTMLDocument::createFromString($this->get('/')->assertOk()->getContent(), LIBXML_NOERROR);
    }

    private function one(string $selector): Element
    {
        $element = $this->document->querySelector($selector);
        $this->assertNotNull($element, "missing {$selector}");

        return $element;
    }

    #[Test]
    public function header_and_main_follow_the_skip_link_in_order(): void
    {
        $children = array_map(static fn ($el) => $el->tagName, iterator_to_array($this->document->querySelectorAll('body > *')));

        $this->assertSame(['A', 'HEADER', 'MAIN'], array_slice($children, 0, 3));
        $this->assertSame('hero-title', $this->one('main > section:first-child')->getAttribute('aria-labelledby'));
    }

    #[Test]
    public function both_navigations_carry_the_main_nav_items_and_their_categories(): void
    {
        foreach (['.main-nav', '.mobile-menu__nav'] as $nav) {
            $this->assertSame('Navigazione principale', $this->one($nav)->getAttribute('aria-label'));
            $links = array_map(
                static fn ($a) => [trim($a->textContent), $a->getAttribute('href'), $a->getAttribute('data-category')],
                iterator_to_array($this->document->querySelectorAll($nav.' a')),
            );
            $this->assertSame([
                ['Test', '#catalogo', 'tutti'],
                ['Formazione', '#catalogo', 'formazione'],
                ['Risorse', '#risorse', null],
                ['Contatti', '#contatti', null],
            ], $links);
        }
    }

    #[Test]
    public function the_search_has_a_hidden_label_and_a_hidden_clear_button(): void
    {
        $this->assertNotNull($this->one('search.site-search form'));
        $this->assertSame('site-search-input', $this->one('label.sr-only')->getAttribute('for'));
        $input = $this->one('#site-search-input');
        foreach (['type' => 'search', 'name' => 'q', 'placeholder' => 'Cerca test o corsi…', 'autocomplete' => 'off', 'enterkeyhint' => 'search', 'spellcheck' => 'false'] as $attribute => $value) {
            $this->assertSame($value, $input->getAttribute($attribute), $attribute);
        }
        $clear = $this->one('.site-search__clear');
        $this->assertSame('Cancella la ricerca', $clear->getAttribute('aria-label'));
        $this->assertTrue($clear->hasAttribute('hidden'));
    }

    #[Test]
    public function the_cart_button_and_its_live_region_start_empty(): void
    {
        $button = $this->one('.cart-button');
        $this->assertSame('Apri il carrello, nessun articolo', $button->getAttribute('aria-label'));
        $this->assertSame('dialog', $button->getAttribute('aria-haspopup'));
        $this->assertSame('cart-drawer', $button->getAttribute('aria-controls'));
        $this->assertTrue($this->one('.cart-button__badge')->hasAttribute('hidden'));

        $live = $this->one('[data-cart-live]');
        $this->assertSame('polite', $live->getAttribute('aria-live'));
        $this->assertSame('', trim($live->textContent));
    }

    #[Test]
    public function the_mobile_menu_toggle_controls_a_hidden_panel(): void
    {
        $toggle = $this->one('.mobile-menu__toggle');
        $this->assertSame('Apri il menu', $toggle->getAttribute('aria-label'));
        $this->assertSame('false', $toggle->getAttribute('aria-expanded'));
        $this->assertSame('mobile-menu-panel', $toggle->getAttribute('aria-controls'));
        $this->assertTrue($this->one('#mobile-menu-panel')->hasAttribute('hidden'));
        $this->assertSame('true', $this->one('.mobile-menu__backdrop')->getAttribute('aria-hidden'));
    }

    #[Test]
    public function accedi_is_a_visual_only_button(): void
    {
        foreach ($this->document->querySelectorAll('.site-header__login button, .mobile-menu__login button') as $button) {
            $this->assertSame('button', $button->getAttribute('type'));
            $this->assertSame('Accedi', trim($button->textContent));
        }
    }

    #[Test]
    public function the_hero_shows_the_dataset_figures_and_ctas(): void
    {
        $this->assertSame('Test psicologici e formazione per chi lavora con le persone', trim($this->one('h1#hero-title')->textContent));
        $this->assertCount(1, $this->document->querySelectorAll('h1'));

        $stats = array_map(
            static fn ($div) => [trim($div->querySelector('dt')->textContent), trim($div->querySelector('dd')->textContent)],
            iterator_to_array($this->document->querySelectorAll('.hero__stat')),
        );
        $this->assertSame([['test e questionari', '8'], ['corsi in calendario', '4'], ['crediti ECM disponibili', '46']], $stats);

        $ctas = $this->document->querySelectorAll('.hero__ctas a');
        $this->assertSame('#catalogo', $ctas[0]->getAttribute('href'));
        $this->assertFalse($ctas[0]->hasAttribute('data-category'));
        $this->assertSame('formazione', $ctas[1]->getAttribute('data-category'));
    }

    #[Test]
    public function every_svg_is_decorative(): void
    {
        foreach ($this->document->querySelectorAll('svg') as $svg) {
            $this->assertSame('true', $svg->getAttribute('aria-hidden'));
        }
    }

    #[Test]
    public function the_js_gets_the_menu_labels_from_the_language_file(): void
    {
        $config = json_decode($this->one('#app-config')->textContent, true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame(['open' => 'Apri il menu', 'close' => 'Chiudi il menu'], $config['i18n']['menu']);
    }
}

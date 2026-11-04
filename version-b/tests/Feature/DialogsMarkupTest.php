<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use Dom\Element;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** Product dialog and cart drawer markup (HANDOFF §4.4) and the data the JS gets for them. */
class DialogsMarkupTest extends TestCase
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

    private function config(): array
    {
        return json_decode($this->one('#app-config')->textContent, true, 512, JSON_THROW_ON_ERROR);
    }

    #[Test]
    public function the_product_dialog_is_one_modal_with_chiudi_first(): void
    {
        $this->assertCount(1, $this->document->querySelectorAll('dialog.product-dialog'));
        $dialog = $this->one('dialog#product-dialog');
        $this->assertSame('true', $dialog->getAttribute('aria-modal'));
        $this->assertSame('product-dialog-title', $dialog->getAttribute('aria-labelledby'));
        $this->assertFalse($dialog->hasAttribute('open'));

        $first = $dialog->querySelector('button, a[href]');
        $this->assertSame('Chiudi', $first->getAttribute('aria-label'));
        $this->assertSame('#contatti', $this->one('#product-dialog a[data-dialog-leave]')->getAttribute('href'));
    }

    #[Test]
    public function the_cart_drawer_starts_empty(): void
    {
        $drawer = $this->one('dialog#cart-drawer');
        $this->assertSame('true', $drawer->getAttribute('aria-modal'));
        $this->assertSame('cart-title', $drawer->getAttribute('aria-labelledby'));
        $this->assertSame('Chiudi il carrello', $drawer->querySelector('button')->getAttribute('aria-label'));

        $this->assertFalse($this->one('[data-cart-empty]')->hasAttribute('hidden'));
        $this->assertTrue($this->one('[data-cart-content]')->hasAttribute('hidden'));
        $this->assertSame('', trim($this->one('[data-cart-list]')->textContent));
        $this->assertSame('Articoli nel carrello', $this->one('[data-cart-list]')->getAttribute('aria-label'));

        $empty = $this->one('[data-cart-empty] a');
        $this->assertSame('Scopri i corsi', trim($empty->textContent));
        $this->assertSame('formazione', $empty->getAttribute('data-category'));

        $this->assertSame('cart-demo-note', $this->one('.cart-drawer__checkout')->getAttribute('aria-describedby'));
        $this->assertSame('Demo: l’ordine non viene inviato.', trim($this->one('#cart-demo-note')->textContent));
    }

    #[Test]
    public function the_cart_line_template_has_a_labelled_stepper_and_a_decorative_thumbnail(): void
    {
        $template = $this->one('template#cart-line-template');
        $html = $this->document->saveHtml($template);

        $this->assertStringContainsString('role="group"', $html);
        $this->assertStringContainsString('<output', $html);
        $this->assertStringContainsString('alt=""', $html);
        $this->assertStringContainsString('data-cart-remove', $html);
    }

    #[Test]
    public function the_global_announcer_is_a_polite_status_region(): void
    {
        $region = $this->one('[data-announcer]');
        $this->assertSame('status', $region->getAttribute('role'));
        $this->assertSame('polite', $region->getAttribute('aria-live'));
    }

    #[Test]
    public function the_js_gets_formatted_dialog_data_for_tests_and_raw_prices_for_courses(): void
    {
        $products = $this->config()['products'];
        $this->assertCount(12, $products);

        $neura = $products['neura-q'];
        $this->assertSame('circa 75 minuti', $neura['administration']);
        $this->assertSame('Qualifica C', $neura['qualification']['label']);
        $this->assertSame(['final' => "1.062,50\u{00A0}€", 'original' => "1.250,00\u{00A0}€", 'percent' => 15], $neura['price']);

        $course = $products['corso-dsa'];
        $this->assertSame('corso', $course['type']);
        $this->assertSame(450, $course['originalPrice']);
        $this->assertSame(382.5, $course['discountPrice']);
        $this->assertSame('10 apr 2027', $course['startDateShort']);
        $this->assertStringContainsString('w=192&h=128', $course['image']['thumb']);
    }

    #[Test]
    public function the_js_gets_every_cart_text_from_the_language_files(): void
    {
        $cart = $this->config()['i18n']['cart'];

        $this->assertSame(':name aggiunto al carrello', $cart['added']);
        $this->assertSame('Rimuovi :name dal carrello', $cart['remove']);
        $this->assertSame('Carrello svuotato', $cart['cleared']);
        $this->assertSame(['empty' => 'Apri il carrello, nessun articolo', 'with_items' => 'Apri il carrello, :count'], $cart['button']);
        $this->assertSame(['none' => 'Nessun articolo nel carrello', 'one' => '1 articolo nel carrello', 'many' => ':count articoli nel carrello'], $cart['count']);
    }
}

<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use Dom\Element;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** Trust strip, contact form, footer (HANDOFF §4.5) and the Italian 404. */
class ContactFooterMarkupTest extends TestCase
{
    private function document(string $uri = '/', int $status = 200): HTMLDocument
    {
        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));

        return HTMLDocument::createFromString($this->get($uri)->assertStatus($status)->getContent(), LIBXML_NOERROR);
    }

    private function one(HTMLDocument $document, string $selector): Element
    {
        $element = $document->querySelector($selector);
        $this->assertNotNull($element, "missing {$selector}");

        return $element;
    }

    #[Test]
    public function main_follows_the_mandatory_section_order(): void
    {
        $sections = array_map(
            static fn ($s) => $s->getAttribute('aria-labelledby'),
            iterator_to_array($this->document()->querySelectorAll('main > section')),
        );

        $this->assertSame(['hero-title', 'catalogo-title', 'trust-title', 'contatti-title'], $sections);
    }

    #[Test]
    public function the_trust_strip_has_a_hidden_h2_and_four_items_with_decorative_icons(): void
    {
        $document = $this->document();
        $this->assertSame('sr-only', $this->one($document, 'h2#trust-title')->getAttribute('class'));
        $this->assertSame('Perché sceglierci', trim($this->one($document, 'h2#trust-title')->textContent));
        $this->assertCount(4, $document->querySelectorAll('.trust__item h3'));
        foreach ($document->querySelectorAll('.trust svg') as $svg) {
            $this->assertSame('true', $svg->getAttribute('aria-hidden'));
        }
    }

    #[Test]
    public function the_form_fields_have_labels_hints_limits_and_hidden_errors(): void
    {
        $document = $this->document();
        $form = $this->one($document, 'form.contact-form');
        $this->assertTrue($form->hasAttribute('novalidate'));
        $this->assertSame('contact-form-title', $form->getAttribute('aria-labelledby'));
        $this->assertSame('contact-form-note', $form->getAttribute('aria-describedby'));

        $nome = $this->one($document, '#contact-nome');
        $this->assertSame('80', $nome->getAttribute('maxlength'));
        $this->assertSame('name', $nome->getAttribute('autocomplete'));
        $this->assertSame('true', $nome->getAttribute('aria-required'));
        $this->assertFalse($nome->hasAttribute('aria-describedby'), 'Nome has no hint');
        $this->assertSame('Nome* (obbligatorio)', preg_replace('/\s+/', ' ', trim($this->one($document, 'label[for="contact-nome"]')->textContent)));

        $email = $this->one($document, '#contact-email');
        foreach (['type' => 'email', 'inputmode' => 'email', 'spellcheck' => 'false', 'maxlength' => '254', 'aria-describedby' => 'contact-email-hint'] as $attribute => $value) {
            $this->assertSame($value, $email->getAttribute($attribute), $attribute);
        }

        $messaggio = $this->one($document, 'textarea#contact-messaggio');
        $this->assertSame('2000', $messaggio->getAttribute('maxlength'));
        $this->assertSame('5', $messaggio->getAttribute('rows'));

        foreach (['nome', 'email', 'messaggio'] as $field) {
            $this->assertTrue($this->one($document, "#contact-{$field}-error")->hasAttribute('hidden'));
        }
        $this->assertSame('alert', $this->one($document, '.form-alert[hidden]')->getAttribute('role'));
        $this->assertSame('-1', $this->one($document, '.form-success[hidden][role="status"] h3')->getAttribute('tabindex'));
    }

    #[Test]
    public function the_footer_has_three_labelled_navs_safe_social_links_and_the_current_year(): void
    {
        $document = $this->document();
        $footer = $this->one($document, 'footer#risorse');

        $navs = array_map(static fn ($n) => $n->getAttribute('aria-labelledby'), iterator_to_array($footer->querySelectorAll('nav')));
        $this->assertSame(['footer-Esplora', 'footer-Azienda', 'footer-Assistenza'], $navs);

        $social = iterator_to_array($footer->querySelectorAll('.social a'));
        $this->assertCount(4, $social);
        foreach ($social as $link) {
            $this->assertSame('_blank', $link->getAttribute('target'));
            $this->assertSame('noopener noreferrer', $link->getAttribute('rel'));
            $this->assertStringEndsWith('(si apre in una nuova scheda)', $link->getAttribute('aria-label'));
        }

        $this->assertStringContainsString('© '.now()->year.' Giunti Psychometrics S.r.l. — progetto dimostrativo.', $footer->textContent);
        $this->assertStringContainsString('sono fittizi', $footer->textContent);
        $this->assertSame('formazione', $this->one($document, 'footer a[data-category="formazione"]')->getAttribute('data-category'));
    }

    #[Test]
    public function pages_outside_the_demo_get_an_italian_404_that_is_not_indexed(): void
    {
        $document = $this->document('/chi-siamo', 404);

        $this->assertSame('Questa pagina non fa parte della demo', trim($this->one($document, 'h1')->textContent));
        $this->assertSame('Pagina non disponibile | Giunti Psychometrics', $document->title);
        $this->assertSame('noindex', $this->one($document, 'meta[name="robots"]')->getAttribute('content'));
        $this->assertSame(url('/'), $this->one($document, 'a.not-found__home')->getAttribute('href'));
        $this->assertNotNull($document->querySelector('footer'));
    }
}

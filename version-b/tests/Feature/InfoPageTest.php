<?php

namespace Tests\Feature;

use App\Content\ContentRepository;
use App\Support\AssetManifest;
use Dom\Element;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** Institutional pages of the footer: "Azienda", "Assistenza" and the legal links (content.json → pages). */
class InfoPageTest extends TestCase
{
    private function document(string $uri, int $status = 200): HTMLDocument
    {
        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));

        return HTMLDocument::createFromString($this->get($uri)->assertStatus($status)->getContent(), LIBXML_NOERROR);
    }

    private function one(HTMLDocument|Element $root, string $selector): Element
    {
        $element = $root->querySelector($selector);
        $this->assertNotNull($element, "missing {$selector}");

        return $element;
    }

    /** @return list<string> */
    private function hrefs(HTMLDocument|Element $root, string $selector): array
    {
        return array_map(static fn ($a) => $a->getAttribute('href'), iterator_to_array($root->querySelectorAll($selector)));
    }

    #[Test]
    public function every_page_link_of_the_footer_opens_a_page_of_its_section(): void
    {
        $content = $this->app->make(ContentRepository::class);
        $sections = ['Note legali' => $content->content('footer.legal')];
        foreach ($content->content('footer.columns') as $column) {
            if (in_array($column['title'], ['Azienda', 'Assistenza'], true)) {
                $sections[$column['title']] = $column['links'];
            }
        }
        $titles = array_column($content->content('pages.list'), 'title', 'slug');

        $checked = [];
        foreach ($sections as $section => $links) {
            foreach ($links as $link) {
                if (! str_starts_with($link['href'], '/')) {
                    continue; // "Contattaci" is the contact form of the home
                }
                $document = $this->document($link['href']);
                $this->assertSame($titles[ltrim($link['href'], '/')], trim($this->one($document, 'main h1')->textContent));
                $this->assertSame($section, trim($this->one($document, '.info-page__header .eyebrow')->textContent));
                $checked[] = ltrim($link['href'], '/');
            }
        }
        // Every page is linked from the footer, and every footer page link has a page.
        $this->assertEqualsCanonicalizing(array_keys($titles), $checked);
        $this->assertCount(10, $checked);
    }

    #[Test]
    public function legal_pages_have_their_own_notice_and_navigation(): void
    {
        $document = $this->document('/termini');

        $this->assertSame('Termini di vendita | Giunti Psychometrics', $document->title);
        $this->assertStringContainsString('non ha valore legale', $this->one($document, '.info-page__notice')->textContent);
        $nav = $this->one($document, 'nav.section-nav');
        $this->assertSame('In questa sezione: Note legali', trim($this->one($nav, 'h2')->textContent));
        $this->assertSame(['/privacy', '/cookie', '/termini'], $this->hrefs($nav, 'a'));
        $this->assertSame('Termini di vendita', trim($this->one($nav, 'a[aria-current="page"]')->textContent));
    }

    #[Test]
    public function a_page_has_its_own_metadata_breadcrumb_and_demo_notice(): void
    {
        $document = $this->document('/chi-siamo');

        $this->assertSame('Chi siamo | Giunti Psychometrics', $document->title);
        $this->assertSame(url('chi-siamo'), $this->one($document, 'link[rel="canonical"]')->getAttribute('href'));
        $this->assertSame(url('chi-siamo'), $this->one($document, 'meta[property="og:url"]')->getAttribute('content'));
        $this->assertSame('Chi siamo | Giunti Psychometrics', $this->one($document, 'meta[property="og:title"]')->getAttribute('content'));
        $this->assertStringStartsWith('Giunti Psychometrics sviluppa', $this->one($document, 'meta[name="description"]')->getAttribute('content'));
        $this->assertSame('index, follow', $this->one($document, 'meta[name="robots"]')->getAttribute('content'));

        $breadcrumb = $this->one($document, 'nav[aria-label="Percorso di navigazione"]');
        $this->assertSame([url('/')], $this->hrefs($breadcrumb, 'a'));
        $this->assertSame('Chi siamo', trim($this->one($breadcrumb, '[aria-current="page"]')->textContent));
        $this->assertStringContainsString('Contenuto dimostrativo', $this->one($document, '.info-page__notice')->textContent);
        $this->assertCount(1, $document->querySelectorAll('h1'));
    }

    #[Test]
    public function the_section_navigation_marks_the_current_page(): void
    {
        $document = $this->document('/faq');
        $nav = $this->one($document, 'nav.section-nav');

        $this->assertSame('In questa sezione: Assistenza', trim($this->one($nav, 'h2')->textContent));
        $this->assertSame(['/#contatti', '/qualifiche', '/spedizioni-e-resi', '/faq'], $this->hrefs($nav, 'a'));
        $this->assertSame('Domande frequenti', trim($this->one($nav, 'a[aria-current="page"]')->textContent));
        $this->assertCount(1, $nav->querySelectorAll('[aria-current]'));
    }

    #[Test]
    public function faq_answers_use_native_details(): void
    {
        $document = $this->document('/faq');

        $this->assertCount(7, $document->querySelectorAll('details.faq__item'));
        $this->assertSame('Quali metodi di pagamento accettate?', trim($this->one($document, 'details.faq__item summary')->textContent));
    }

    #[Test]
    public function links_to_home_sections_point_to_the_home_with_the_category(): void
    {
        $document = $this->document('/qualifiche');

        $this->assertSame(['/#catalogo', '/?categoria=formazione#catalogo', '#risorse', '/#contatti'], $this->hrefs($document, '.main-nav a'));
        $this->assertSame($this->hrefs($document, '.main-nav a'), $this->hrefs($document, '.mobile-menu__nav a'));
        $this->assertContains('/?categoria=scuola-eta-evolutiva#catalogo', $this->hrefs($document, '.site-footer a'));
        $this->assertSame('/?categoria=formazione#catalogo', $this->one($document, '.cart-drawer__empty-action')->getAttribute('href'));
        $this->assertSame('/#contatti', $this->one($document, '.info-page__cta-action')->getAttribute('href'));
        // No catalogue here: the search submits to the home.
        $this->assertSame(url('/').'#catalogo', $this->one($document, 'form.site-search__form')->getAttribute('action'));
    }

    #[Test]
    public function on_the_home_the_same_links_stay_in_page_anchors(): void
    {
        $document = $this->document('/');

        $this->assertSame(['#catalogo', '#catalogo', '#risorse', '#contatti'], $this->hrefs($document, '.main-nav a'));
        $this->assertSame('#catalogo', $this->one($document, '.cart-drawer__empty-action')->getAttribute('href'));
    }

    #[Test]
    public function unknown_slugs_are_the_italian_404(): void
    {
        $document = $this->document('/pagina-inesistente', 404);

        $this->assertSame('Questa pagina non fa parte della demo', trim($this->one($document, 'h1')->textContent));
        // From the 404 too, the navigation leads back to the home sections.
        $this->assertSame('/#contatti', $this->hrefs($document, '.main-nav a')[3]);
    }
}

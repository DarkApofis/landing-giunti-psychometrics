<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use Dom\HTMLDocument;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The base layout (lang, SEO / Open Graph from content.json, skip link, main landmark, hashed assets).
 * Uses a fixture manifest so the test does not depend on a previous `npm run build`.
 */
class HomePageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));
    }

    private function document(): HTMLDocument
    {
        $response = $this->get('/');
        $response->assertOk();

        return HTMLDocument::createFromString($response->getContent(), LIBXML_NOERROR);
    }

    private function attr(HTMLDocument $document, string $selector, string $attribute): ?string
    {
        return $document->querySelector($selector)?->getAttribute($attribute);
    }

    #[Test]
    public function the_document_is_italian_with_the_site_title_and_description(): void
    {
        $document = $this->document();
        $site = json_decode((string) file_get_contents(resource_path('data/content.json')), true)['site'];

        $this->assertSame('it', $document->documentElement->getAttribute('lang'));
        $this->assertSame($site['title'], $document->title);
        $this->assertSame($site['description'], $this->attr($document, 'meta[name="description"]', 'content'));
        $this->assertSame($site['themeColor'], $this->attr($document, 'meta[name="theme-color"]', 'content'));
        $this->assertSame('width=device-width, initial-scale=1', $this->attr($document, 'meta[name="viewport"]', 'content'));
    }

    #[Test]
    public function open_graph_and_twitter_tags_come_from_content_json(): void
    {
        $document = $this->document();

        $this->assertSame('website', $this->attr($document, 'meta[property="og:type"]', 'content'));
        $this->assertSame('it_IT', $this->attr($document, 'meta[property="og:locale"]', 'content'));
        $this->assertSame('Giunti Psychometrics', $this->attr($document, 'meta[property="og:site_name"]', 'content'));
        $this->assertSame(url('/'), $this->attr($document, 'meta[property="og:url"]', 'content'));
        $this->assertSame(url('/'), $this->attr($document, 'link[rel="canonical"]', 'href'));
        $this->assertSame('summary', $this->attr($document, 'meta[name="twitter:card"]', 'content'));
    }

    #[Test]
    public function the_skip_link_is_the_first_element_of_the_body_and_targets_main(): void
    {
        $document = $this->document();
        $first = $document->body->firstElementChild;

        $this->assertSame('A', $first->tagName);
        $this->assertSame('#main', $first->getAttribute('href'));
        $this->assertSame('Vai al contenuto principale', trim($first->textContent));

        $main = $document->querySelector('main#main');
        $this->assertNotNull($main);
        $this->assertSame('-1', $main->getAttribute('tabindex'));
        $this->assertCount(1, $document->querySelectorAll('h1'));
    }

    #[Test]
    public function assets_are_the_hashed_files_with_a_single_deferred_script(): void
    {
        $document = $this->document();

        $this->assertStringEndsWith('/build/css/app-0123456789.css', $this->attr($document, 'link[rel="stylesheet"]', 'href'));

        $scripts = $document->querySelectorAll('script[src]');
        $this->assertCount(1, $scripts);
        $this->assertStringEndsWith('/build/js/app-9876543210.js', $scripts[0]->getAttribute('src'));
        $this->assertTrue($scripts[0]->hasAttribute('defer'));

        $preloads = $document->querySelectorAll('link[rel="preload"][as="font"]');
        $this->assertCount(2, $preloads);
        foreach ($preloads as $preload) {
            $this->assertTrue($preload->hasAttribute('crossorigin'));
            $this->assertSame('font/woff2', $preload->getAttribute('type'));
        }
    }

    #[Test]
    public function the_js_configuration_is_valid_json(): void
    {
        $config = json_decode($this->document()->getElementById('app-config')->textContent, true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame('main', $config['sectionIds']['main']);
    }
}

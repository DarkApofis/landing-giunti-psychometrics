<?php

namespace Tests\Feature;

use App\Support\AssetManifest;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The landing posts nothing to the server (docs/ASSUMPTIONS.md B5, B33): no session, no CSRF token,
 * no cookies on any page — including the 404.
 */
class StatelessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));
    }

    #[Test]
    public function pages_set_no_cookies(): void
    {
        foreach (['/' => 200, '/chi-siamo' => 200, '/privacy' => 200, '/pagina-inesistente' => 404] as $uri => $status) {
            $response = $this->get($uri)->assertStatus($status);
            $this->assertSame([], $response->headers->getCookies(), "{$uri} sets cookies");
        }
    }

    #[Test]
    public function the_page_has_no_csrf_token(): void
    {
        $this->get('/')->assertDontSee('csrf-token', false)->assertDontSee('_token', false);
    }
}

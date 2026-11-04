<?php

namespace Tests\Feature;

use App\Http\Controllers\Dev\StyleguideController;
use App\Support\AssetManifest;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/** The styleguide is a local-only tool: it must never be reachable in any other environment. */
class StyleguideTest extends TestCase
{
    #[Test]
    public function it_is_not_registered_outside_the_local_environment(): void
    {
        $this->assertFalse(Route::has('styleguide'));
        $this->get('/_styleguide')->assertNotFound();
    }

    #[Test]
    public function it_renders_every_button_variant_and_state_and_is_not_indexed(): void
    {
        $this->app->instance(AssetManifest::class, new AssetManifest(base_path('tests/Fixtures/rev-manifest.json')));
        Route::get('/_styleguide', StyleguideController::class);

        $response = $this->get('/_styleguide')->assertOk();

        $response->assertSee('<meta name="robots" content="noindex, nofollow">', false);
        $response->assertSee('build/css/styleguide-0123456789.css', false);
        foreach (['primary', 'secondary', 'ghost', 'on-dark', 'on-dark-outline'] as $variant) {
            $response->assertSee('btn btn--'.$variant, false);
        }
        foreach (['hover', 'active', 'focus-visible'] as $state) {
            $response->assertSee('data-force-state="'.$state.'"', false);
        }
    }
}

<?php

namespace App\Providers;

use App\Content\ContentRepository;
use App\Support\AssetManifest;
use App\Support\Icons;
use App\View\Composers\AppComposer;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            ContentRepository::class,
            static fn (): ContentRepository => new ContentRepository(resource_path('data')),
        );

        // One instance per request: the JS configuration is built once even though several views use it.
        $this->app->singleton(AppComposer::class);

        $this->app->singleton(
            Icons::class,
            static fn (): Icons => new Icons(resource_path('svg/lucide')),
        );

        $this->app->singleton(
            AssetManifest::class,
            static fn (): AssetManifest => new AssetManifest(public_path('build/rev-manifest.json')),
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // @asset('css/app.css') → URL of the hashed file written by Gulp.
        Blade::directive(
            'asset',
            static fn (string $expression): string => '<?php echo e(app('.AssetManifest::class.'::class)->url('.$expression.')); ?>',
        );

        // Pages too: with @extends, a page's sections (and the partials they include) render before
        // the layout, so they need the shared data (section ids, navigation) themselves.
        // Laravel renders error pages through the namespaced name "errors::404".
        View::composer(['layouts.*', 'pages.*', 'dev.*', 'errors.*', 'errors::*'], AppComposer::class);
    }
}

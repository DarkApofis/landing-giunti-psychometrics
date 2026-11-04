<?php

namespace App\Providers;

use App\Content\ContentRepository;
use App\Support\AssetManifest;
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

        View::composer('layouts.app', AppComposer::class);
    }
}

<?php

namespace App\Http\Controllers\Dev;

use App\Content\ContentRepository;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;

/**
 * Local-only reference page (/_styleguide) to compare the base styles with docs/DESIGN-SPEC.md.
 * The route is registered only when APP_ENV=local (routes/web.php).
 */
final class StyleguideController extends Controller
{
    /** Colour tokens shown as swatches, grouped as in DESIGN-SPEC §1 (names only: values live in _tokens.styl). */
    private const SWATCHES = [
        'brand' => ['primary', 'ink', 'accent', 'canvas'],
        'derived' => [
            'primary-hover', 'primary-active', 'primary-subtle', 'accent-strong', 'accent-subtle', 'surface',
            'ink-muted', 'border', 'border-strong', 'danger', 'danger-subtle', 'success', 'success-subtle', 'backdrop',
        ],
        'alpha' => ['primary-a40', 'primary-a30', 'accent-a35', 'white-a60', 'white-a50', 'danger-a30', 'success-a30'],
        'formats' => [
            'format-cartaceo', 'format-cartaceo-subtle', 'format-digitale', 'format-digitale-subtle',
            'format-online', 'format-online-subtle', 'format-presenza', 'format-presenza-subtle',
        ],
    ];

    /** Button variants on a light background (the on-dark ones are rendered on the dark panel). */
    private const LIGHT_VARIANTS = ['primary', 'secondary', 'ghost', 'ghost btn--danger-text'];

    private const DARK_VARIANTS = ['on-dark', 'on-dark-outline'];

    public function __invoke(ContentRepository $content): View
    {
        return view('dev.styleguide', [
            'hero' => $content->content('hero'),
            'catalog' => $content->content('catalog'),
            'cart' => $content->content('cart'),
            'swatches' => self::SWATCHES,
            'lightVariants' => self::LIGHT_VARIANTS,
            'darkVariants' => self::DARK_VARIANTS,
            'states' => ['rest', 'hover', 'active', 'focus', 'disabled'],
        ]);
    }
}

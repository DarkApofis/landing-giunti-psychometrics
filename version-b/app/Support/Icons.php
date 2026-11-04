<?php

namespace App\Support;

use Illuminate\Support\HtmlString;
use InvalidArgumentException;

/**
 * Inline lucide icons (lucide-static 1.67.0, the version of lucide-react used by version-a), read
 * from resources/svg/lucide (copied there by `gulp icons`). The markup matches what lucide-react
 * renders in version-a: same attributes and paths, decorative (aria-hidden) by default.
 */
final class Icons
{
    /** @var array<string, string> name → inner SVG markup */
    private array $cache = [];

    public function __construct(private readonly string $directory) {}

    /**
     * @param  int  $size  rendered width and height in px (version-a: size-4 = 16, size-5 = 20, size-6 = 24…)
     * @param  float|null  $strokeWidth  overrides lucide's default stroke width of 2
     */
    public function svg(string $name, int $size = 24, ?string $class = null, ?float $strokeWidth = null): HtmlString
    {
        $attributes = [
            'xmlns' => 'http://www.w3.org/2000/svg',
            'width' => (string) $size,
            'height' => (string) $size,
            'viewBox' => '0 0 24 24',
            'fill' => 'none',
            'stroke' => 'currentColor',
            'stroke-width' => $strokeWidth === null ? '2' : rtrim(rtrim(number_format($strokeWidth, 2, '.', ''), '0'), '.'),
            'stroke-linecap' => 'round',
            'stroke-linejoin' => 'round',
            'class' => trim("icon icon--{$name} {$class}"),
            'aria-hidden' => 'true',
            'focusable' => 'false',
        ];

        $html = '<svg';
        foreach ($attributes as $key => $value) {
            $html .= ' '.$key.'="'.e($value).'"';
        }

        return new HtmlString($html.'>'.$this->inner($name).'</svg>');
    }

    private function inner(string $name): string
    {
        if (isset($this->cache[$name])) {
            return $this->cache[$name];
        }

        if (preg_match('/^[a-z0-9-]+$/', $name) !== 1) {
            throw new InvalidArgumentException("Invalid icon name [{$name}].");
        }

        $path = $this->directory.DIRECTORY_SEPARATOR.$name.'.svg';
        if (! is_file($path)) {
            throw new InvalidArgumentException("Unknown icon [{$name}]: add it to ICONS in gulpfile.mjs and run `npx gulp icons`.");
        }

        // Keep only the children of <svg>, without the license comment or whitespace between tags.
        $source = (string) file_get_contents($path);
        $start = strpos($source, '>', (int) strpos($source, '<svg')) + 1;
        $inner = substr($source, $start, (int) strrpos($source, '</svg>') - $start);

        return $this->cache[$name] = trim((string) preg_replace('/>\s+</', '><', $inner));
    }
}

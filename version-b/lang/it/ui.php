<?php

/*
 * Italian UI copy that is NOT in resources/data/content.json (docs/ASSUMPTIONS.md B4): the strings
 * version-a keeps inside its components. Placeholders use Laravel's :name syntax.
 * Every entry is copied verbatim from the version-a file named in its comment.
 */

return [
    'meta' => [
        // src/app/layout.tsx → metadata.keywords
        'keywords' => [
            'test psicologici',
            'valutazione neuropsicologica',
            'età evolutiva',
            'formazione psicologi',
            'corsi ECM',
            'psicometria',
        ],
    ],

    // src/components/layout/SkipLink.tsx
    'skip_link' => 'Vai al contenuto principale',

    // src/components/layout/MainNav.tsx, MobileMenu.tsx
    'nav' => [
        'label' => 'Navigazione principale',
    ],

    // src/components/layout/SearchBox.tsx
    'search' => [
        'label' => 'Cerca nel catalogo',
        'placeholder' => 'Cerca test o corsi…',
        'clear' => 'Cancella la ricerca',
    ],

    // src/components/layout/Header.tsx, MobileMenu.tsx ("Accedi" is visual only: ASSUMPTIONS A8)
    'login' => 'Accedi',

    // src/components/layout/MobileMenu.tsx
    'menu' => [
        'open' => 'Apri il menu',
        'close' => 'Chiudi il menu',
    ],

    // src/components/layout/CartButton.tsx and src/lib/cart.ts → cartCountLabel()
    'cart_button' => [
        'empty' => 'Apri il carrello, nessun articolo',
        'with_items' => 'Apri il carrello, :count',
    ],
    'cart_count' => [
        'none' => 'Nessun articolo nel carrello',
        'one' => '1 articolo nel carrello',
        'many' => ':count articoli nel carrello',
    ],

    // src/components/sections/HeroIllustration.tsx (decorative SVG, aria-hidden)
    'hero_illustration' => [
        'percentile_label' => 'Percentile',
        'percentile_value' => '84°',
        'report_ready' => 'Report pronto',
    ],
];

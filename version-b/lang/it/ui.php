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

    // src/lib/catalog.ts → resultsLabel(); src/components/sections/CategoryFilter.tsx, EmptyState.tsx
    'catalog' => [
        'results' => [
            'none' => 'Nessun prodotto trovato',
            'one' => '1 prodotto trovato',
            'many' => ':count prodotti trovati',
        ],
        'pill_label' => ':label :count prodotti',
        'empty_context' => [
            'lead' => 'Nessun risultato',
            'query' => 'per «:query»',
            'category' => 'in :category',
        ],
    ],

    // src/components/sections/ProductCard.tsx, src/components/ui/Price.tsx, FormatBadge.tsx, AddToCartButton.tsx
    'product' => [
        'format' => 'Formato:',
        'meta' => [
            'author' => 'Autore',
            'age' => 'Età',
            'qualification' => 'Qualifica',
            'duration' => 'Durata',
            'instructor' => 'Docente',
            'start' => 'Inizio',
            'location' => 'Sede',
        ],
        'minutes' => ':count min',
        'hours' => ':count ore',
        'ecm' => ':count crediti ECM',
        'online' => 'Online',
        'vat' => 'IVA inclusa',
        'price' => 'Prezzo:',
        'price_discounted' => 'Prezzo scontato:',
        'price_original' => ', prezzo originale:',
        'saving' => ', risparmi il :percent%',
        'details' => 'Scopri di più',
        'add' => 'Aggiungi al carrello',
        'added' => 'Aggiunto al carrello',
        // aria-label = visible text + ": " + product name (label-in-name, unique per card)
        'action_label' => ':action: :name',
    ],

    // src/components/sections/HeroIllustration.tsx (decorative SVG, aria-hidden)
    'hero_illustration' => [
        'percentile_label' => 'Percentile',
        'percentile_value' => '84°',
        'report_ready' => 'Report pronto',
    ],
];

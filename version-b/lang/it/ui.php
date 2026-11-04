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

    // src/components/sections/ProductDialog.tsx
    'dialog' => [
        'close' => 'Chiudi',
        'administration' => 'Somministrazione',
        'administration_value' => 'circa :count minuti',
        'format' => 'Formato',
        'vat_note' => 'IVA inclusa · acquisto previa verifica della qualifica',
        'request' => 'Richiedi informazioni',
    ],

    // src/components/layout/CartDrawer.tsx, src/components/ui/QuantityStepper.tsx, AddToCartButton.tsx
    // (the rest of the cart copy is in content.json → cart)
    'cart' => [
        'added' => ':name aggiunto al carrello',
        'removed' => ':name rimosso dal carrello',
        'remove' => 'Rimuovi :name dal carrello',
        'remove_visible' => 'Rimuovi',
        'stepper' => 'Quantità di :name',
        'decrease' => 'Diminuisci la quantità di :name',
        'increase' => 'Aumenta la quantità di :name',
        'quantity' => 'Quantità: :count',
        'unit_sr' => 'cad.',
        'unit_visible' => '/ cad.',
        'line_total' => 'Totale riga:',
    ],

    // src/lib/validators.ts (messages of HANDOFF §6.2), src/components/ui/FormField.tsx, ContactForm.tsx,
    // src/data/contact.ts (errorSummary / success.body are functions there: here they are templates)
    'contact' => [
        'required_sr' => '(obbligatorio)',
        'error_summary' => [
            'one' => 'Il modulo contiene 1 errore: correggi il campo evidenziato.',
            'many' => 'Il modulo contiene :count errori: correggi i campi evidenziati.',
        ],
        'success_body' => ':name, ti risponderemo al più presto. Nel frattempo puoi continuare a esplorare il catalogo.',
        'validation' => [
            'nome' => [
                'required' => 'Inserisci il tuo nome.',
                'min' => 'Il nome deve contenere almeno :min caratteri.',
                'max' => 'Il nome può contenere al massimo :max caratteri.',
            ],
            'email' => [
                'required' => 'Inserisci il tuo indirizzo email.',
                'invalid' => 'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.',
            ],
            'messaggio' => [
                'required' => 'Scrivi il tuo messaggio.',
                'min' => 'Il messaggio deve contenere almeno :min caratteri (:missing).',
                'missing_one' => 'ne manca 1',
                'missing_many' => 'ne mancano :count',
                'max' => 'Il messaggio può contenere al massimo :max caratteri.',
            ],
        ],
    ],

    // src/components/sections/TrustStrip.tsx
    'trust_title' => 'Perché sceglierci',

    // src/components/layout/Footer.tsx
    'footer' => [
        'social_label' => 'Social network',
        'social_link' => ':site su :network (si apre in una nuova scheda)',
        'legal_label' => 'Note legali',
        'copyright' => '© :year :legal — progetto dimostrativo.',
    ],

    // src/app/not-found.tsx
    'not_found' => [
        'title' => 'Pagina non disponibile',
        'eyebrow' => 'Errore 404',
        'heading' => 'Questa pagina non fa parte della demo',
        'text' => 'Il sito è una landing dimostrativa: le pagine istituzionali non sono state realizzate.',
        'home' => 'Torna alla home',
    ],

    // src/components/sections/HeroIllustration.tsx (decorative SVG, aria-hidden)
    'hero_illustration' => [
        'percentile_label' => 'Percentile',
        'percentile_value' => '84°',
        'report_ready' => 'Report pronto',
    ],
];

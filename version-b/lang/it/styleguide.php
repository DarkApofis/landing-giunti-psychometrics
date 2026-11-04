<?php

/*
 * Labels of the local-only styleguide (/_styleguide). Not part of the public site.
 */

return [
    'title' => 'Guida di stile — solo ambiente locale',
    'intro' => 'Pagina di confronto con docs/DESIGN-SPEC.md §1–§6.1: tipografia, colori e pulsanti in tutti gli stati. Non è raggiungibile in produzione.',

    'typography' => 'Tipografia',
    'colors' => 'Colori',
    'buttons' => 'Pulsanti',
    'on_dark' => 'Su sfondo scuro',
    'sizes' => 'Dimensioni e larghezza',

    'specimens' => [
        'display' => 'Display (h1 hero)',
        'h2' => 'Titolo di sezione (h2)',
        'eyebrow' => 'Eyebrow',
        'eyebrow_muted' => 'Eyebrow --muted',
        'eyebrow_on_dark' => 'Eyebrow --on-dark',
        'lead' => 'Lead',
        'lead_on_dark' => 'Lead --on-dark',
        'body' => 'Corpo 16 / 25,6',
    ],

    'groups' => [
        'brand' => 'Marca',
        'derived' => 'Derivati',
        'alpha' => 'Opacità',
        'formats' => 'Badge di formato',
    ],

    'states' => [
        'variant' => 'Variante',
        'rest' => 'Riposo',
        'hover' => 'Hover',
        'active' => 'Attivo',
        'focus' => 'Focus',
        'disabled' => 'Disabilitato',
    ],

    'states_note' => 'Gli stati hover, attivo e focus sono forzati dallo script di verifica (Chrome DevTools Protocol); a riposo la pagina li mostra tutti identici.',
];

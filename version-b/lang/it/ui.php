<?php

/*
 * Italian UI copy that is NOT in resources/data/content.json (docs/ASSUMPTIONS.md B4): the strings
 * version-a keeps inside its components. Placeholders use Laravel's :name syntax.
 * Every entry is copied verbatim from version-a; tests/Unit/UiStringsTest.php pins the exact texts.
 */

return [
    'meta' => [
        // version-a/src/app/layout.tsx → metadata.keywords
        'keywords' => [
            'test psicologici',
            'valutazione neuropsicologica',
            'età evolutiva',
            'formazione psicologi',
            'corsi ECM',
            'psicometria',
        ],
    ],

    // version-a/src/components/layout/SkipLink.tsx
    'skip_link' => 'Vai al contenuto principale',
];

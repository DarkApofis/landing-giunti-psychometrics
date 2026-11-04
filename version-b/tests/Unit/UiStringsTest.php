<?php

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Pins the texts of lang/it/ui.php that the JS uses to the exact strings of docs/HANDOFF-LARAVEL.md §6
 * (and of version-a), so a typo in the language file cannot slip through (docs/ASSUMPTIONS.md B4).
 */
class UiStringsTest extends TestCase
{
    #[Test]
    public function contact_validation_messages_render_exactly_as_in_handoff_6_2(): void
    {
        $limits = ['min' => 2, 'max' => 80];

        $this->assertSame('Inserisci il tuo nome.', __('ui.contact.validation.nome.required'));
        $this->assertSame('Il nome deve contenere almeno 2 caratteri.', __('ui.contact.validation.nome.min', ['min' => 2]));
        $this->assertSame('Il nome può contenere al massimo 80 caratteri.', __('ui.contact.validation.nome.max', $limits));
        $this->assertSame('Inserisci il tuo indirizzo email.', __('ui.contact.validation.email.required'));
        $this->assertSame('Inserisci un indirizzo email valido, ad esempio nome@dominio.it.', __('ui.contact.validation.email.invalid'));
        $this->assertSame('Scrivi il tuo messaggio.', __('ui.contact.validation.messaggio.required'));
        $this->assertSame(
            'Il messaggio deve contenere almeno 10 caratteri (ne manca 1).',
            __('ui.contact.validation.messaggio.min', ['min' => 10, 'missing' => __('ui.contact.validation.messaggio.missing_one')]),
        );
        $this->assertSame(
            'Il messaggio deve contenere almeno 10 caratteri (ne mancano 5).',
            __('ui.contact.validation.messaggio.min', ['min' => 10, 'missing' => __('ui.contact.validation.messaggio.missing_many', ['count' => 5])]),
        );
        $this->assertSame('Il messaggio può contenere al massimo 2000 caratteri.', __('ui.contact.validation.messaggio.max', ['max' => 2000]));
    }

    #[Test]
    public function form_summary_and_success_texts_match_version_a(): void
    {
        $this->assertSame('Il modulo contiene 1 errore: correggi il campo evidenziato.', __('ui.contact.error_summary.one'));
        $this->assertSame('Il modulo contiene 3 errori: correggi i campi evidenziati.', __('ui.contact.error_summary.many', ['count' => 3]));
        $this->assertSame(
            'Giulia, ti risponderemo al più presto. Nel frattempo puoi continuare a esplorare il catalogo.',
            __('ui.contact.success_body', ['name' => 'Giulia']),
        );
    }

    #[Test]
    public function cart_and_catalogue_texts_match_handoff_6(): void
    {
        $this->assertSame('3 articoli nel carrello', __('ui.cart_count.many', ['count' => 3]));
        $this->assertSame('Apri il carrello, nessun articolo', __('ui.cart_button.empty'));
        $this->assertSame('Corso X aggiunto al carrello', __('ui.cart.added', ['name' => 'Corso X']));
        $this->assertSame('Corso X rimosso dal carrello', __('ui.cart.removed', ['name' => 'Corso X']));
        $this->assertSame('8 prodotti trovati', __('ui.catalog.results.many', ['count' => 8]));
        $this->assertSame('Formazione 4 prodotti', __('ui.catalog.pill_label', ['label' => 'Formazione', 'count' => 4]));
    }
}

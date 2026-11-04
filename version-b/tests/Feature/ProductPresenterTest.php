<?php

namespace Tests\Feature;

use App\Content\ContentRepository;
use App\Content\ProductPresenter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProductPresenterTest extends TestCase
{
    private function present(string $id): array
    {
        $content = $this->app->make(ContentRepository::class);

        return $this->app->make(ProductPresenter::class)->present($content->product($id));
    }

    #[Test]
    public function a_test_has_author_age_qualification_and_duration(): void
    {
        $neura = $this->present('neura-q');

        $this->assertSame('Clinica e Neuropsicologia', $neura['categoryLabel']);
        $this->assertSame(['label' => 'Cartaceo', 'modifier' => 'cartaceo', 'icon' => 'book-open'], $neura['format']);
        $this->assertSame([
            ['label' => 'Autore', 'value' => 'Laura Bettini'],
            ['label' => 'Età', 'value' => "18\u{2013}90 anni"],
            ['label' => 'Qualifica', 'value' => 'C'],
            ['label' => 'Durata', 'value' => '75 min'],
        ], $neura['meta']);
        $this->assertSame(['final' => "1.062,50\u{00A0}€", 'original' => "1.250,00\u{00A0}€", 'percent' => 15], $neura['price']);
        $this->assertSame('Scopri di più: NEURA-Q — Batteria di valutazione neurocognitiva', $neura['action']['ariaLabel']);
    }

    #[Test]
    public function a_course_has_instructor_start_date_duration_with_ecm_and_location(): void
    {
        $course = $this->present('corso-valutazione-adulto');

        $this->assertSame(['label' => 'Corso online', 'modifier' => 'online', 'icon' => 'circle-play'], $course['format']);
        $this->assertSame([
            ['label' => 'Docente', 'value' => 'Chiara Benedetti'],
            ['label' => 'Inizio', 'value' => '19 gennaio 2027', 'datetime' => '2027-01-19'],
            ['label' => 'Durata', 'value' => '24 ore · 24 crediti ECM'],
            ['label' => 'Sede', 'value' => 'Online'],
        ], $course['meta']);
        $this->assertStringStartsWith('Aggiungi al carrello: ', $course['action']['ariaLabel']);
    }

    #[Test]
    public function a_product_without_discount_has_a_single_price(): void
    {
        $this->assertSame(['final' => "180,00\u{00A0}€", 'original' => null, 'percent' => null], $this->present('ansia-d')['price']);
    }

    #[Test]
    public function every_product_maps_to_a_known_format_and_category(): void
    {
        foreach ($this->app->make(ProductPresenter::class)->all() as $product) {
            $this->assertNotSame('', $product['categoryLabel'], $product['id']);
            $this->assertContains($product['format']['modifier'], ['cartaceo', 'digitale', 'online', 'presenza']);
        }
    }
}

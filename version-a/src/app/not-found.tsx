import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Pagina non disponibile',
  robots: { index: false },
};

/**
 * Footer links point to pages outside this landing (Chi siamo, Privacy…). Instead of a bare 404,
 * explain that they are not part of the demo and offer a way back.
 */
export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-accent-strong uppercase">
        Errore 404
      </p>
      <h1 className="mt-3 text-h2 font-bold text-ink">Questa pagina non fa parte della demo</h1>
      <p className="mx-auto mt-3 max-w-xl text-lg text-ink-muted">
        Il sito è una landing dimostrativa: le pagine istituzionali non sono state realizzate.
      </p>
      <Button href="/" className="mt-8">
        Torna alla home
      </Button>
    </section>
  );
}

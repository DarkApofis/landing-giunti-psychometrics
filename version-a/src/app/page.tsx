// Temporary placeholder: verifies tokens and typography until the sections are built (PLAN phase 5).
export default function Home() {
  return (
    <main id="main" className="container-page py-16">
      <p className="font-display text-eyebrow font-semibold tracking-(--text-eyebrow--letter-spacing) text-ink-muted uppercase">
        Catalogo 2026/27
      </p>
      <h1 className="mt-2 text-display font-bold">Giunti Psychometrics</h1>
      <p className="mt-4 max-w-prose text-lg">
        Test psicologici e formazione per professionisti. Sito in costruzione.
      </p>
      <a
        href="#main"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-display font-semibold text-white hover:bg-primary-hover"
      >
        Esplora il catalogo
      </a>
    </main>
  );
}

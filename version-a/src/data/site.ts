/** Site-wide constants (SEO, branding). All user-facing copy is Italian. */
export const site = {
  name: 'Giunti Psychometrics',
  legalName: 'Giunti Psychometrics S.r.l.',
  title: 'Giunti Psychometrics — Test psicologici e formazione per professionisti',
  description:
    'Catalogo di test psicologici, strumenti di valutazione e corsi di formazione per psicologi, neuropsichiatri, insegnanti e professionisti delle risorse umane.',
  locale: 'it_IT',
  /**
   * Static on purpose: the page is prerendered, and with Cache Components reading the
   * current time (`new Date()`) in a Server Component would make it dynamic.
   */
  copyrightYear: 2026,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  /** Mirrors --color-primary in src/styles/tokens.css (metadata API needs a literal value). */
  themeColor: '#1b4f8a',
} as const;

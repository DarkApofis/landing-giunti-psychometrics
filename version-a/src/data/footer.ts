import type { CategoryFilter } from '@/types/product';
import { SECTION_IDS } from './navigation';

export interface FooterLink {
  label: string;
  href: string;
  /** Catalogue category applied when the link is followed. */
  category?: CategoryFilter;
}

export interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

const catalog = `#${SECTION_IDS.catalog}`;
const contact = `#${SECTION_IDS.contact}`;

/**
 * Links to pages outside this landing (e.g. /chi-siamo) are intentional: they show the
 * information architecture and land on an Italian "not part of the demo" page (app/not-found.tsx).
 */
export const footerColumns: readonly FooterColumn[] = [
  {
    title: 'Esplora',
    links: [
      { label: 'Tutti i test', href: catalog, category: 'tutti' },
      { label: 'Clinica e Neuropsicologia', href: catalog, category: 'clinica-neuropsicologia' },
      { label: 'Scuola ed Età evolutiva', href: catalog, category: 'scuola-eta-evolutiva' },
      { label: 'Lavoro e Organizzazioni', href: catalog, category: 'lavoro-organizzazioni' },
      { label: 'Formazione', href: catalog, category: 'formazione' },
    ],
  },
  {
    title: 'Azienda',
    links: [
      { label: 'Chi siamo', href: '/chi-siamo' },
      { label: 'Comitato scientifico', href: '/comitato-scientifico' },
      { label: 'Lavora con noi', href: '/lavora-con-noi' },
      { label: 'Area stampa', href: '/area-stampa' },
    ],
  },
  {
    title: 'Assistenza',
    links: [
      { label: 'Contattaci', href: contact },
      { label: 'Qualifiche per l’acquisto', href: '/qualifiche' },
      { label: 'Spedizioni e resi', href: '/spedizioni-e-resi' },
      { label: 'Domande frequenti', href: '/faq' },
    ],
  },
];

export const legalLinks: readonly FooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookie', href: '/cookie' },
  { label: 'Termini di vendita', href: '/termini' },
];

export type SocialNetwork = 'linkedin' | 'instagram' | 'youtube' | 'facebook';

/** Placeholder profiles: the networks' home pages, not real company accounts. */
export const socialLinks: ReadonlyArray<{ network: SocialNetwork; label: string; href: string }> = [
  { network: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { network: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
  { network: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/' },
  { network: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/' },
];

export const footerCopy = {
  tagline:
    'Strumenti di valutazione psicologica e formazione per professionisti della salute, della scuola e delle organizzazioni.',
  disclaimer:
    'Sito dimostrativo realizzato per una prova tecnica: prodotti, persone, prezzi e contatti sono fittizi.',
  backToTop: 'Torna su',
} as const;

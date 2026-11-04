import type { Category } from '@/types/product';

/** Display order of the category pills (after "Tutti"). */
export const categories: readonly Category[] = [
  { id: 'clinica-neuropsicologia', label: 'Clinica e Neuropsicologia' },
  { id: 'scuola-eta-evolutiva', label: 'Scuola ed Età evolutiva' },
  { id: 'lavoro-organizzazioni', label: 'Lavoro e Organizzazioni' },
  { id: 'formazione', label: 'Formazione' },
];

export const ALL_CATEGORIES_LABEL = 'Tutti';

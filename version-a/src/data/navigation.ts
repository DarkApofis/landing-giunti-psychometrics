import type { CategoryFilter } from '@/types/product';

/** Section anchors shared by the header, hero and footer. */
export const SECTION_IDS = {
  main: 'main',
  catalog: 'catalogo',
  contact: 'contatti',
  resources: 'risorse',
} as const;

export interface NavItem {
  label: string;
  href: `#${string}`;
  /** Catalogue category applied when the link is followed (see ASSUMPTIONS A2). */
  category?: CategoryFilter;
}

/**
 * Main navigation. "Test" shows the whole catalogue (tests span three categories),
 * "Formazione" pre-filters the courses.
 */
export const mainNav: readonly NavItem[] = [
  { label: 'Test', href: `#${SECTION_IDS.catalog}`, category: 'tutti' },
  { label: 'Formazione', href: `#${SECTION_IDS.catalog}`, category: 'formazione' },
  { label: 'Risorse', href: `#${SECTION_IDS.resources}` },
  { label: 'Contatti', href: `#${SECTION_IDS.contact}` },
];

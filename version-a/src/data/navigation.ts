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
}

/**
 * Main navigation. "Test" and "Formazione" both land on the catalogue
 * (the category pre-filter is wired in the catalogue task — see ASSUMPTIONS A2).
 */
export const mainNav: readonly NavItem[] = [
  { label: 'Test', href: `#${SECTION_IDS.catalog}` },
  { label: 'Formazione', href: `#${SECTION_IDS.catalog}` },
  { label: 'Risorse', href: `#${SECTION_IDS.resources}` },
  { label: 'Contatti', href: `#${SECTION_IDS.contact}` },
];

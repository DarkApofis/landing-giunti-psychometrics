/** Trust strip (original copy, fictional policies). Icons are mapped in the component. */
export const trustItems = [
  {
    id: 'spedizione',
    title: 'Spedizione gratuita',
    text: 'Sul materiale cartaceo per ordini superiori a 100 €.',
  },
  {
    id: 'pagamenti',
    title: 'Pagamenti sicuri',
    text: 'Carta, bonifico o PayPal con transazioni protette.',
  },
  {
    id: 'validati',
    title: 'Test validati',
    text: 'Norme italiane aggiornate e manuali completi.',
  },
  {
    id: 'assistenza',
    title: 'Centro assistenza',
    text: 'Supporto tecnico e scientifico dal lunedì al venerdì.',
  },
] as const;

export type TrustItemId = (typeof trustItems)[number]['id'];

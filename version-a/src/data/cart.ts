/** Cart copy (Italian). */
export const cartCopy = {
  title: 'Il tuo carrello',
  close: 'Chiudi il carrello',
  listLabel: 'Articoli nel carrello',
  subtotal: 'Subtotale',
  savings: 'Risparmi',
  vat: 'IVA inclusa. Le iscrizioni ai corsi sono nominative: i dati dei partecipanti si inseriscono al checkout.',
  checkout: 'Procedi all’ordine',
  demoNote: 'Demo: l’ordine non viene inviato.',
  clear: 'Svuota il carrello',
  cleared: 'Carrello svuotato',
  remove: (name: string) => `Rimuovi ${name} dal carrello`,
  removed: (name: string) => `${name} rimosso dal carrello`,
  empty: {
    title: 'Il carrello è vuoto',
    text: 'Aggiungi un corso di formazione dal catalogo per iscriverti.',
    action: 'Scopri i corsi',
  },
} as const;

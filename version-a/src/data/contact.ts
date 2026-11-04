/** Contact section copy and fictional contact details (no real data). */
export const contactCopy = {
  eyebrow: 'Contatti',
  title: 'Hai bisogno di aiuto nella scelta?',
  intro:
    'Scrivici per informazioni su strumenti, qualifiche richieste o corsi in calendario: il nostro team scientifico ti risponde entro due giorni lavorativi.',
  formTitle: 'Scrivici un messaggio',
  requiredNote: 'I campi contrassegnati con * sono obbligatori.',
  fields: {
    nome: { label: 'Nome', autoComplete: 'name' },
    email: {
      label: 'Email',
      hint: 'Ti risponderemo a questo indirizzo.',
      autoComplete: 'email',
    },
    messaggio: { label: 'Messaggio', hint: 'Almeno 10 caratteri.' },
  },
  submit: 'Invia messaggio',
  submitting: 'Invio in corso…',
  errorSummary: (count: number) =>
    count === 1
      ? 'Il modulo contiene 1 errore: correggi il campo evidenziato.'
      : `Il modulo contiene ${count} errori: correggi i campi evidenziati.`,
  success: {
    title: 'Grazie! Il tuo messaggio è stato inviato.',
    body: (name: string) =>
      `${name}, ti risponderemo al più presto. Nel frattempo puoi continuare a esplorare il catalogo.`,
    again: 'Invia un altro messaggio',
  },
  /** Simulated network latency (no backend). */
  submitDelayMs: 900,
} as const;

/** Fictional channels — example domain and a non-assigned number pattern. */
export const contactChannels = [
  {
    kind: 'email',
    label: 'Email',
    value: 'assistenza@example.com',
    href: 'mailto:assistenza@example.com',
  },
  { kind: 'phone', label: 'Telefono', value: '+39 000 000 0000', href: 'tel:+390000000000' },
  { kind: 'hours', label: 'Orari', value: 'Lun–Ven, 9:00–17:00', href: null },
] as const;

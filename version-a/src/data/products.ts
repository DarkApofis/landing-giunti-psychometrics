/**
 * Fictional catalogue. All names, acronyms, authors and instructors are invented;
 * no real test (or protected material) is referenced. See src/data/products.test.ts.
 * Photos: Unsplash (credits in docs/CREDITS.md).
 */
import { unsplashUrl } from '@/lib/unsplash';
import type { Product } from '@/types/product';

export const products: readonly Product[] = [
  // ── Clinica e Neuropsicologia ────────────────────────────────────────────
  {
    id: 'neura-q',
    slug: 'neura-q-batteria-valutazione-neurocognitiva',
    type: 'test',
    name: 'NEURA-Q — Batteria di valutazione neurocognitiva',
    description:
      'Profilo completo di memoria, attenzione, linguaggio e funzioni esecutive in un’unica batteria.',
    category: 'clinica-neuropsicologia',
    format: 'Cartaceo',
    author: 'Laura Bettini',
    ageRange: { min: 18, max: 90, unit: 'anni' },
    qualification: 'C',
    administrationMinutes: 75,
    originalPrice: 1250,
    discountPrice: 1062.5,
    image: {
      src: unsplashUrl('1559757148-5c350d0d3c56'),
      alt: 'Modello anatomico di un cervello umano sezionato, con gli emisferi colorati',
    },
  },
  {
    id: 'memoria-s',
    slug: 'memoria-s-scala-breve-memoria-episodica',
    type: 'test',
    name: 'MEMORIA-S — Scala breve di memoria episodica',
    description:
      'Screening rapido della memoria verbale e visiva con norme per fasce d’età e scolarità.',
    category: 'clinica-neuropsicologia',
    format: 'Digitale',
    author: 'Marco Ferrante',
    ageRange: { min: 16, max: 85, unit: 'anni' },
    qualification: 'B',
    administrationMinutes: 20,
    originalPrice: 340,
    discountPrice: 289,
    image: {
      src: unsplashUrl('1434030216411-0b793f4b4173'),
      alt: 'Persona che scrive a penna su un foglio, con una tazza appoggiata sul tavolo',
    },
  },
  {
    id: 'ansia-d',
    slug: 'ansia-d-questionario-ansia-umore',
    type: 'test',
    name: 'ANSIA-D — Questionario multidimensionale di ansia e umore',
    description: 'Valuta sintomi ansiosi e depressivi con scale di validità e report automatico.',
    category: 'clinica-neuropsicologia',
    format: 'Digitale',
    author: 'Giulia Sartori',
    ageRange: { min: 14, max: null, unit: 'anni' },
    qualification: 'B',
    administrationMinutes: 15,
    originalPrice: 180,
    discountPrice: null,
    image: {
      src: unsplashUrl('1544027993-37dbfe43562a'),
      alt: 'Due mani che si tendono l’una verso l’altra tra due pareti grigie',
    },
  },

  // ── Scuola ed Età evolutiva ──────────────────────────────────────────────
  {
    id: 'attentio-r',
    slug: 'attentio-r-attenzione-controllo-esecutivo',
    type: 'test',
    name: 'ATTENTIO-R — Attenzione e controllo esecutivo in età scolare',
    description:
      'Prove di attenzione selettiva, sostenuta e di inibizione con profili per classe frequentata.',
    category: 'scuola-eta-evolutiva',
    format: 'Cartaceo',
    author: 'Paolo Lanzi',
    ageRange: { min: 6, max: 14, unit: 'anni' },
    qualification: 'B',
    administrationMinutes: 40,
    originalPrice: 420,
    discountPrice: 357,
    image: {
      src: unsplashUrl('1588072432836-e10032774350'),
      alt: 'Bambini seduti attorno a un tavolo in aula mentre disegnano e scrivono',
    },
  },
  {
    id: 'lexia-k',
    slug: 'lexia-k-prove-lettura-comprensione',
    type: 'test',
    name: 'LEXIA-K — Prove di lettura e comprensione',
    description:
      'Rapidità, correttezza e comprensione del testo per individuare precocemente le difficoltà.',
    category: 'scuola-eta-evolutiva',
    format: 'Cartaceo',
    author: 'Elena Vitali',
    ageRange: { min: 6, max: 11, unit: 'anni' },
    qualification: 'A',
    administrationMinutes: 30,
    originalPrice: 145,
    discountPrice: 119,
    image: {
      src: unsplashUrl('1503676260728-1c00da094a0b'),
      alt: 'Pila di libri con una mela rossa, matite colorate e cubi con le lettere A, B e C',
    },
  },
  {
    id: 'emotio-j',
    slug: 'emotio-j-competenze-socio-emotive',
    type: 'test',
    name: 'EMOTIO-J — Questionario sulle competenze socio-emotive',
    description:
      'Versioni per studente, insegnante e genitore per un quadro condiviso del benessere scolastico.',
    category: 'scuola-eta-evolutiva',
    format: 'Digitale',
    author: 'Andrea Moretti',
    ageRange: { min: 8, max: 17, unit: 'anni' },
    qualification: 'B',
    administrationMinutes: 25,
    originalPrice: 210,
    discountPrice: null,
    image: {
      src: unsplashUrl('1577896851231-70ef18881754'),
      alt: 'Insegnante alla lavagna davanti a una classe di bambini con la mano alzata',
    },
  },

  // ── Lavoro e Organizzazioni ──────────────────────────────────────────────
  {
    id: 'talenta-w',
    slug: 'talenta-w-inventario-personalita-selezione',
    type: 'test',
    name: 'TALENTA-W — Inventario di personalità per la selezione',
    description:
      'Stili di lavoro, motivazione e competenze trasversali con report pronto per il colloquio.',
    category: 'lavoro-organizzazioni',
    format: 'Digitale',
    author: 'Silvia Gallo',
    ageRange: { min: 18, max: null, unit: 'anni' },
    qualification: 'B',
    administrationMinutes: 35,
    originalPrice: 690,
    discountPrice: 552,
    image: {
      src: unsplashUrl('1551836022-d5d88e9218df'),
      alt: 'Due donne a colloquio sedute a un tavolo con un computer portatile aperto',
    },
  },
  {
    id: 'leader-360',
    slug: 'leader-360-feedback-multi-valutatore',
    type: 'test',
    name: 'LEADER-360 — Feedback multi-valutatore sulla leadership',
    description:
      'Raccoglie le valutazioni di responsabili, colleghi e collaboratori in un unico profilo.',
    category: 'lavoro-organizzazioni',
    format: 'Digitale',
    author: 'Francesca Riva',
    ageRange: { min: 18, max: null, unit: 'anni' },
    qualification: 'A',
    administrationMinutes: 30,
    originalPrice: 2450,
    discountPrice: 1960,
    image: {
      src: unsplashUrl('1552664730-d307ca884978'),
      alt: 'Gruppo di lavoro in riunione davanti a una parete coperta di foglietti adesivi',
    },
  },

  // ── Formazione ───────────────────────────────────────────────────────────
  {
    id: 'corso-valutazione-adulto',
    slug: 'valutazione-neuropsicologica-adulto',
    type: 'corso',
    name: 'Valutazione neuropsicologica dell’adulto: dalla teoria alla pratica',
    description:
      'Casi clinici, scelta degli strumenti e stesura della relazione in sei incontri live.',
    category: 'formazione',
    format: 'Corso online',
    instructor: 'Chiara Benedetti',
    startDate: '2027-01-19',
    durationHours: 24,
    ecmCredits: 24,
    location: null,
    originalPrice: 390,
    discountPrice: 312,
    image: {
      src: unsplashUrl('1588196749597-9ff075ee6b5b'),
      alt: 'Videoconferenza con molti partecipanti sullo schermo di un portatile, accanto a una tazza verde',
    },
  },
  {
    id: 'corso-attentio-r',
    slug: 'somministrare-interpretare-attentio-r',
    type: 'corso',
    name: 'Somministrare e interpretare ATTENTIO-R',
    description:
      'Workshop operativo su procedure, punteggi e restituzione dei risultati a scuola e famiglia.',
    category: 'formazione',
    format: 'Corso online',
    instructor: 'Paolo Lanzi',
    startDate: '2027-02-09',
    durationHours: 8,
    ecmCredits: 8,
    location: null,
    originalPrice: 120,
    discountPrice: null,
    image: {
      src: unsplashUrl('1501504905252-473c47e087f8'),
      alt: 'Computer portatile, quaderno aperto e tazza su una scrivania luminosa',
    },
  },
  {
    id: 'corso-assessment-hr',
    slug: 'assessment-selezione-metodi-strumenti-hr',
    type: 'corso',
    name: 'Assessment e selezione: metodi e strumenti per le HR',
    description:
      'Due giornate pratiche su colloquio strutturato, assessment center e uso etico dei test.',
    category: 'formazione',
    format: 'In presenza',
    instructor: 'Luca De Santis',
    startDate: '2027-03-13',
    durationHours: 16,
    ecmCredits: null,
    location: 'Milano',
    originalPrice: 580,
    discountPrice: 493,
    image: {
      src: unsplashUrl('1517048676732-d65bc937f952'),
      alt: 'Persone sedute attorno a un tavolo di legno durante una riunione di lavoro',
    },
  },
  {
    id: 'corso-dsa',
    slug: 'disturbi-specifici-apprendimento-valutazione-intervento',
    type: 'corso',
    name: 'Disturbi specifici dell’apprendimento: valutazione e intervento',
    description:
      'Dal sospetto diagnostico al piano didattico personalizzato, con esercitazioni in piccoli gruppi.',
    category: 'formazione',
    format: 'In presenza',
    instructor: 'Martina Colombo',
    startDate: '2027-04-10',
    durationHours: 14,
    ecmCredits: 14,
    location: 'Firenze',
    originalPrice: 450,
    discountPrice: 382.5,
    image: {
      src: unsplashUrl('1524178232363-1fb2b075b655'),
      alt: 'Aula con partecipanti seduti che seguono una lezione davanti a uno schermo',
    },
  },
];

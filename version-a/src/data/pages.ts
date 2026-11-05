import { contactChannels } from './contact';
import { footerColumns, legalLinks, type FooterLink } from './footer';
import { qualifications } from './qualifications';

/**
 * Institutional pages linked from the footer: the columns "Azienda" and "Assistenza" and the
 * legal links at the bottom ("Note legali").
 * All content is fictional (people, numbers, dates, job offers, press releases): the site is a
 * demo, and every page says so. One generic template renders them (app/(info)/info-route.tsx in
 * version-a, pages/info.blade.php in version-b), so a page is only data: a lead and a list of blocks.
 */

export type InfoSection = 'Azienda' | 'Assistenza' | 'Note legali';

export type InfoBlock =
  /** Heading + paragraphs. */
  | { kind: 'text'; heading: string; paragraphs: readonly string[] }
  /** Heading + label/value pairs (a <dl>). */
  | {
      kind: 'facts';
      heading: string;
      intro?: string;
      items: readonly { label: string; value: string }[];
    }
  /** Heading + a grid of cards (people, job offers, press releases…). */
  | {
      kind: 'cards';
      heading: string;
      intro?: string;
      items: readonly { title: string; meta?: string; text: string }[];
    }
  /** Heading + questions that expand natively (<details>). */
  | { kind: 'faq'; heading: string; items: readonly { question: string; answer: string }[] };

export interface InfoPage {
  slug: string;
  section: InfoSection;
  title: string;
  /** Meta description. */
  description: string;
  lead: string;
  /** Replaces the default demo notice (e.g. legal texts: "no legal value"). */
  notice?: string;
  blocks: readonly InfoBlock[];
}

/** Shared copy of the page template. */
export const infoPageCopy = {
  breadcrumbLabel: 'Percorso di navigazione',
  home: 'Home',
  sectionNavLabel: 'In questa sezione',
  demoNotice:
    'Contenuto dimostrativo: persone, numeri, date e offerte di questa pagina sono fittizi.',
  cta: {
    title: 'Non hai trovato quello che cercavi?',
    text: 'Scrivici: il nostro team ti risponde entro due giorni lavorativi.',
    action: 'Contattaci',
  },
} as const;

const legalNotice =
  'Contenuto dimostrativo: questo testo è fittizio, non ha valore legale e non descrive trattamenti reali.';

const email = contactChannels[0].value;
const phone = contactChannels[1].value;
const hours = contactChannels[2].value;

export const infoPages: readonly InfoPage[] = [
  // ── Azienda ──────────────────────────────────────────────────────────────
  {
    slug: 'chi-siamo',
    section: 'Azienda',
    title: 'Chi siamo',
    description:
      'Giunti Psychometrics sviluppa test psicologici e percorsi di formazione per professionisti della salute, della scuola e delle organizzazioni.',
    lead: 'Sviluppiamo strumenti di valutazione psicologica affidabili e formiamo i professionisti che li usano ogni giorno, in clinica, a scuola e nelle organizzazioni.',
    blocks: [
      {
        kind: 'text',
        heading: 'La nostra missione',
        paragraphs: [
          'Crediamo che una buona valutazione sia il primo passo di ogni intervento efficace. Per questo lavoriamo con università, servizi sanitari e scuole per adattare, validare e aggiornare strumenti su campioni normativi italiani.',
          'Accanto ai test offriamo corsi di formazione, accreditati e non, pensati per chi somministra, interpreta e restituisce i risultati.',
        ],
      },
      {
        kind: 'facts',
        heading: 'In cifre',
        items: [
          { label: 'Strumenti in catalogo', value: '320' },
          { label: 'Professionisti formati ogni anno', value: '4.800' },
          { label: 'Università e enti partner', value: '45' },
          { label: 'Persone nel team', value: '68' },
        ],
      },
      {
        kind: 'cards',
        heading: 'I nostri valori',
        items: [
          {
            title: 'Rigore scientifico',
            text: 'Ogni strumento è accompagnato da manuale, dati psicometrici e norme aggiornate.',
          },
          {
            title: 'Uso responsabile',
            text: 'Vendiamo i test solo a chi ha la qualifica per usarli, a tutela delle persone valutate.',
          },
          {
            title: 'Accessibilità',
            text: 'Versioni digitali e materiali progettati per essere usati da tutti, anche con tecnologie assistive.',
          },
        ],
      },
    ],
  },
  {
    slug: 'comitato-scientifico',
    section: 'Azienda',
    title: 'Comitato scientifico',
    description:
      'Il comitato scientifico che supervisiona lo sviluppo, l’adattamento e la validazione degli strumenti in catalogo.',
    lead: 'Un gruppo indipendente di docenti e clinici supervisiona lo sviluppo, l’adattamento italiano e la validazione di ogni strumento.',
    blocks: [
      {
        kind: 'cards',
        heading: 'I componenti',
        items: [
          {
            title: 'Prof.ssa Elena Marchetti',
            meta: 'Presidente · Psicometria',
            text: 'Docente di psicometria, coordina i progetti di standardizzazione e la revisione delle norme.',
          },
          {
            title: 'Prof. Davide Rinaldi',
            meta: 'Neuropsicologia clinica',
            text: 'Neuropsicologo, segue gli strumenti per la valutazione delle funzioni cognitive nell’adulto.',
          },
          {
            title: 'Dott.ssa Chiara Bellini',
            meta: 'Età evolutiva',
            text: 'Neuropsichiatra infantile, si occupa di strumenti per i disturbi del neurosviluppo.',
          },
          {
            title: 'Prof. Marco Ferretti',
            meta: 'Psicologia del lavoro',
            text: 'Si occupa di assessment e selezione del personale e degli strumenti per le organizzazioni.',
          },
          {
            title: 'Dott.ssa Giulia Santoro',
            meta: 'Psicologia scolastica',
            text: 'Psicologa dell’apprendimento, cura i materiali di screening per la scuola primaria.',
          },
          {
            title: 'Prof. Luca Moretti',
            meta: 'Metodologia della ricerca',
            text: 'Supervisiona i disegni di campionamento e le analisi di validità degli studi normativi.',
          },
        ],
      },
      {
        kind: 'text',
        heading: 'Come lavora il comitato',
        paragraphs: [
          'Il comitato si riunisce ogni trimestre e valuta le proposte di nuovi strumenti, i piani di adattamento e i risultati degli studi di validazione.',
          'Nessuno strumento entra in catalogo senza il parere favorevole di almeno due componenti esperti dell’area.',
        ],
      },
    ],
  },
  {
    slug: 'lavora-con-noi',
    section: 'Azienda',
    title: 'Lavora con noi',
    description:
      'Posizioni aperte e candidature spontanee: ricerca, sviluppo software, formazione e assistenza.',
    lead: 'Cerchiamo persone che vogliano unire ricerca, tecnologia e cura per chi lavora con la valutazione psicologica.',
    blocks: [
      {
        kind: 'cards',
        heading: 'Posizioni aperte',
        items: [
          {
            title: 'Ricercatore/ricercatrice in psicometria',
            meta: 'Firenze · Ibrido · Tempo pieno',
            text: 'Analisi dei dati normativi, studi di validità e stesura dei manuali tecnici.',
          },
          {
            title: 'Sviluppatore/sviluppatrice front-end',
            meta: 'Da remoto · Tempo pieno',
            text: 'Piattaforma di somministrazione online, con attenzione ad accessibilità e prestazioni.',
          },
          {
            title: 'Specialista assistenza clienti',
            meta: 'Firenze · In sede · Part-time',
            text: 'Supporto a professionisti e scuole su ordini, qualifiche e attivazione dei test digitali.',
          },
        ],
      },
      {
        kind: 'text',
        heading: 'Come candidarsi',
        paragraphs: [
          'Invia il tuo curriculum e una breve lettera di presentazione a lavora@example.com, indicando nell’oggetto la posizione che ti interessa.',
          'Valutiamo anche candidature spontanee: rispondiamo a tutte entro tre settimane.',
        ],
      },
    ],
  },
  {
    slug: 'area-stampa',
    section: 'Azienda',
    title: 'Area stampa',
    description: 'Comunicati stampa, kit per i media e contatti dell’ufficio stampa.',
    lead: 'Notizie, comunicati e materiali per giornalisti e redazioni.',
    blocks: [
      {
        kind: 'cards',
        heading: 'Comunicati stampa',
        items: [
          {
            title: 'Nuove norme italiane per la valutazione dell’attenzione in età scolare',
            meta: '14 ottobre 2026',
            text: 'Completato lo studio normativo su oltre 2.000 studenti della scuola primaria e secondaria.',
          },
          {
            title: 'Al via il calendario dei corsi ECM 2027',
            meta: '22 settembre 2026',
            text: 'Trenta percorsi tra aula, online sincrono e on demand per psicologi e medici.',
          },
          {
            title: 'La piattaforma di somministrazione online diventa accessibile',
            meta: '3 giugno 2026',
            text: 'La nuova versione è conforme alle WCAG 2.2 AA ed è utilizzabile con lettori di schermo.',
          },
        ],
      },
      {
        kind: 'facts',
        heading: 'Ufficio stampa',
        items: [
          { label: 'Email', value: 'stampa@example.com' },
          { label: 'Telefono', value: phone },
          { label: 'Orari', value: hours },
        ],
      },
      {
        kind: 'text',
        heading: 'Kit per i media',
        paragraphs: [
          'Logo, fotografie e scheda aziendale sono disponibili su richiesta all’ufficio stampa.',
        ],
      },
    ],
  },

  // ── Assistenza ───────────────────────────────────────────────────────────
  {
    slug: 'qualifiche',
    section: 'Assistenza',
    title: 'Qualifiche per l’acquisto',
    description:
      'Chi può acquistare i test psicologici: i livelli di qualifica A, B e C e come verificarli.',
    lead: 'Ogni test è associato a un livello di qualifica: indica chi può acquistarlo e usarlo, a tutela delle persone valutate.',
    blocks: [
      {
        kind: 'cards',
        heading: 'I livelli di qualifica',
        items: Object.values(qualifications).map(({ label, description }) => ({
          title: label,
          text: description,
        })),
      },
      {
        kind: 'text',
        heading: 'Come verificare la tua qualifica',
        paragraphs: [
          'Al primo ordine di un test di livello B o C ti chiediamo il titolo di studio e, per il livello C, il numero di iscrizione all’albo professionale.',
          'La verifica richiede in genere un giorno lavorativo; una volta approvata resta valida per tutti gli ordini successivi.',
        ],
      },
      {
        kind: 'text',
        heading: 'I corsi di formazione',
        paragraphs: [
          'I corsi non richiedono qualifiche particolari, salvo dove indicato nella scheda del singolo percorso.',
        ],
      },
    ],
  },
  {
    slug: 'spedizioni-e-resi',
    section: 'Assistenza',
    title: 'Spedizioni e resi',
    description: 'Tempi e costi di spedizione, resi e rimborsi per materiale cartaceo e digitale.',
    lead: 'Spediamo il materiale cartaceo in tutta Italia; i prodotti digitali e i corsi si attivano subito dopo l’acquisto.',
    blocks: [
      {
        kind: 'facts',
        heading: 'Tempi e costi',
        items: [
          { label: 'Spedizione standard', value: '2–4 giorni lavorativi · 6,90 €' },
          { label: 'Spedizione express', value: '24–48 ore · 12,90 €' },
          { label: 'Ordini superiori a 100 €', value: 'Spedizione standard gratuita' },
          { label: 'Test digitali e corsi', value: 'Attivazione immediata, senza spedizione' },
        ],
      },
      {
        kind: 'text',
        heading: 'Resi e rimborsi',
        paragraphs: [
          'Puoi restituire il materiale cartaceo integro entro 14 giorni dalla consegna. Il rimborso arriva entro 10 giorni dalla ricezione del reso, con lo stesso metodo di pagamento.',
          'I protocolli già compilati e le licenze digitali attivate non possono essere restituiti.',
        ],
      },
      {
        kind: 'text',
        heading: 'Corsi di formazione',
        paragraphs: [
          'Puoi annullare l’iscrizione a un corso in aula o online sincrono fino a 7 giorni prima dell’inizio e ricevere il rimborso completo.',
        ],
      },
    ],
  },
  {
    slug: 'faq',
    section: 'Assistenza',
    title: 'Domande frequenti',
    description: 'Risposte alle domande più comuni su ordini, pagamenti, test, qualifiche e corsi.',
    lead: 'Le risposte alle domande che riceviamo più spesso su ordini, test e corsi.',
    blocks: [
      {
        kind: 'faq',
        heading: 'Ordini e pagamenti',
        items: [
          {
            question: 'Quali metodi di pagamento accettate?',
            answer:
              'Carta di credito o di debito, bonifico bancario e PayPal. Enti pubblici e scuole possono pagare con fattura elettronica.',
          },
          {
            question: 'Posso ricevere la fattura intestata al mio studio?',
            answer:
              'Sì: inserisci partita IVA e codice destinatario durante l’ordine e riceverai la fattura elettronica.',
          },
          {
            question: 'Come seguo la spedizione del mio ordine?',
            answer:
              'Quando il pacco parte ricevi un’email con il codice di tracciamento del corriere.',
          },
        ],
      },
      {
        kind: 'faq',
        heading: 'Test e qualifiche',
        items: [
          {
            question: 'Perché non posso aggiungere un test al carrello?',
            answer:
              'I test richiedono la verifica della qualifica: dalla scheda del test puoi chiederci informazioni e ti guidiamo nell’acquisto.',
          },
          {
            question: 'Le versioni digitali hanno le stesse norme del cartaceo?',
            answer:
              'Sì, quando non è indicato diversamente nella scheda: lo scoring automatico usa le stesse norme del manuale.',
          },
        ],
      },
      {
        kind: 'faq',
        heading: 'Corsi di formazione',
        items: [
          {
            question: 'I corsi rilasciano crediti ECM?',
            answer:
              'Molti sì: il numero di crediti è indicato nella scheda del corso. Gli attestati arrivano via email entro 30 giorni dalla fine.',
          },
          {
            question: 'Posso seguire un corso on demand quando voglio?',
            answer:
              'Sì: hai accesso ai materiali per 12 mesi dall’iscrizione e puoi interrompere e riprendere in qualsiasi momento.',
          },
        ],
      },
      {
        kind: 'facts',
        heading: 'Assistenza clienti',
        items: [
          { label: 'Email', value: email },
          { label: 'Telefono', value: phone },
          { label: 'Orari', value: hours },
        ],
      },
    ],
  },
  // ── Note legali ──────────────────────────────────────────────────────────
  {
    slug: 'privacy',
    section: 'Note legali',
    title: 'Informativa sulla privacy',
    description:
      'Come trattiamo i dati personali di chi visita il sito, ci scrive o acquista: finalità, basi giuridiche e diritti.',
    lead: 'Come trattiamo i dati personali di chi visita il sito, ci scrive o acquista, e quali diritti puoi esercitare.',
    notice: legalNotice,
    blocks: [
      {
        kind: 'facts',
        heading: 'Titolare del trattamento',
        items: [
          { label: 'Titolare', value: 'Giunti Psychometrics S.r.l.' },
          { label: 'Sede', value: 'Via dell’Esempio 1, 50100 Firenze' },
          { label: 'Responsabile della protezione dei dati', value: 'privacy@example.com' },
          { label: 'Ultimo aggiornamento', value: '5 novembre 2026' },
        ],
      },
      {
        kind: 'cards',
        heading: 'Quali dati trattiamo e perché',
        items: [
          {
            title: 'Modulo di contatto',
            meta: 'Base giuridica: richiesta dell’interessato',
            text: 'Nome, email e messaggio, usati solo per risponderti e conservati per 12 mesi.',
          },
          {
            title: 'Ordini',
            meta: 'Base giuridica: contratto e obblighi di legge',
            text: 'Dati di fatturazione e spedizione, conservati per 10 anni come richiesto dalla normativa fiscale.',
          },
          {
            title: 'Verifica della qualifica',
            meta: 'Base giuridica: obbligo deontologico',
            text: 'Titolo di studio e iscrizione all’albo, necessari per vendere i test di livello B e C.',
          },
          {
            title: 'Newsletter',
            meta: 'Base giuridica: consenso',
            text: 'Solo l’email, finché non annulli l’iscrizione dal link presente in ogni messaggio.',
          },
        ],
      },
      {
        kind: 'text',
        heading: 'Destinatari dei dati',
        paragraphs: [
          'I dati sono trattati dal nostro personale autorizzato e da fornitori che ci aiutano a erogare il servizio (spedizioni, pagamenti, hosting), nominati responsabili del trattamento.',
          'Non vendiamo i dati a terzi e non li trasferiamo fuori dallo Spazio economico europeo.',
        ],
      },
      {
        kind: 'text',
        heading: 'I tuoi diritti',
        paragraphs: [
          'Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento o riceverli in un formato portabile, e puoi opporti al trattamento. Scrivi a privacy@example.com.',
          'Se ritieni che il trattamento violi la normativa, puoi presentare reclamo al Garante per la protezione dei dati personali.',
        ],
      },
    ],
  },
  {
    slug: 'cookie',
    section: 'Note legali',
    title: 'Informativa sui cookie',
    description:
      'Quali cookie e tecnologie simili usa il sito: nessun cookie di profilazione, il carrello resta nel browser.',
    lead: 'Questo sito non usa cookie di profilazione né di terze parti per la pubblicità.',
    notice: legalNotice,
    blocks: [
      {
        kind: 'facts',
        heading: 'Cosa salviamo nel tuo browser',
        items: [
          { label: 'Cookie', value: 'Nessuno' },
          {
            label: 'Carrello (localStorage “giunti-cart”)',
            value: 'Tecnico · finché non lo svuoti',
          },
        ],
      },
      {
        kind: 'text',
        heading: 'Perché non ti chiediamo il consenso',
        paragraphs: [
          'Il carrello è salvato nella memoria locale del browser solo per ritrovarlo quando torni sul sito: è uno strumento tecnico, necessario al servizio che hai chiesto, e non richiede consenso.',
          'Non usiamo strumenti di analisi né pixel pubblicitari.',
        ],
      },
      {
        kind: 'text',
        heading: 'Contenuti esterni',
        paragraphs: [
          'Le fotografie del catalogo provengono da Unsplash. I link ai social network si aprono in una nuova scheda: da quel momento si applicano le informative di quei servizi.',
        ],
      },
      {
        kind: 'text',
        heading: 'Come cancellare i dati salvati',
        paragraphs: [
          'Puoi svuotare il carrello dal pulsante “Svuota il carrello” oppure cancellare i dati del sito dalle impostazioni del tuo browser.',
        ],
      },
    ],
  },
  {
    slug: 'termini',
    section: 'Note legali',
    title: 'Termini di vendita',
    description:
      'Condizioni generali di vendita: ordini, prezzi, pagamenti, consegna, recesso e garanzie.',
    lead: 'Le condizioni che regolano l’acquisto di test, materiali e corsi sul sito.',
    notice: legalNotice,
    blocks: [
      {
        kind: 'text',
        heading: 'Ordini e conclusione del contratto',
        paragraphs: [
          'Il contratto si conclude quando ricevi l’email di conferma dell’ordine. Per i test di livello B e C la conferma arriva dopo la verifica della qualifica.',
          'Prezzi e disponibilità sono quelli indicati nel catalogo al momento dell’ordine; i prezzi includono l’IVA.',
        ],
      },
      {
        kind: 'facts',
        heading: 'Pagamenti e consegna',
        items: [
          { label: 'Metodi di pagamento', value: 'Carta, bonifico, PayPal' },
          { label: 'Enti pubblici e scuole', value: 'Fattura elettronica' },
          { label: 'Consegna standard', value: '2–4 giorni lavorativi' },
          { label: 'Prodotti digitali e corsi', value: 'Attivazione immediata' },
        ],
      },
      {
        kind: 'text',
        heading: 'Diritto di recesso',
        paragraphs: [
          'Puoi recedere entro 14 giorni dalla consegna del materiale cartaceo, senza indicarne il motivo. Il diritto di recesso non si applica ai protocolli compilati e alle licenze digitali già attivate.',
          'Per i corsi valgono le condizioni di annullamento indicate nella pagina Spedizioni e resi.',
        ],
      },
      {
        kind: 'text',
        heading: 'Garanzia e legge applicabile',
        paragraphs: [
          'Sui prodotti si applica la garanzia legale di conformità prevista dal Codice del consumo. Il contratto è regolato dalla legge italiana.',
        ],
      },
    ],
  },
];

export function findInfoPage(slug: string): InfoPage | undefined {
  return infoPages.find((page) => page.slug === slug);
}

/** Footer links of a page's section: its column, or the legal links for "Note legali". */
export function infoSectionLinks(section: InfoSection): readonly FooterLink[] {
  if (section === 'Note legali') return legalLinks;
  return footerColumns.find((column) => column.title === section)?.links ?? [];
}

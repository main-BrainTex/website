// Domande frequenti: alimentano la pagina FAQ e l'assistente presente in tutte le pagine.
// Solo fatti già approvati (vedi CLAUDE.md): niente prezzi, tempi di consegna, clienti o dettagli tecnici riservati.
import { STATS } from '../config';
import type { Lang, RouteKey } from '../i18n';

type T = Record<Lang, string>;
const tx = (it: string, en: string): T => ({ it, en });

export const FAQ_GROUPS = {
  sistema: tx('Il sistema', 'The system'),
  progetto: tx('Installazione e assistenza', 'Installation and support'),
  dati: tx('Dati', 'Data'),
  collaborare: tx('Collaborare con noi', 'Working with us'),
};
export type FaqGroup = keyof typeof FAQ_GROUPS;

export interface Faq {
  id: string;
  group: FaqGroup;
  q: T;
  a: T;
  /** Parole in più che l'assistente usa per trovare la risposta (sinonimi, modi di chiedere). */
  keys: T;
  /** Pagina da suggerire insieme alla risposta. */
  link?: RouteKey;
}

const minutes = STATS.minutesToLearnFabric;
const speed = STATS.speedVsManual;

export const FAQS: Faq[] = [
  {
    id: 'cosa-fa',
    group: 'sistema',
    q: tx('Che cosa fa BrainTex?', 'What does BrainTex do?'),
    a: tx(
      'BrainTex guarda il tessuto mentre avanza sulle tue macchine, riconosce i difetti con l’intelligenza artificiale e ti avvisa subito. Per ogni pezza prepara la mappa dei difetti e il report.',
      'BrainTex watches the fabric as it runs on your machines, recognises defects with artificial intelligence and alerts you straight away. For every piece it prepares the defect map and the report.',
    ),
    keys: tx('funziona come cos è controllo qualità ispezione', 'how works what is quality control inspection'),
    link: 'solution',
  },
  {
    id: 'macchine',
    group: 'sistema',
    q: tx('Su quali macchine e in quali fasi si usa?', 'On which machines and at which stages is it used?'),
    a: tx(
      'Si monta sulle macchine che hai già, lungo la filiera: tessitura (telai e maglieria), controllo del greggio, finissaggio (per esempio rameuse e lavaggio), controllo finito in specola e controllo in accettazione per chi riceve il tessuto. Valutiamo insieme dove porta più valore nella tua produzione.',
      'It fits the machines you already have, along the supply chain: weaving (looms and knitting), greige inspection, finishing (for example stenters and washing), final inspection and incoming inspection for those who receive the fabric. Together we assess where it adds the most value in your production.',
    ),
    keys: tx('telaio maglieria rameuse lavaggio specola greggio finissaggio tintoria accettazione arrivo ingresso montare installare', 'loom knitting stenter washing greige finishing dyeing incoming receiving fit mount install'),
    link: 'solution',
  },
  {
    id: 'operatore',
    group: 'sistema',
    q: tx('Sostituisce l’operatore?', 'Does it replace the operator?'),
    a: tx(
      'No. BrainTex segnala, l’operatore decide: conferma o scarta ogni segnalazione e il sistema impara da quelle scelte. Toglie fatica, non toglie il mestiere.',
      'No. BrainTex flags, the operator decides: they confirm or dismiss each alert and the system learns from those choices. It takes away strain, not the craft.',
    ),
    keys: tx('persone lavoro sostituire personale controllore addetto', 'people jobs replace staff inspector worker'),
  },
  {
    id: 'nuovo-articolo',
    group: 'sistema',
    q: tx('Quanto ci mette a imparare un nuovo articolo?', 'How long does it take to learn a new article?'),
    a: tx(
      `Meno di ${minutes} minuti, senza raccogliere grandi quantità di immagini: va bene anche per lotti piccoli e sempre diversi.`,
      `Less than ${minutes} minutes, without collecting large amounts of images: it suits small, ever-changing lots too.`,
    ),
    keys: tx('tempo addestramento articoli nuovi cambio tessuto lotti dataset', 'time training new articles fabric change lots dataset'),
  },
  {
    id: 'disegni',
    group: 'sistema',
    q: tx('Funziona anche su disegni complessi?', 'Does it work on complex patterns too?'),
    a: tx(
      'Sì. BrainTex distingue un difetto da una variazione voluta del disegno o della struttura, ne indica classe e gravità ed evita allarmi inutili.',
      'Yes. BrainTex tells a defect apart from an intended variation of pattern or structure, indicates its class and severity and avoids needless alarms.',
    ),
    keys: tx('fantasia jacquard righe quadri struttura falsi allarmi', 'jacquard stripes checks structure false alarms'),
  },
  {
    id: 'velocita',
    group: 'sistema',
    q: tx('Quanto è veloce?', 'How fast is it?'),
    a: tx(
      `L’ispezione procede a circa ${speed.toLocaleString('it-IT')} volte il controllo manuale, fino a ${STATS.maxSpeedMps} m/s, con la stessa attenzione dal primo all’ultimo metro.`,
      `Inspection runs at about ${speed.toLocaleString('en-GB')} times manual inspection, up to ${STATS.maxSpeedMps} m/s, with the same attention from the first metre to the last.`,
    ),
    keys: tx('velocità metri al secondo rapido produttività', 'speed metres per second fast productivity'),
  },
  {
    id: 'avvisi',
    group: 'sistema',
    q: tx('Come avvisa quando trova un difetto?', 'How does it alert you when it finds a defect?'),
    a: tx(
      'Sul tablet dell’operatore o con un segnale luminoso, in tempo reale. Puoi scegliere, classe per classe, cosa mostrare, cosa solo registrare e cosa deve far scattare un allarme o fermare la macchina.',
      'On the operator’s tablet or with a light signal, in real time. Class by class, you choose what to show, what to only record and what should trigger an alarm or stop the machine.',
    ),
    keys: tx('allarme tablet luce fermo macchina segnalazione notifica', 'alarm tablet light stop machine alert notification'),
  },
  {
    id: 'consumo',
    group: 'sistema',
    q: tx('Quanta energia consuma?', 'How much energy does it use?'),
    a: tx(`Circa ${STATS.powerWatts} W: un consumo contenuto.`, `About ${STATS.powerWatts} W: a modest consumption.`),
    keys: tx('consumo elettrico watt corrente energia', 'power consumption watt electricity energy'),
  },
  {
    id: 'costo',
    group: 'progetto',
    q: tx('Quanto costa?', 'How much does it cost?'),
    a: tx(
      'Dipende dalla tua produzione: macchine, fasi e articoli. Lo valutiamo insieme nell’analisi di fattibilità, dopo aver visto il tuo reparto. Scrivici per iniziare.',
      'It depends on your production: machines, stages and articles. We assess it together in the feasibility study, after seeing your department. Write to us to get started.',
    ),
    keys: tx('prezzo preventivo offerta costi investimento listino', 'price quote offer costs investment'),
    link: 'contact',
  },
  {
    id: 'come-si-parte',
    group: 'progetto',
    q: tx('Come si svolge l’installazione?', 'How does installation work?'),
    a: tx(
      'Si parte da un’analisi di fattibilità con sopralluogo, poi progettazione e analisi funzionale, quindi installazione e attivazione sulle tue macchine. I tempi li definiamo insieme, anche in base al luogo.',
      'It starts with a feasibility study and a site visit, then design and functional analysis, then installation and activation on your machines. We set the timing together, also depending on the location.',
    ),
    keys: tx('installazione tempi sopralluogo fattibilità avvio quanto tempo progetto fasi', 'installation timing site visit feasibility start how long project phases'),
    link: 'solution',
  },
  {
    id: 'assistenza',
    group: 'progetto',
    q: tx('Che assistenza c’è dopo l’installazione?', 'What support is there after installation?'),
    a: tx(
      'Onboarding in reparto, in presenza e da remoto, con affiancamento a chi lavora. Poi restiamo in contatto: ogni spunto tuo e dei tuoi operatori viene preso in considerazione.',
      'Onboarding on the shop floor, on site and remotely, working alongside your people. Then we stay in touch: every suggestion from you and your operators is taken into account.',
    ),
    keys: tx('supporto formazione onboarding affiancamento manutenzione aiuto remoto', 'help training onboarding maintenance remote support'),
  },
  {
    id: 'su-misura',
    group: 'progetto',
    q: tx('Fate progetti su misura?', 'Do you build custom projects?'),
    a: tx(
      'Di solito no. Se però la tua esigenza è in linea con la nostra visione, possiamo valutarla e proporti un’analisi di fattibilità.',
      'Not usually. But if your need fits our vision, we can assess it and offer you a feasibility study.',
    ),
    keys: tx('personalizzato ad hoc speciale esigenza particolare', 'custom bespoke special particular need'),
    link: 'contact',
  },
  {
    id: 'gestionali',
    group: 'progetto',
    q: tx('Si collega al gestionale, all’ERP o al MES?', 'Does it connect to the ERP or MES?'),
    a: tx(
      'I dati di ispezione possono arrivare ai sistemi che usi già: le modalità le definiamo insieme in fase di progetto. Se sei una software house, possiamo lavorarci insieme.',
      'Inspection data can reach the systems you already use: we define how together during the project. If you are a software house, we can work on it together.',
    ),
    keys: tx('erp mes gestionale integrazione software dati collegamento api', 'erp mes integration software data connection api'),
    link: 'investors',
  },
  {
    id: 'proprieta-dati',
    group: 'dati',
    q: tx('A chi appartengono i dati e le immagini?', 'Who owns the data and images?'),
    a: tx(
      'I modelli sono addestrati per ogni singolo cliente e non vengono usati per altre aziende; il trattamento di immagini e dati è definito nel contratto.',
      'Models are trained for each individual customer and are not used for other companies; the handling of images and data is set out in the contract.',
    ),
    keys: tx('proprietà riservatezza privacy immagini modelli sicurezza concorrenti', 'ownership confidentiality privacy images models security competitors'),
  },
  {
    id: 'report',
    group: 'dati',
    q: tx('Cosa ricevo per ogni pezza?', 'What do I get for each piece?'),
    a: tx(
      'La mappa digitale dei difetti e un report con anagrafica, misure, elenco dei difetti con le immagini, i commenti dell’operatore e le indicazioni dell’intelligenza artificiale. Nella pagina Soluzione trovi un esempio.',
      'The digital defect map and a report with piece record, measurements, list of defects with images, operator comments and AI insights. You can see an example on the Solution page.',
    ),
    keys: tx('report mappa pezza documento contestazione tracciabilità cruscotto', 'report map piece document dispute traceability dashboard'),
    link: 'solution',
  },
  {
    id: 'progetti',
    group: 'collaborare',
    q: tx('Posso proporvi un bando o un progetto di co-sviluppo?', 'Can I propose a funding call or a co-development project?'),
    a: tx(
      'Sì. Usa il modulo di contatto scegliendo “Proposta di progetto”: valutiamo ogni proposta in linea con la nostra visione. Per i bandi indicaci la scadenza.',
      'Yes. Use the contact form and choose “Project proposal”: we assess every proposal that fits our vision. For funding calls, let us know the deadline.',
    ),
    keys: tx('bando finanziamento ricerca università partenariato cosviluppo progetto', 'funding call grant research university partnership codevelopment project'),
    link: 'investors',
  },
  {
    id: 'lavoro',
    group: 'collaborare',
    q: tx('Come posso candidarmi?', 'How can I apply for a job?'),
    a: tx(
      'Le posizioni aperte sono nella pagina Lavora con noi. Anche se non ce ne sono, la candidatura spontanea è sempre benvenuta.',
      'Open positions are on the Careers page. Even when there are none, spontaneous applications are always welcome.',
    ),
    keys: tx('lavoro candidatura curriculum cv posizioni stage assunzioni', 'job application cv resume positions internship hiring'),
    link: 'careers',
  },
  {
    id: 'agenti-fornitori',
    group: 'collaborare',
    q: tx('Sono un agente o un fornitore: come vi contatto?', 'I am an agent or a supplier: how do I contact you?'),
    a: tx(
      'Dal modulo di contatto, scegliendo “Agente di commercio” o “Fornitore”: ti chiediamo solo le informazioni che servono per valutare la proposta.',
      'Through the contact form, choosing “Sales agent” or “Supplier”: we only ask for the information we need to assess your proposal.',
    ),
    keys: tx('agente rappresentante fornitore fornitura mandato vendita', 'agent representative supplier supply mandate sales'),
    link: 'contact',
  },
  {
    id: 'investitori',
    group: 'collaborare',
    q: tx('Sono un investitore: dove trovo più informazioni?', 'I am an investor: where can I find out more?'),
    a: tx(
      'Nella pagina Investitori e partner trovi la nostra visione. La presentazione per investitori la mandiamo su richiesta, e possiamo fissare una call.',
      'The Investors & partners page sets out our vision. We send the investor presentation on request, and we can book a call.',
    ),
    keys: tx('investimento investire presentazione deck round soci', 'investment invest presentation deck round shareholders'),
    link: 'investors',
  },
];

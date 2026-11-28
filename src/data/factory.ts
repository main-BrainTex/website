// Contenuti della fabbrica-simulatore (documento "Benefici BrainTex e simulatore", 27/11/2026).
// Simulazione concettuale ed esemplificativa: niente euro, eventi e risultati illustrativi.
// Le coordinate (x, y) sono su una pianta 0–100 × 0–60, condivisa da mappa 2D e scena 3D.
import type { Lang } from '../i18n';

type T = Record<Lang, string>;
const tx = (it: string, en: string): T => ({ it, en });

export type NodeKey =
  | 'tessitura'
  | 'greggio'
  | 'finissaggio'
  | 'controllo'
  | 'manutenzione'
  | 'qualita'
  | 'uffici'
  | 'magazzino'
  | 'confezionista'
  | 'ambiente';

export interface FactoryNode {
  key: NodeKey;
  kind: 'station' | 'department';
  x: number;
  y: number;
  name: T;
}

/** Linea di produzione (davanti) e reparti in cui arrivano le conseguenze (dietro e intorno). */
export const NODES: FactoryNode[] = [
  { key: 'tessitura', kind: 'station', x: 12, y: 40, name: tx('Tessitura', 'Weaving') },
  { key: 'greggio', kind: 'station', x: 32, y: 40, name: tx('Controllo del greggio', 'Greige inspection') },
  { key: 'finissaggio', kind: 'station', x: 52, y: 40, name: tx('Tintoria e finissaggio', 'Dyeing and finishing') },
  { key: 'controllo', kind: 'station', x: 72, y: 40, name: tx('Controllo finito', 'Final inspection') },
  { key: 'manutenzione', kind: 'department', x: 12, y: 12, name: tx('Manutenzione', 'Maintenance') },
  { key: 'qualita', kind: 'department', x: 34, y: 12, name: tx('Qualità', 'Quality') },
  { key: 'uffici', kind: 'department', x: 56, y: 12, name: tx('Uffici e direzione', 'Offices and management') },
  { key: 'magazzino', kind: 'department', x: 78, y: 12, name: tx('Magazzino e spedizioni', 'Warehouse and shipping') },
  { key: 'confezionista', kind: 'department', x: 89, y: 40, name: tx('Confezionista', 'Garment maker') },
  { key: 'ambiente', kind: 'department', x: 42, y: 55, name: tx('Ambiente', 'Environment') },
];

export type IndicatorKey =
  | 'qualita'
  | 'consegne'
  | 'macchine'
  | 'processo'
  | 'serenita'
  | 'fiducia'
  | 'ambiente'
  | 'norme';

export interface Indicator {
  key: IndicatorKey;
  name: T;
  hint: T;
  /** true se un livello più basso è migliore (impronta ambientale). */
  lowerIsBetter?: boolean;
}

export const INDICATORS: Indicator[] = [
  { key: 'qualita', name: tx('Qualità consegnata', 'Delivered quality'), hint: tx('Quanto il tessuto che esce è davvero come promesso', 'How closely the fabric that ships matches what was promised') },
  { key: 'consegne', name: tx('Affidabilità delle consegne', 'Delivery reliability'), hint: tx('Tempi rispettati, niente code o rilavorazioni dell’ultimo minuto', 'Deadlines met, no queues or last-minute rework') },
  { key: 'macchine', name: tx('Salute delle macchine', 'Machine health'), hint: tx('Guasti visti in anticipo, manutenzione programmata', 'Faults seen early, planned maintenance') },
  { key: 'processo', name: tx('Conoscenza del processo', 'Process knowledge'), hint: tx('Quanto l’azienda sa dove e perché nascono i difetti', 'How well the company knows where and why defects arise') },
  { key: 'serenita', name: tx('Serenità del lavoro', 'Peace of mind at work'), hint: tx('Meno fatica, meno pressione, esperienza condivisa', 'Less strain, less pressure, shared experience') },
  { key: 'fiducia', name: tx('Fiducia della filiera', 'Supply chain trust'), hint: tx('Contestazioni risolte con i dati, confezionisti che si fidano del fornitore', 'Disputes settled with data, garment makers who trust their supplier') },
  { key: 'ambiente', name: tx('Impronta ambientale', 'Environmental footprint'), hint: tx('Tessuto, acqua, energia e prodotti chimici sprecati', 'Fabric, water, energy and chemicals wasted'), lowerIsBetter: true },
  { key: 'norme', name: tx('Prontezza normativa', 'Regulatory readiness'), hint: tx('Dati pronti per passaporto digitale, audit e certificazioni', 'Data ready for digital passports, audits and certifications') },
];

export type DefectOutcome = 'fonte' | 'controllo' | 'confezionista';

export interface FactoryEvent {
  key: string;
  phase: T;
  origin: NodeKey;
  /** Reparti (o macchine) raggiunti dalla catena di conseguenze. */
  targets: NodeKey[];
  title: T;
  /** Pulsante breve per la modalità demo. */
  action: T;
  without: Record<Lang, string[]>;
  with: Record<Lang, string[]>;
  indicators: IndicatorKey[];
  /** Dove si ferma il difetto, se l'evento ne contiene uno. */
  defect?: { without: DefectOutcome; with: DefectOutcome };
  /** Metri coinvolti senza BrainTex: valore di esempio, salvati con BrainTex. */
  meters?: number;
  /** Il cassone degli scarti si riempie / un reso torna indietro (solo senza BrainTex). */
  scrap?: boolean;
  returned?: boolean;
  queue?: boolean;
}

const ev = (e: FactoryEvent) => e;

export const EVENTS: FactoryEvent[] = [
  ev({
    key: 'ago',
    phase: tx('Tessitura', 'Weaving'),
    origin: 'tessitura',
    targets: ['manutenzione', 'magazzino'],
    title: tx('Un ago o un filo si rompe e il difetto si ripete', 'A needle or yarn breaks and the defect repeats'),
    action: tx('Rompi un ago', 'Break a needle'),
    without: {
      it: ['Il difetto continua per decine di metri', 'Se ne accorge il controllo a valle', 'Pezza scartata o declassata', 'Intanto la macchina si usura'],
      en: ['The defect runs on for dozens of metres', 'Inspection downstream notices it', 'Piece scrapped or downgraded', 'Meanwhile the machine wears out'],
    },
    with: {
      it: ['Avviso dopo pochi centimetri', 'Fermo o intervento', 'Metri salvati', 'L’evento resta registrato per la manutenzione'],
      en: ['An alert after a few centimetres', 'Stop or intervention', 'Metres saved', 'The event is logged for maintenance'],
    },
    indicators: ['macchine'],
    defect: { without: 'controllo', with: 'fonte' },
    meters: 60,
    scrap: true,
  }),
  ev({
    key: 'deriva',
    phase: tx('Finissaggio', 'Finishing'),
    origin: 'finissaggio',
    targets: ['qualita', 'magazzino'],
    title: tx('La temperatura o la tensione in rama deriva lentamente', 'Stenter temperature or tension drifts slowly'),
    action: tx('Fai derivare la rama', 'Let the stenter drift'),
    without: {
      it: ['Difettosità che cresce piano', 'Nessuno la nota', 'Un intero lotto fuori standard'],
      en: ['Defects grow slowly', 'Nobody notices', 'A whole lot out of standard'],
    },
    with: {
      it: ['I dati mostrano l’aumento', 'Lo collegano al parametro', 'Correzione prima dello scarto'],
      en: ['The data shows the increase', 'It is linked to the parameter', 'Corrected before it becomes waste'],
    },
    indicators: ['processo', 'qualita'],
    defect: { without: 'confezionista', with: 'fonte' },
    meters: 200,
  }),
  ev({
    key: 'filato',
    phase: tx('Tessitura', 'Weaving'),
    origin: 'tessitura',
    targets: ['uffici', 'qualita'],
    title: tx('Arriva un lotto di filato difettoso', 'A defective yarn lot arrives'),
    action: tx('Filato difettoso', 'Defective yarn'),
    without: {
      it: ['Difetti attribuiti alla tessitura', 'Discussioni interne', 'Reclamo al fornitore senza prove'],
      en: ['Defects blamed on weaving', 'Internal arguments', 'A claim to the supplier without evidence'],
    },
    with: {
      it: ['Difetti collegati al lotto', 'Reclamo documentato', 'Fornitore valutato con i dati'],
      en: ['Defects linked to the lot', 'A documented claim', 'Supplier assessed with data'],
    },
    indicators: ['processo', 'fiducia'],
  }),
  ev({
    key: 'tintoria',
    phase: tx('Greggio e finissaggio', 'Greige and finishing'),
    origin: 'greggio',
    targets: ['finissaggio', 'ambiente', 'magazzino'],
    title: tx('Una pezza difettosa sta per entrare in tintoria', 'A defective piece is about to enter the dye house'),
    action: tx('Pezza difettosa verso la tintoria', 'Defective piece heading to dyeing'),
    without: {
      it: ['Viene tinta e finita', 'Acqua, energia e prodotti chimici consumati', 'Poi viene scartata'],
      en: ['It gets dyed and finished', 'Water, energy and chemicals are used', 'Then it is scrapped'],
    },
    with: {
      it: ['Fermata prima della tintoria', 'Rammendata o deviata', 'Nessuna lavorazione sprecata'],
      en: ['Stopped before dyeing', 'Mended or rerouted', 'No processing wasted'],
    },
    indicators: ['ambiente'],
    defect: { without: 'controllo', with: 'fonte' },
    meters: 50,
    scrap: true,
  }),
  ev({
    key: 'articolo',
    phase: tx('Tutte le fasi', 'All stages'),
    origin: 'controllo',
    targets: ['qualita'],
    title: tx('Cambio articolo e lotti piccoli', 'Article changes and small batches'),
    action: tx('Cambia articolo', 'Change article'),
    without: {
      it: ['Ogni articolo nuovo cambia i riferimenti', 'Controllo meno affidabile nelle prime pezze'],
      en: ['Every new article changes the references', 'Less reliable inspection on the first pieces'],
    },
    with: {
      it: ['BrainTex impara l’articolo in meno di 2 minuti', 'Stessa attenzione dal primo metro'],
      en: ['BrainTex learns the article in less than 2 minutes', 'The same attention from the first metre'],
    },
    indicators: ['qualita'],
    defect: { without: 'confezionista', with: 'controllo' },
  }),
  ev({
    key: 'turno',
    phase: tx('Controllo finito', 'Final inspection'),
    origin: 'controllo',
    targets: ['qualita', 'confezionista'],
    title: tx('Fine turno', 'End of shift'),
    action: tx('Fine turno', 'End of shift'),
    without: {
      it: ['L’attenzione cala, per chiunque', 'Difetti che sfuggono', 'Operatore stanco e sotto pressione'],
      en: ['Attention drops, for anyone', 'Defects slip through', 'Operator tired and under pressure'],
    },
    with: {
      it: ['Attenzione costante', 'L’operatore conferma o scarta le segnalazioni'],
      en: ['Constant attention', 'The operator confirms or dismisses each alert'],
    },
    indicators: ['serenita', 'qualita'],
    defect: { without: 'confezionista', with: 'controllo' },
  }),
  ev({
    key: 'operatore',
    phase: tx('Controllo finito', 'Final inspection'),
    origin: 'controllo',
    targets: ['qualita', 'uffici'],
    title: tx('Arriva un nuovo operatore', 'A new operator joins'),
    action: tx('Nuovo operatore', 'New operator'),
    without: {
      it: ['Mesi di affiancamento', 'Dipendenza dall’esperto', 'Rischio quando l’esperto va in pensione'],
      en: ['Months of shadowing', 'Dependence on the expert', 'Risk when the expert retires'],
    },
    with: {
      it: ['BrainTex guida con le sue segnalazioni', 'L’esperienza degli esperti resta in azienda'],
      en: ['BrainTex guides with its alerts', 'Experts’ experience stays in the company'],
    },
    indicators: ['processo', 'serenita'],
  }),
  ev({
    key: 'urgente',
    phase: tx('Controllo finito', 'Final inspection'),
    origin: 'controllo',
    targets: ['magazzino', 'confezionista'],
    title: tx('Ordine urgente, picco di produzione', 'Rush order, production peak'),
    action: tx('Ordine urgente', 'Rush order'),
    without: {
      it: ['Pezze in coda al controllo', 'Controllo affrettato o consegna in ritardo'],
      en: ['Pieces queue up at inspection', 'Rushed inspection or late delivery'],
    },
    with: {
      it: ['Controllo in linea, fino a 1 m/s', 'Nessuna coda'],
      en: ['In-line inspection, up to 1 m/s', 'No queue'],
    },
    indicators: ['consegne'],
    queue: true,
  }),
  ev({
    key: 'confezione',
    phase: tx('Confezione', 'Garment making'),
    origin: 'confezionista',
    targets: ['uffici'],
    title: tx('Il confezionista taglia il tessuto', 'The garment maker cuts the fabric'),
    action: tx('Il confezionista taglia', 'The garment maker cuts'),
    without: {
      it: ['Difetti scoperti al taglio', 'Pezzi scartati', 'Contestazione'],
      en: ['Defects found at cutting', 'Pieces scrapped', 'A dispute'],
    },
    with: {
      it: ['La mappa dei difetti viaggia con la pezza', 'Il taglio automatico piazza i capi evitando i difetti', 'Più resa del tessuto, meno scarti di taglio'],
      en: ['The defect map travels with the piece', 'Automatic cutting places the parts around the defects', 'Higher fabric yield, less cutting waste'],
    },
    indicators: ['fiducia', 'ambiente'],
    defect: { without: 'confezionista', with: 'controllo' },
    meters: 5,
    returned: true,
  }),
  ev({
    key: 'fornitore',
    phase: tx('Confezione', 'Garment making'),
    origin: 'confezionista',
    targets: ['uffici', 'magazzino'],
    title: tx('Il confezionista decide a chi affidare la prossima stagione', 'The garment maker decides who gets next season’s work'),
    action: tx('Il confezionista sceglie i fornitori', 'The garment maker picks suppliers'),
    without: {
      it: ['Tutti i fornitori sembrano uguali', 'Il lavoro viene diviso tra tanti, per prudenza', 'Ordini piccoli e incerti'],
      en: ['All suppliers look the same', 'Work is split among many, to be safe', 'Small, uncertain orders'],
    },
    with: {
      it: ['Ogni consegna arriva con dati di qualità confrontabili', 'La fiducia nel fornitore cresce', 'Più produzione concentrata su chi è affidabile'],
      en: ['Every delivery comes with comparable quality data', 'Trust in the supplier grows', 'More production concentrated on the reliable one'],
    },
    indicators: ['fiducia', 'consegne'],
  }),
  ev({
    key: 'contestazione',
    phase: tx('Commerciale', 'Sales'),
    origin: 'confezionista',
    targets: ['uffici'],
    title: tx('Il confezionista contesta una pezza, settimane dopo', 'The garment maker disputes a piece, weeks later'),
    action: tx('Arriva una contestazione', 'A dispute arrives'),
    without: {
      it: ['Nessun dato', 'Parola contro parola', 'Sconto o reso'],
      en: ['No data', 'Your word against theirs', 'Discount or return'],
    },
    with: {
      it: ['Report con metro, tipo e immagine di ogni difetto', 'Risposta in pochi minuti'],
      en: ['A report with metre, type and image of each defect', 'An answer within minutes'],
    },
    indicators: ['fiducia'],
    returned: true,
  }),
  ev({
    key: 'preventivo',
    phase: tx('Commerciale', 'Sales'),
    origin: 'uffici',
    targets: ['confezionista'],
    title: tx('Si prepara un preventivo per un nuovo articolo', 'A quote is prepared for a new article'),
    action: tx('Prepara un preventivo', 'Prepare a quote'),
    without: { it: ['Stima a sensazione di scarti e tempi'], en: ['A gut-feeling estimate of waste and lead times'] },
    with: {
      it: ['Difettosità reale di articoli simili', 'Prezzo e tempi più accurati'],
      en: ['Real defect rate of similar articles', 'More accurate price and lead times'],
    },
    indicators: ['consegne', 'processo'],
  }),
  ev({
    key: 'riunione',
    phase: tx('Direzione', 'Management'),
    origin: 'uffici',
    targets: ['manutenzione', 'qualita'],
    title: tx('Riunione mensile di direzione', 'Monthly management meeting'),
    action: tx('Riunione di direzione', 'Management meeting'),
    without: { it: ['Si discute di impressioni'], en: ['Discussion based on impressions'] },
    with: {
      it: ['Dove si perde qualità: per macchina, articolo, turno e fornitore', 'Investimenti mirati'],
      en: ['Where quality is lost: by machine, article, shift and supplier', 'Targeted investments'],
    },
    indicators: ['processo'],
  }),
  ev({
    key: 'passaporto',
    phase: tx('Sostenibilità', 'Sustainability'),
    origin: 'confezionista',
    targets: ['uffici', 'ambiente'],
    title: tx('Un confezionista, un brand o un ente chiede dati per il passaporto digitale o un audit', 'A garment maker, brand or body asks for digital passport or audit data'),
    action: tx('Richiesta di dati', 'Data request'),
    without: { it: ['Dati sparsi o cartacei', 'Settimane di lavoro'], en: ['Scattered or paper data', 'Weeks of work'] },
    with: {
      it: ['Dati di qualità già digitali', 'Collegati alla pezza'],
      en: ['Quality data already digital', 'Linked to each piece'],
    },
    indicators: ['norme'],
  }),
  ev({
    key: 'progettazione',
    phase: tx('Progettazione', 'Design'),
    origin: 'uffici',
    targets: ['tessitura', 'ambiente'],
    title: tx('Il progettista disegna la prossima collezione', 'The designer draws the next collection'),
    action: tx('Nuova collezione', 'New collection'),
    without: { it: ['Nessun ritorno dalla produzione'], en: ['No feedback from production'] },
    with: {
      it: ['Sa quali strutture e filati danno più difetti', 'Progetta per ridurre lo scarto'],
      en: ['Knows which structures and yarns cause more defects', 'Designs to reduce waste'],
    },
    indicators: ['processo', 'ambiente'],
  }),
  ev({
    key: 'fornitore',
    phase: tx('Tessitura', 'Weaving'),
    origin: 'tessitura',
    targets: ['uffici', 'qualita'],
    title: tx('Cambio di fornitore di filato', 'Change of yarn supplier'),
    action: tx('Cambia fornitore', 'Change supplier'),
    without: {
      it: ['Nessun confronto oggettivo', 'La differenza si scopre a valle, a lotto finito'],
      en: ['No objective comparison', 'The difference shows up downstream, after the lot'],
    },
    with: {
      it: ['Difettosità confrontata fin dalle prime pezze', 'Decisione con i dati'],
      en: ['Defect rates compared from the first pieces', 'A data-driven decision'],
    },
    indicators: ['processo', 'fiducia'],
  }),
  ev({
    key: 'avvio',
    phase: tx('Tutte le fasi', 'All stages'),
    origin: 'finissaggio',
    targets: ['manutenzione'],
    title: tx('Avvio di una nuova macchina', 'A new machine starts up'),
    action: tx('Avvia una macchina', 'Start a machine'),
    without: {
      it: ['Settimane di regolazioni a occhio', 'Scarti durante l’avviamento'],
      en: ['Weeks of adjustments by eye', 'Waste during start-up'],
    },
    with: {
      it: ['Difettosità misurata dal primo metro', 'Messa a punto più rapida'],
      en: ['Defect rate measured from the first metre', 'Faster tuning'],
    },
    indicators: ['macchine'],
    meters: 30,
    scrap: true,
  }),
  ev({
    key: 'audit',
    phase: tx('Direzione e sostenibilità', 'Management and sustainability'),
    origin: 'uffici',
    targets: ['qualita', 'ambiente'],
    title: tx('Audit di certificazione', 'Certification audit'),
    action: tx('Audit', 'Audit'),
    without: {
      it: ['Documenti da ricostruire a mano', 'Tempo e incertezza'],
      en: ['Documents rebuilt by hand', 'Time and uncertainty'],
    },
    with: { it: ['Storico della qualità già digitale e consultabile'], en: ['Quality history already digital and searchable'] },
    indicators: ['norme'],
  }),
  ev({
    key: 'visita',
    phase: tx('Commerciale', 'Sales'),
    origin: 'confezionista',
    targets: ['controllo'],
    title: tx('Un confezionista visita lo stabilimento', 'A garment maker visits the mill'),
    action: tx('Visita di un confezionista', 'Garment maker visit'),
    without: { it: ['La qualità si racconta a parole'], en: ['Quality is described in words'] },
    with: {
      it: ['Si mostrano in diretta il controllo del 100%', 'E il report delle sue pezze'],
      en: ['100% inspection is shown live', 'Along with the report on their pieces'],
    },
    indicators: ['fiducia'],
  }),
  ev({
    key: 'approvazione',
    phase: tx('Commerciale', 'Sales'),
    origin: 'magazzino',
    targets: ['confezionista'],
    title: tx('Il confezionista vuole vedere la merce prima della spedizione', 'The garment maker wants to see the goods before shipping'),
    action: tx('Spedizione in arrivo', 'Shipment pending'),
    without: {
      it: ['Si spedisce con il report cartaceo', 'Il confezionista scopre a destinazione ciò che non accetta', 'Reso e nuova spedizione'],
      en: ['Shipped with a paper report', 'The garment maker finds what they reject on arrival', 'Return and new shipment'],
    },
    with: {
      it: ['Report e immagini inviati prima', 'Il confezionista approva o chiede la bonifica', 'Si spedisce solo ciò che è approvato'],
      en: ['Report and images sent beforehand', 'The garment maker approves or asks for an allowance', 'Only approved goods ship'],
    },
    indicators: ['fiducia', 'ambiente'],
    returned: true,
  }),
  ev({
    key: 'rammendo',
    phase: tx('Greggio e controllo finito', 'Greige and final inspection'),
    origin: 'greggio',
    targets: ['magazzino'],
    title: tx('La pezza va al rammendo', 'The piece goes to mending'),
    action: tx('Pezza al rammendo', 'Piece to mending'),
    without: {
      it: ['Ogni difetto va ritrovato a vista', 'Tempo perso, difetti dimenticati'],
      en: ['Every defect must be found again by eye', 'Time lost, defects forgotten'],
    },
    with: {
      it: ['La mappa digitale porta al difetto', 'I tutorial guidano l’intervento', 'Il rammendo si può affidare anche all’esterno'],
      en: ['The digital map leads to the defect', 'Tutorials guide the repair', 'Mending can be outsourced too'],
    },
    indicators: ['consegne', 'serenita'],
  }),
];

export interface RoleLens {
  key: string;
  name: T;
  events: string[];
  indicators: IndicatorKey[];
}

export const LENSES: RoleLens[] = [
  { key: 'direzione', name: tx('Titolare e direzione', 'Owners and management'), events: ['riunione', 'contestazione', 'fornitore'], indicators: ['fiducia', 'processo', 'consegne'] },
  { key: 'qualita', name: tx('Qualità', 'Quality'), events: ['turno', 'articolo', 'contestazione', 'filato'], indicators: ['qualita', 'processo'] },
  { key: 'produzione', name: tx('Produzione', 'Production'), events: ['ago', 'deriva', 'urgente'], indicators: ['consegne'] },
  { key: 'manutenzione', name: tx('Manutenzione', 'Maintenance'), events: ['ago', 'deriva'], indicators: ['macchine'] },
  { key: 'commerciale', name: tx('Commerciale', 'Sales'), events: ['contestazione', 'preventivo', 'confezione', 'fornitore'], indicators: ['fiducia', 'consegne'] },
  { key: 'sostenibilita', name: tx('Sostenibilità', 'Sustainability'), events: ['tintoria', 'passaporto', 'progettazione'], indicators: ['ambiente', 'norme'] },
  { key: 'operatore', name: tx('Operatore', 'Operator'), events: ['turno', 'operatore'], indicators: ['serenita'] },
];

/** Tappe del racconto a scorrimento nella pagina della fabbrica. */
export const TOUR: { focus: NodeKey | null; events: string[]; title: T; text: T }[] = [
  {
    focus: null,
    events: [],
    title: tx('Un’azienda intera, non solo una linea', 'A whole company, not just a line'),
    text: tx(
      'Davanti c’è la linea: tessitura, controllo del greggio, tintoria e finissaggio, controllo finito. Dietro ci sono i reparti in cui arrivano le conseguenze di ogni difetto. Usa l’interruttore per vedere la stessa giornata senza e con BrainTex.',
      'In front is the line: weaving, greige inspection, dyeing and finishing, final inspection. Behind are the departments where the consequences of every defect land. Use the switch to see the same day without and with BrainTex.',
    ),
  },
  {
    focus: 'tessitura',
    events: ['ago'],
    title: tx('Tessitura: un ago si rompe', 'Weaving: a needle breaks'),
    text: tx(
      'Un guasto produce un difetto che si ripete. Conta quanti metri passano prima che qualcuno se ne accorga.',
      'A fault creates a repeating defect. What matters is how many metres go by before anyone notices.',
    ),
  },
  {
    focus: 'greggio',
    events: ['tintoria', 'deriva'],
    title: tx('Greggio e finissaggio: prima della tintoria', 'Greige and finishing: before dyeing'),
    text: tx(
      'Una pezza difettosa nobilitata consuma acqua, energia e prodotti chimici per niente. E una deriva lenta del processo può rovinare un intero lotto.',
      'A defective piece that gets finished wastes water, energy and chemicals. And a slow process drift can spoil a whole lot.',
    ),
  },
  {
    focus: 'controllo',
    events: ['turno'],
    title: tx('Controllo finito: fine turno', 'Final inspection: end of shift'),
    text: tx(
      'Dopo ore davanti al tessuto l’attenzione cala, per chiunque. BrainTex segnala, l’operatore decide.',
      'After hours in front of the fabric, attention drops for anyone. BrainTex flags, the operator decides.',
    ),
  },
  {
    focus: 'confezionista',
    events: ['confezione', 'fornitore'],
    title: tx('Il confezionista: taglio, resa e fiducia', 'The garment maker: cutting, yield and trust'),
    text: tx(
      'La filiera è fatta di tante aziende. Chi confeziona taglia il tessuto: con la mappa dei difetti il taglio automatico li evita, la resa sale e gli scarti scendono. E una contestazione non è più parola contro parola: chi riceve dati affidabili concentra il lavoro su quel fornitore.',
      'The supply chain is made of many companies. The garment maker cuts the fabric: with the defect map, automatic cutting avoids defects, yield goes up and waste goes down. And a dispute is no longer your word against theirs: those who receive reliable data concentrate their work on that supplier.',
    ),
  },
];

/** Giro guidato nella fabbrica 3D: la vista si sposta da sola, una frase per tappa. */
export const GUIDED_TOUR: { focus: NodeKey | null; text: T }[] = [
  {
    focus: 'tessitura',
    text: tx(
      'Tessitura: BrainTex guarda il tessuto sul telaio e si accorge di un guasto dopo pochi centimetri.',
      'Weaving: BrainTex watches the fabric on the loom and notices a fault after a few centimetres.',
    ),
  },
  {
    focus: 'greggio',
    text: tx(
      'Controllo del greggio: ogni pezza viene guardata metro per metro prima di andare avanti.',
      'Greige inspection: every piece is looked at metre by metre before it moves on.',
    ),
  },
  {
    focus: 'finissaggio',
    text: tx(
      'Tintoria e finissaggio: una pezza difettosa si ferma prima di consumare acqua, energia e prodotti chimici.',
      'Dyeing and finishing: a defective piece stops before it uses up water, energy and chemicals.',
    ),
  },
  {
    focus: 'controllo',
    text: tx(
      'Controllo finito: l’operatore decide, BrainTex non si stanca e prepara il report di ogni pezza.',
      'Final inspection: the operator decides, BrainTex never tires and prepares the report for every piece.',
    ),
  },
  {
    focus: 'uffici',
    text: tx(
      'Uffici e direzione: i dati di tutte le fasi arrivano nel cruscotto e diventano decisioni.',
      'Offices and management: data from every stage reaches the dashboard and becomes decisions.',
    ),
  },
  {
    focus: 'magazzino',
    text: tx(
      'Magazzino e spedizioni: ogni pezza parte con la sua mappa dei difetti.',
      'Warehouse and shipping: every piece leaves with its defect map.',
    ),
  },
  {
    focus: 'confezionista',
    text: tx(
      'Confezionista: il taglio evita i difetti, la resa sale e la fiducia nel fornitore cresce.',
      'Garment maker: cutting avoids the defects, yield goes up and trust in the supplier grows.',
    ),
  },
  {
    focus: null,
    text: tx(
      'Questa è la filiera intera. Usa l’interruttore per vederla senza e con BrainTex.',
      'This is the whole supply chain. Use the switch to see it without and with BrainTex.',
    ),
  },
];

// Catalogo dei benefici BrainTex (documento "Benefici BrainTex e simulatore", 27/11/2026).
// Non distingue benefici attuali e futuri. Niente euro, ROI o prezzi.
import type { Lang } from '../i18n';

export type AreaKey = 'produzione' | 'qualita' | 'macchine' | 'dati' | 'persone' | 'sostenibilita';
export type RoleKey =
  | 'direzione'
  | 'produzione'
  | 'pianificazione'
  | 'qualita'
  | 'manutenzione'
  | 'commerciale'
  | 'acquisti'
  | 'progettazione'
  | 'sostenibilita'
  | 'it'
  | 'operatori'
  | 'rammendo'
  | 'clienti'
  | 'confezionisti';

export interface Benefit {
  area: AreaKey;
  /** A chi interessa (colonna "Per chi" del documento). */
  roles: RoleKey[];
  text: Record<Lang, string>;
}

export const AREAS: Record<AreaKey, Record<Lang, string>> = {
  produzione: { it: 'Produzione', en: 'Production' },
  qualita: { it: 'Qualità e cliente', en: 'Quality and customers' },
  macchine: { it: 'Macchine e processo', en: 'Machines and process' },
  dati: { it: 'Dati e decisioni', en: 'Data and decisions' },
  persone: { it: 'Persone', en: 'People' },
  sostenibilita: { it: 'Sostenibilità e norme', en: 'Sustainability and regulations' },
};

export const ROLES: Record<RoleKey, Record<Lang, string>> = {
  direzione: { it: 'Direzione', en: 'Management' },
  produzione: { it: 'Produzione', en: 'Production' },
  pianificazione: { it: 'Pianificazione', en: 'Planning' },
  qualita: { it: 'Qualità', en: 'Quality' },
  manutenzione: { it: 'Manutenzione', en: 'Maintenance' },
  commerciale: { it: 'Commerciale', en: 'Sales' },
  acquisti: { it: 'Acquisti', en: 'Purchasing' },
  progettazione: { it: 'Progettazione', en: 'Design' },
  sostenibilita: { it: 'Sostenibilità', en: 'Sustainability' },
  it: { it: 'IT', en: 'IT' },
  operatori: { it: 'Operatori', en: 'Operators' },
  rammendo: { it: 'Rammendo', en: 'Mending' },
  clienti: { it: 'Clienti', en: 'Customers' },
  confezionisti: { it: 'Confezionisti', en: 'Garment makers' },
};

const b = (area: AreaKey, roles: RoleKey[], it: string, en: string): Benefit => ({
  area,
  roles,
  text: { it, en },
});

export const BENEFITS: Benefit[] = [
  // Produzione
  b('produzione', ['produzione', 'direzione'], 'Meno scarti e rilavorazioni', 'Less waste and rework'),
  b('produzione', ['produzione', 'manutenzione'],
    'Stop ai difetti continui: avviso o fermo prima che un guasto rovini metri su metri',
    'No more repeating defects: an alert or a stop before a fault ruins metre after metre'),
  b('produzione', ['produzione', 'sostenibilita'],
    'Nessuna lavorazione su tessuto già difettoso: non si nobilita una pezza da scartare',
    'No processing of fabric that is already defective: no finishing a piece that will be scrapped'),
  b('produzione', ['produzione', 'pianificazione'],
    'Controllo più veloce, niente colli di bottiglia, più capacità produttiva',
    'Faster inspection, no bottlenecks, more production capacity'),
  b('produzione', ['pianificazione', 'commerciale'],
    'Controllo del greggio integrato in macchina: un passaggio in meno, consegne più rapide',
    'Greige inspection built into the machine: one step less, faster deliveries'),
  b('produzione', ['pianificazione', 'acquisti'],
    'Meno metri prodotti "in più" per compensare lo scarto previsto',
    'Fewer extra metres produced to make up for expected waste'),
  b('produzione', ['commerciale', 'confezionisti'],
    'Mappe dei difetti compatibili con le macchine da taglio: piazzamento che evita i difetti, resa migliore, tessuto "pronto ago"',
    'Defect maps compatible with cutting machines: lay plans that avoid defects, better yield, sewing-ready fabric'),
  b('produzione', ['produzione'],
    'Nuovi articoli in meno di 2 minuti: lotti piccoli e variabili senza fermarsi',
    'New articles in less than 2 minutes: small, varied batches without stopping'),
  b('produzione', ['direzione', 'produzione'],
    'Rammendo affidabile anche all’esterno, pure all’estero: la mappa digitale dice dove intervenire',
    'Mending can be outsourced, even abroad: the digital map shows where to intervene'),
  // Qualità e cliente
  b('qualita', ['qualita'],
    'Controllo del 100% del tessuto, oggettivo e costante',
    'Inspection of 100% of the fabric, objective and consistent'),
  b('qualita', ['qualita'],
    'Difetti difficili: disegni complessi, jacquard, tessuti deformabili',
    'Difficult defects: complex patterns, jacquards, stretchable fabrics'),
  b('qualita', ['qualita', 'commerciale'],
    'Classe e gravità del difetto automatiche, bonifiche secondo il capitolato del cliente',
    'Automatic defect class and severity, allowances according to the customer’s specifications'),
  b('qualita', ['commerciale', 'direzione'],
    'Meno resi e contestazioni; quando arrivano si risponde con il report',
    'Fewer returns and claims; when they come, you answer with the report'),
  b('qualita', ['commerciale', 'clienti'],
    'Approvazione digitale prima della spedizione: il cliente vede report e immagini e approva, si evitano consegne e resi superflui',
    'Digital approval before shipping: the customer sees report and images and approves, avoiding needless deliveries and returns'),
  // Macchine e processo
  b('macchine', ['manutenzione'],
    'Manutenzione predittiva: difetti ripetuti rivelano usura e tarature',
    'Predictive maintenance: repeated defects reveal wear and calibration issues'),
  b('macchine', ['manutenzione', 'produzione'],
    'Meno guasti gravi: si interviene al segnale, non alla rottura',
    'Fewer major breakdowns: you act on the signal, not on the failure'),
  b('macchine', ['produzione', 'qualita'],
    'Correlazione tra qualità e parametri di processo (velocità, temperatura, tensione, ricetta, umidità): le cause si trovano con i dati',
    'Correlation between quality and process parameters (speed, temperature, tension, recipe, humidity): causes are found with data'),
  b('macchine', ['produzione'],
    'Derive lente del processo viste prima che diventino scarto',
    'Slow process drifts spotted before they turn into waste'),
  b('macchine', ['acquisti', 'qualita'],
    'Fornitori valutati con i dati: difetti collegati al lotto di filato, reclami documentati',
    'Suppliers assessed with data: defects linked to the yarn lot, documented claims'),
  // Dati e decisioni
  b('dati', ['qualita', 'commerciale'],
    'Tracciabilità di ogni pezza: storico, mappa dei difetti, immagini',
    'Traceability of every piece: history, defect map, images'),
  b('dati', ['direzione'],
    'Dove si perde qualità: per macchina, articolo, turno, fornitore',
    'Where quality is lost: by machine, article, shift, supplier'),
  b('dati', ['commerciale', 'direzione'],
    'Preventivi e tempi più accurati grazie alla difettosità reale di ogni articolo',
    'More accurate quotes and lead times thanks to the real defect rate of each article'),
  b('dati', ['progettazione'],
    'I dati di qualità tornano a chi progetta l’articolo, che sa quali strutture e filati danno più difetti',
    'Quality data flows back to designers, who learn which structures and yarns cause more defects'),
  b('dati', ['direzione', 'it'],
    'Integrazione con gestionale e sistemi aziendali; gemello digitale della produzione',
    'Integration with ERP and company systems; a digital twin of production'),
  b('dati', ['direzione'],
    'Investimenti mirati: si sa quale macchina rivedere o sostituire',
    'Targeted investments: you know which machine to overhaul or replace'),
  b('dati', ['commerciale', 'clienti'],
    'Filiera collegata: lo stesso dato dal greggio al confezionista',
    'A connected supply chain: the same data from greige fabric to garment maker'),
  b('dati', ['commerciale', 'qualita'],
    'Tessuto digitalizzato: ogni pezza ha le sue immagini, le controversie si risolvono in modo oggettivo',
    'Digitised fabric: every piece has its images, disputes are settled objectively'),
  b('dati', ['qualita', 'commerciale'],
    'Archivio digitale delle pezze, consultabile anche a distanza di anni',
    'A digital archive of pieces, available even years later'),
  // Persone
  b('persone', ['operatori'],
    'Lavoro meno logorante: meno stress fisico e visivo',
    'Less wearing work: less physical and visual strain'),
  b('persone', ['produzione', 'direzione'],
    'Persone riallocate su attività di maggior valore',
    'People moved to higher-value tasks'),
  b('persone', ['qualita', 'direzione'],
    'Know-how conservato: BrainTex impara dalle segnalazioni degli operatori esperti',
    'Know-how preserved: BrainTex learns from experienced operators’ feedback'),
  b('persone', ['produzione'],
    'Nuovi operatori operativi prima, meno dipendenza dal singolo esperto',
    'New operators up to speed sooner, less dependence on a single expert'),
  b('persone', ['direzione'],
    'Una risposta alla carenza di personale specializzato e al ricambio generazionale',
    'An answer to the shortage of skilled staff and generational turnover'),
  b('persone', ['direzione'],
    'Una fabbrica digitale più attrattiva per i giovani',
    'A digital factory that is more attractive to young people'),
  b('persone', ['rammendo', 'produzione'],
    'Rammendo guidato: la mappa porta dritti al difetto e i tutorial aiutano chi rammenda',
    'Guided mending: the map leads straight to the defect and tutorials help menders'),
  // Sostenibilità e norme
  b('sostenibilita', ['sostenibilita'],
    'Meno tessuto, acqua, energia e prodotti chimici sprecati',
    'Less wasted fabric, water, energy and chemicals'),
  b('sostenibilita', ['sostenibilita'],
    'Sistema a basso consumo: circa 300 W',
    'Low-consumption system: about 300 W'),
  b('sostenibilita', ['sostenibilita', 'direzione'],
    'Dati utili per il passaporto digitale di prodotto (ESPR) e le regole PEFCR',
    'Data useful for the Digital Product Passport (ESPR) and PEFCR rules'),
  b('sostenibilita', ['sostenibilita'],
    'Dati pronti per il bilancio di sostenibilità e le certificazioni',
    'Data ready for sustainability reporting and certifications'),
  b('sostenibilita', ['sostenibilita'],
    'Contributo agli obiettivi ESG (SDG 9, 12, 13, 17)',
    'A contribution to ESG goals (SDGs 9, 12, 13, 17)'),
];

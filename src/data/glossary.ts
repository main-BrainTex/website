// Glossario tessile e guida ai difetti: contenuti divulgativi, senza riferimenti a clienti
// né a ciò che il sistema BrainTex rileva o non rileva. Da far verificare a bt.
import type { Lang } from '../i18n';

type T = Record<Lang, string>;
const tx = (it: string, en: string): T => ({ it, en });

// ---- Guida ai difetti -------------------------------------------------------------------

export const DEFECT_PHASES = {
  tessitura: tx('Tessitura a telaio', 'Weaving'),
  maglieria: tx('Maglieria', 'Knitting'),
  nobilitazione: tx('Tintoria e finissaggio', 'Dyeing and finishing'),
};
export type DefectPhase = keyof typeof DEFECT_PHASES;

export interface DefectEntry {
  id: string;
  phase: DefectPhase;
  name: T;
  /** Altri nomi, anche di reparto. */
  aka: T;
  /** Come si riconosce. */
  look: T;
  /** Da dove nasce di solito. */
  cause: T;
}

export const DEFECTS: DefectEntry[] = [
  {
    id: 'trama-mancante',
    phase: 'tessitura',
    name: tx('Trama mancante', 'Mispick'),
    aka: tx('scarto di trama, trama rotta', 'missing pick, broken pick'),
    look: tx('Una riga sottile e più chiara in senso trasversale, da cimosa a cimosa o per un tratto.', 'A thin, lighter line across the fabric, from selvedge to selvedge or for a stretch.'),
    cause: tx('Il filo di trama si rompe o non viene inserito e il telaio continua a battere.', 'The weft yarn breaks or is not inserted and the loom keeps beating.'),
  },
  {
    id: 'doppia-trama',
    phase: 'tessitura',
    name: tx('Doppia trama', 'Double pick'),
    aka: tx('trama doppia', 'double filling'),
    look: tx('Una riga trasversale più spessa o più scura.', 'A thicker or darker line across the fabric.'),
    cause: tx('Due fili di trama finiscono nello stesso passo, di solito per un’inserzione irregolare.', 'Two weft yarns end up in the same shed, usually because of irregular insertion.'),
  },
  {
    id: 'filo-mancante',
    phase: 'tessitura',
    name: tx('Filo di ordito mancante', 'Missing end'),
    aka: tx('ordito rotto, filo rotto', 'broken end'),
    look: tx('Una riga in senso longitudinale, lungo la pezza, dove manca un filo.', 'A line running lengthwise along the piece where a yarn is missing.'),
    cause: tx('Un filo di ordito si rompe e non viene riannodato subito: il difetto si ripete per metri.', 'A warp yarn breaks and is not tied in straight away: the defect repeats for metres.'),
  },
  {
    id: 'filo-tirato',
    phase: 'tessitura',
    name: tx('Filo tirato', 'Pulled thread'),
    aka: tx('tirata, filo teso', 'snag, tight end'),
    look: tx('Un filo più teso degli altri che increspa il tessuto intorno.', 'A yarn tighter than the others that puckers the fabric around it.'),
    cause: tx('Tensione irregolare sul filo o un aggancio durante la lavorazione o la movimentazione.', 'Uneven yarn tension or a snag during processing or handling.'),
  },
  {
    id: 'nodo',
    phase: 'tessitura',
    name: tx('Nodo', 'Knot'),
    aka: tx('nodino, groppo', 'slub knot'),
    look: tx('Un piccolo rilievo puntiforme sulla superficie.', 'A small raised point on the surface.'),
    cause: tx('La giunta tra due fili, fatta in filatura o in tessitura, resta in vista.', 'The join between two yarns, made in spinning or weaving, remains visible.'),
  },
  {
    id: 'grossi',
    phase: 'tessitura',
    name: tx('Grossi e sottili', 'Thick and thin places'),
    aka: tx('ingrossamenti, irregolarità del filato', 'slubs, yarn unevenness'),
    look: tx('Tratti di filo più spessi o più fini che si notano come piccole irregolarità.', 'Thicker or thinner stretches of yarn that show up as small irregularities.'),
    cause: tx('Irregolarità del filato, nate in filatura.', 'Yarn unevenness that comes from spinning.'),
  },
  {
    id: 'barratura',
    phase: 'tessitura',
    name: tx('Barratura', 'Barré'),
    aka: tx('barré, bande trasversali', 'bars, filling bands'),
    look: tx('Bande trasversali di aspetto o colore leggermente diverso.', 'Bands across the fabric with a slightly different look or shade.'),
    cause: tx('Filati di lotti diversi, tensioni variabili o differenze di tintura.', 'Yarns from different lots, varying tension or dyeing differences.'),
  },
  {
    id: 'fermata',
    phase: 'tessitura',
    name: tx('Segno di fermata', 'Stop mark'),
    aka: tx('segno di ripartenza, avviamento', 'start mark, set mark'),
    look: tx('Una riga trasversale più fitta o più rada dove il telaio si è fermato.', 'A denser or thinner line across the fabric where the loom stopped.'),
    cause: tx('Alla ripartenza la battuta non torna subito uguale a prima.', 'On restart, the beat-up does not immediately return to what it was.'),
  },
  {
    id: 'fitto-rado',
    phase: 'tessitura',
    name: tx('Fitto e rado', 'Thick and thin places in weaving'),
    aka: tx('battuta irregolare, rado', 'uneven beat-up, thin place'),
    look: tx('Zone in cui le trame sono più vicine o più distanti del previsto.', 'Areas where the weft yarns are closer together or further apart than expected.'),
    cause: tx('Variazioni della battuta o della tensione dell’ordito.', 'Variations in beat-up or warp tension.'),
  },
  {
    id: 'flottante',
    phase: 'tessitura',
    name: tx('Flottante', 'Float'),
    aka: tx('salto, filo saltato', 'skip, jumped thread'),
    look: tx('Un filo che passa sopra a più fili del dovuto, senza legarsi all’armatura.', 'A yarn that passes over more yarns than it should, without binding into the weave.'),
    cause: tx('Licci o fili che non si aprono correttamente nel passo.', 'Heddles or yarns that do not open correctly in the shed.'),
  },
  {
    id: 'cimosa',
    phase: 'tessitura',
    name: tx('Difetto di cimosa', 'Selvedge defect'),
    aka: tx('cimosa tirata, cimosa lenta', 'tight or slack selvedge'),
    look: tx('Bordo ondulato, teso o irregolare.', 'A wavy, tight or irregular edge.'),
    cause: tx('Tensioni sbagliate ai bordi o fili di cimosa difettosi.', 'Wrong tension at the edges or faulty selvedge yarns.'),
  },
  {
    id: 'riga-ago',
    phase: 'maglieria',
    name: tx('Riga d’ago', 'Needle line'),
    aka: tx('ago rotto, riga verticale', 'needle mark, vertical line'),
    look: tx('Una riga verticale continua lungo tutta la maglia.', 'A continuous vertical line along the whole knit.'),
    cause: tx('Un ago rovinato o rotto lavora male a ogni giro: il difetto si ripete finché non lo si cambia.', 'A damaged or broken needle works badly on every revolution: the defect repeats until it is replaced.'),
  },
  {
    id: 'smagliatura',
    phase: 'maglieria',
    name: tx('Smagliatura', 'Dropped stitch'),
    aka: tx('maglia scappata, scala', 'ladder, run'),
    look: tx('Una maglia che si sfila e apre una scaletta nel tessuto.', 'A stitch that comes undone and opens a ladder in the fabric.'),
    cause: tx('La maglia non viene presa dall’ago, per tensione del filo o per un ago difettoso.', 'The needle fails to catch the stitch, because of yarn tension or a faulty needle.'),
  },
  {
    id: 'buco',
    phase: 'maglieria',
    name: tx('Buco', 'Hole'),
    aka: tx('foro', 'tear'),
    look: tx('Un’apertura nel tessuto, piccola o grande.', 'An opening in the fabric, small or large.'),
    cause: tx('Rotture del filo, aghi o parti metalliche danneggiate, urti nella movimentazione.', 'Yarn breaks, damaged needles or metal parts, knocks during handling.'),
  },
  {
    id: 'macchia',
    phase: 'nobilitazione',
    name: tx('Macchia', 'Stain'),
    aka: tx('macchia d’olio, untuosità', 'oil stain, grease mark'),
    look: tx('Una zona di colore o lucentezza diversa, dai contorni più o meno netti.', 'An area of different colour or sheen, with more or less sharp edges.'),
    cause: tx('Olio delle macchine, sporco, gocce di bagno o residui di prodotti.', 'Machine oil, dirt, drops of dye bath or chemical residues.'),
  },
  {
    id: 'differenza-tinta',
    phase: 'nobilitazione',
    name: tx('Differenza di tinta', 'Shade variation'),
    aka: tx('cimosa-centro, nuance diversa', 'listing, centre-to-selvedge shading'),
    look: tx('Il colore cambia tra cimosa e centro o tra inizio e fine pezza.', 'The colour changes between selvedge and centre, or between start and end of the piece.'),
    cause: tx('Assorbimento non uniforme del colorante o condizioni del bagno che cambiano.', 'Uneven dye uptake or changing bath conditions.'),
  },
  {
    id: 'piega',
    phase: 'nobilitazione',
    name: tx('Segno di piega', 'Crease mark'),
    aka: tx('piega fissata, sgualcitura', 'crease, rope mark'),
    look: tx('Linee o segni rimasti dopo la lavorazione, che non spariscono.', 'Lines or marks left after processing that do not go away.'),
    cause: tx('Il tessuto si piega o si attorciglia durante i trattamenti a umido o a caldo.', 'The fabric folds or twists during wet or heat treatments.'),
  },
  {
    id: 'trama-storta',
    phase: 'nobilitazione',
    name: tx('Trama storta', 'Bow and skew'),
    aka: tx('trama inclinata, arcuata', 'skewed or bowed filling'),
    look: tx('Le trame non sono più perpendicolari all’ordito: inclinate o ad arco.', 'The weft yarns are no longer perpendicular to the warp: slanted or arched.'),
    cause: tx('Trazioni non uniformi in rameuse o in altre macchine di finissaggio.', 'Uneven pulling on the stenter or other finishing machines.'),
  },
];

// ---- Glossario --------------------------------------------------------------------------

export const TERM_GROUPS = {
  filati: tx('Filati e tessitura', 'Yarns and weaving'),
  maglieria: tx('Maglieria', 'Knitting'),
  nobilitazione: tx('Nobilitazione', 'Finishing'),
  controllo: tx('Controllo e qualità', 'Inspection and quality'),
  confezione: tx('Confezione', 'Garment making'),
};
export type TermGroup = keyof typeof TERM_GROUPS;

export interface Term {
  id: string;
  group: TermGroup;
  term: T;
  /** Altri nomi, inglese o gergo di reparto (facoltativo). */
  aka?: T;
  def: T;
}

const term = (id: string, group: TermGroup, t: T, def: T, aka?: T): Term => ({ id, group, term: t, def, aka });

export const TERMS: Term[] = [
  term('ordito', 'filati', tx('Ordito', 'Warp'), tx('L’insieme dei fili che corrono per il lungo della pezza, montati sul telaio prima di tessere.', 'The set of yarns running along the length of the piece, mounted on the loom before weaving.')),
  term('trama', 'filati', tx('Trama', 'Weft'), tx('Il filo che attraversa l’ordito da una cimosa all’altra, un passaggio alla volta.', 'The yarn that crosses the warp from one selvedge to the other, one pass at a time.'), tx('', 'filling, pick')),
  term('armatura', 'filati', tx('Armatura', 'Weave'), tx('Il modo in cui ordito e trama si incrociano. Le tre fondamentali sono tela, saia e raso.', 'The way warp and weft cross each other. The three basic ones are plain, twill and satin.')),
  term('riduzione', 'filati', tx('Riduzione', 'Thread count'), tx('Quanti fili di ordito o di trama ci sono in un centimetro di tessuto.', 'How many warp or weft yarns there are in one centimetre of fabric.'), tx('densità', 'density, sett')),
  term('battuta', 'filati', tx('Battuta', 'Beat-up'), tx('Il colpo del pettine che accosta ogni trama alla precedente; da come è regolata dipende quanto il tessuto è fitto.', 'The stroke of the reed that pushes each weft yarn against the previous one; its setting decides how dense the fabric is.')),
  term('titolo', 'filati', tx('Titolo', 'Yarn count'), tx('Il numero che indica quanto è fine o grosso un filato.', 'The number that tells how fine or coarse a yarn is.')),
  term('rocca', 'filati', tx('Rocca', 'Cone'), tx('Il supporto su cui è avvolto il filato pronto per l’orditura o la tessitura.', 'The package on which yarn is wound, ready for warping or weaving.'), tx('', 'package')),
  term('orditura', 'filati', tx('Orditura', 'Warping'), tx('La preparazione dell’ordito: i fili vengono disposti affiancati e avvolti sul subbio.', 'Preparing the warp: the yarns are laid side by side and wound onto the beam.')),
  term('subbio', 'filati', tx('Subbio', 'Beam'), tx('Il grande cilindro su cui è avvolto l’ordito (o, a valle del telaio, il tessuto).', 'The large roller on which the warp (or, after the loom, the fabric) is wound.')),
  term('imbozzimatura', 'filati', tx('Imbozzimatura', 'Sizing'), tx('Il trattamento che riveste i fili di ordito per renderli più resistenti allo sfregamento in tessitura.', 'The treatment that coats warp yarns to make them withstand abrasion during weaving.'), tx('bozzima', 'size')),
  term('licci', 'filati', tx('Licci', 'Heddles'), tx('Gli elementi del telaio che alzano e abbassano i fili di ordito per aprire il passo in cui passa la trama.', 'The loom parts that raise and lower the warp yarns to open the shed for the weft.')),
  term('pettine', 'filati', tx('Pettine', 'Reed'), tx('Il pettine metallico che tiene in ordine i fili di ordito e dà la battuta.', 'The metal comb that keeps the warp yarns in order and beats up the weft.')),
  term('passo', 'filati', tx('Passo', 'Shed'), tx('L’apertura tra i fili di ordito alzati e abbassati, in cui viene inserita la trama.', 'The opening between raised and lowered warp yarns, where the weft is inserted.')),
  term('messa-in-carta', 'filati', tx('Messa in carta', 'Weave draft'), tx('Lo schema su quadretti che descrive come si incrociano i fili: è il progetto del tessuto.', 'The squared diagram describing how the yarns interlace: the blueprint of the fabric.')),
  term('pettinato-cardato', 'filati', tx('Pettinato e cardato', 'Worsted and woollen'), tx('Due modi di lavorare la lana: il pettinato dà filati lisci e regolari, il cardato filati più voluminosi e morbidi.', 'Two ways of processing wool: worsted gives smooth, even yarns, woollen gives bulkier, softer ones.')),
  term('melange', 'filati', tx('Mélange', 'Mélange'), tx('Effetto di colore ottenuto mescolando fibre tinte diversamente prima della filatura.', 'A colour effect obtained by blending differently dyed fibres before spinning.')),
  term('finezza', 'maglieria', tx('Finezza', 'Gauge'), tx('Quanti aghi ci sono in un’unità di lunghezza della frontura: indica quanto sarà fine la maglia.', 'How many needles there are per unit of length on the needle bed: it tells how fine the knit will be.')),
  term('circolare-rettilinea', 'maglieria', tx('Circolare e rettilinea', 'Circular and flat knitting'), tx('I due grandi tipi di macchine da maglieria: le circolari producono un tubolare continuo, le rettilinee lavorano su una frontura piana.', 'The two main kinds of knitting machine: circular ones make a continuous tube, flat ones work on a straight needle bed.')),
  term('greggio', 'nobilitazione', tx('Greggio', 'Greige'), tx('Il tessuto appena uscito dal telaio o dalla macchina, prima di tintura e finissaggio.', 'Fabric just off the loom or knitting machine, before dyeing and finishing.'), tx('pezza greggia', 'loomstate')),
  term('nobilitazione', 'nobilitazione', tx('Nobilitazione', 'Finishing'), tx('Tutte le lavorazioni che danno al tessuto colore, aspetto e mano finali: tintura, stampa, finissaggio.', 'All the processes that give fabric its final colour, look and handle: dyeing, printing, finishing.')),
  term('bagno', 'nobilitazione', tx('Bagno', 'Dye lot'), tx('La singola partita di tintura: pezze tinte in bagni diversi possono avere sfumature leggermente diverse.', 'A single dyeing batch: pieces dyed in different lots may have slightly different shades.'), tx('partita', 'batch')),
  term('rameuse', 'nobilitazione', tx('Rameuse', 'Stenter'), tx('La macchina che tiene il tessuto teso per le cimose mentre lo asciuga e lo porta all’altezza voluta.', 'The machine that holds the fabric by its selvedges while drying it and setting it to the required width.'), tx('ramosa', 'tenter')),
  term('follatura', 'nobilitazione', tx('Follatura', 'Fulling'), tx('Il trattamento con acqua, calore e azione meccanica che rende i tessuti di lana più compatti e morbidi.', 'The treatment with water, heat and mechanical action that makes woollen fabrics more compact and soft.'), tx('follone (la macchina)', 'milling')),
  term('garzatura', 'nobilitazione', tx('Garzatura', 'Raising'), tx('Fa emergere le fibre dalla superficie per ottenere un tessuto più morbido e caldo.', 'Lifts fibres out of the surface to make the fabric softer and warmer.'), tx('', 'napping')),
  term('cimatura', 'nobilitazione', tx('Cimatura', 'Shearing'), tx('Il taglio del pelo alla stessa altezza, per una superficie regolare.', 'Cutting the pile to an even height for a uniform surface.')),
  term('decatissaggio', 'nobilitazione', tx('Decatissaggio', 'Decatising'), tx('Il trattamento a vapore che stabilizza le dimensioni del tessuto e ne fissa l’aspetto.', 'The steam treatment that stabilises fabric dimensions and sets its appearance.'), tx('decatizzo', 'decating')),
  term('bruciapelo', 'nobilitazione', tx('Bruciapelo', 'Singeing'), tx('Il passaggio veloce su una fiamma che elimina le fibre sporgenti dalla superficie.', 'A quick pass over a flame that removes protruding fibres from the surface.'), tx('gasatura', 'gassing')),
  term('mano', 'nobilitazione', tx('Mano', 'Handle'), tx('Come si sente il tessuto al tatto: morbidezza, corpo, scorrevolezza.', 'How the fabric feels to the touch: softness, body, smoothness.'), tx('', 'hand')),
  term('pezza', 'controllo', tx('Pezza', 'Piece'), tx('Il singolo rotolo di tessuto, con il suo numero e la sua storia lungo la filiera.', 'A single roll of fabric, with its own number and history along the supply chain.'), tx('', 'roll')),
  term('altezza', 'controllo', tx('Altezza', 'Width'), tx('Nel tessile è la larghezza del tessuto da una cimosa all’altra.', 'In textiles, the Italian word “altezza” (height) means the fabric width from selvedge to selvedge.')),
  term('cimosa', 'controllo', tx('Cimosa', 'Selvedge'), tx('Il bordo laterale della pezza, spesso con fili più robusti o scritte.', 'The side edge of the piece, often with stronger yarns or lettering.'), tx('', 'selvage')),
  term('specola', 'controllo', tx('Specola', 'Inspection table'), tx('Il banco illuminato dove le pezze vengono controllate metro per metro prima della consegna.', 'The lit table where pieces are checked metre by metre before delivery.'), tx('', 'perching')),
  term('visita', 'controllo', tx('Visita', 'Inspection'), tx('Il controllo della pezza a vista, per trovare e segnare i difetti.', 'Visual checking of the piece to find and mark defects.'), tx('visitare una pezza', '')),
  term('rammendo', 'controllo', tx('Rammendo', 'Mending'), tx('La riparazione a mano dei difetti, fatta da rammendatrici esperte.', 'Hand repair of defects, done by skilled menders.')),
  term('spinzatura', 'controllo', tx('Spinzatura', 'Burling'), tx('La rimozione con pinzette di nodi, impurità e fili estranei dalla superficie del tessuto.', 'Removing knots, impurities and stray fibres from the fabric surface with tweezers.')),
  term('capitolato', 'controllo', tx('Capitolato', 'Quality specification'), tx('Le regole concordate con chi compra: quali difetti si accettano, quanti e come si segnalano.', 'The rules agreed with the buyer: which defects are accepted, how many and how they are reported.')),
  term('bonifica', 'controllo', tx('Bonifica', 'Allowance'), tx('I metri riconosciuti a chi compra per compensare i difetti presenti nella pezza.', 'The metres credited to the buyer to compensate for defects in the piece.'), tx('abbuono', 'credit')),
  term('seconda-scelta', 'controllo', tx('Seconda scelta', 'Seconds'), tx('Il tessuto declassato perché i difetti superano quanto previsto dal capitolato.', 'Fabric downgraded because its defects exceed what the specification allows.'), tx('declassato', 'downgraded')),
  term('piazzamento', 'confezione', tx('Piazzamento', 'Marker'), tx('La disposizione dei pezzi del capo sul tessuto prima del taglio, studiata per sprecare meno tessuto.', 'The layout of garment parts on the fabric before cutting, designed to waste as little fabric as possible.'), tx('', 'lay plan')),
  term('materasso', 'confezione', tx('Materasso', 'Lay'), tx('La pila di strati di tessuto stesi uno sull’altro per essere tagliati insieme.', 'The stack of fabric layers spread on top of each other to be cut together.'), tx('materassatura (la stesura)', 'spreading')),
  term('resa', 'confezione', tx('Resa', 'Fabric yield'), tx('Quanta parte del tessuto finisce davvero nei capi e quanta diventa scarto di taglio.', 'How much of the fabric actually ends up in garments and how much becomes cutting waste.')),
  term('scampolo', 'confezione', tx('Scampolo', 'Remnant'), tx('Il pezzo di tessuto avanzato, troppo corto per l’uso previsto.', 'The leftover piece of fabric, too short for its intended use.')),
];

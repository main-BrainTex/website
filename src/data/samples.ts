// Dati INVENTATI per il report e il cruscotto di esempio: nessun cliente, articolo o macchina reale.
import type { Lang } from '../i18n';

type Localized = Record<Lang, string>;
const tx = (it: string, en: string): Localized => ({ it, en });

export type Outcome = 'filtered' | 'shown' | 'alarm';

export const KIND_NAMES = {
  stain: tx('Macchia', 'Stain'),
  pull: tx('Filo tirato', 'Pulled thread'),
  knot: tx('Nodo', 'Knot'),
  weft: tx('Trama mancante', 'Missing weft'),
  hole: tx('Buco', 'Hole'),
};
export type Kind = keyof typeof KIND_NAMES;

export const PIECE = { length: 62.4, width: 150 };

interface Defect {
  /** Posizione lungo la pezza, in metri. */
  m: number;
  /** Distanza dalla cimosa sinistra, in centimetri. */
  cm: number;
  kind: Kind;
  outcome: Outcome;
  size?: string;
}

const knot = (m: number, cm: number): Defect => ({ m, cm, kind: 'knot', outcome: 'filtered' });

export const DEFECTS: Defect[] = [
  knot(2.1, 31), knot(5.8, 118), knot(9.4, 77), knot(12.7, 22), knot(16.3, 140), knot(19.9, 64), knot(22.5, 101),
  knot(26.8, 12), knot(29.2, 89), knot(36.4, 55), knot(41.0, 128), knot(46.7, 37), knot(52.3, 93), knot(58.9, 70),
  { m: 7.6, cm: 96, kind: 'stain', outcome: 'shown', size: '12 mm' },
  { m: 14.2, cm: 48, kind: 'pull', outcome: 'shown', size: '35 mm' },
  { m: 24.9, cm: 133, kind: 'stain', outcome: 'shown', size: '8 mm' },
  { m: 31.4, cm: 42, kind: 'weft', outcome: 'alarm', size: '110 mm' },
  { m: 32.0, cm: 43, kind: 'weft', outcome: 'alarm', size: '120 mm' },
  { m: 32.6, cm: 42, kind: 'weft', outcome: 'alarm', size: '115 mm' },
  { m: 38.5, cm: 71, kind: 'hole', outcome: 'shown', size: '4 mm' },
  { m: 49.1, cm: 109, kind: 'pull', outcome: 'shown', size: '28 mm' },
  { m: 55.6, cm: 26, kind: 'stain', outcome: 'shown', size: '10 mm' },
].sort((a, b) => a.m - b.m);

// Cruscotto di esempio
export const TREND = [5.2, 5.0, 5.3, 4.8, 4.6, 4.9, 4.1, 3.9, 3.6, 3.8, 3.3, 3.1]; // difetti ogni 100 m, per settimana

export const MACHINES = ['03', '05', '07', '11'];
export const HEAT_KINDS: Kind[] = ['knot', 'stain', 'pull', 'weft', 'hole'];
/** Difetti per macchina (righe) e classe (colonne), nell'ordine di HEAT_KINDS. */
export const HEAT = [
  [14, 6, 4, 1, 1],
  [12, 5, 9, 2, 0],
  [15, 4, 5, 11, 3],
  [13, 7, 3, 1, 1],
];

/** Ore dall'ultima manutenzione → difetti ogni 100 m. */
export const MAINTENANCE: [number, number][] = [
  [20, 2.6], [45, 2.9], [70, 2.5], [95, 3.0], [120, 2.8], [140, 3.1], [165, 2.7], [190, 3.2], [215, 3.0],
  [240, 3.3], [262, 3.1], [285, 3.6], [305, 4.2], [322, 4.6], [340, 5.3], [356, 5.1], [372, 6.0], [390, 6.4],
];

export const YARN_LOTS: [string, number][] = [
  ['L-21', 1.1],
  ['L-22', 0.9],
  ['L-23', 1.2],
  ['L-24', 3.4],
];

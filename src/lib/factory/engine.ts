// Motore della simulazione: ogni evento si applica a due giornate parallele, "senza" e "con BrainTex".
// L'interruttore sceglie quale delle due mostrare. Tutto gira nel browser con dati statici.
import { EVENTS, INDICATORS, type FactoryEvent, type IndicatorKey } from '../../data/factory';

export type Mode = 'without' | 'with';

export interface DayState {
  stoppedAtSource: number;
  stoppedAtInspection: number;
  reachedCustomer: number;
  /** Con BrainTex: metri salvati. Senza: metri persi. Valori di esempio. */
  meters: number;
  scrap: number;
  returns: number;
  queue: number;
  /** Livelli qualitativi da 0 a 4 (2 = di partenza). */
  levels: Record<IndicatorKey, number>;
}

const MAX_LEVEL = 4;
const START_LEVEL = 2;

const freshDay = (): DayState => ({
  stoppedAtSource: 0,
  stoppedAtInspection: 0,
  reachedCustomer: 0,
  meters: 0,
  scrap: 0,
  returns: 0,
  queue: 0,
  levels: Object.fromEntries(INDICATORS.map((i) => [i.key, START_LEVEL])) as Record<IndicatorKey, number>,
});

const clamp = (n: number) => Math.max(0, Math.min(MAX_LEVEL, n));

export interface SimDetail {
  event: FactoryEvent | null;
  mode: Mode;
}

export class FactorySim extends EventTarget {
  mode: Mode = 'with';
  /** Metri controllati: uguali nelle due giornate. */
  inspected = 0;
  days: Record<Mode, DayState> = { without: freshDay(), with: freshDay() };
  last: FactoryEvent | null = null;

  get day(): DayState {
    return this.days[this.mode];
  }

  setMode(mode: Mode) {
    this.mode = mode;
    this.emit('mode');
  }

  run(key: string) {
    const event = EVENTS.find((e) => e.key === key);
    if (!event) return;
    this.apply(event, 'without');
    this.apply(event, 'with');
    this.last = event;
    this.emit('event');
  }

  advance(metres: number) {
    this.inspected += metres;
    this.emit('tick');
  }

  reset() {
    this.days = { without: freshDay(), with: freshDay() };
    this.inspected = 0;
    this.last = null;
    this.emit('reset');
  }

  private apply(event: FactoryEvent, mode: Mode) {
    const day = this.days[mode];
    const good = mode === 'with';
    for (const key of event.indicators) {
      const lowerIsBetter = INDICATORS.find((i) => i.key === key)?.lowerIsBetter;
      day.levels[key] = clamp(day.levels[key] + ((good !== Boolean(lowerIsBetter)) ? 1 : -1));
    }
    const outcome = event.defect?.[mode];
    if (outcome === 'fonte') day.stoppedAtSource += 1;
    if (outcome === 'controllo') day.stoppedAtInspection += 1;
    if (outcome === 'confezionista') day.reachedCustomer += 1;
    if (event.meters) day.meters += event.meters;
    if (!good) {
      if (event.scrap) day.scrap += 1;
      if (event.returned) day.returns += 1;
      if (event.queue) day.queue += 1;
    }
  }

  private emit(type: string) {
    this.dispatchEvent(new CustomEvent<SimDetail>(type, { detail: { event: this.last, mode: this.mode } }));
  }
}

/** Parola per un livello qualitativo, senza mai mostrare numeri. */
export function levelWord(level: number, lang: 'it' | 'en'): string {
  const words = lang === 'it' ? ['Molto basso', 'Basso', 'Medio', 'Alto', 'Molto alto'] : ['Very low', 'Low', 'Medium', 'High', 'Very high'];
  return words[level];
}

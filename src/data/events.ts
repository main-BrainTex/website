// Fiere ed eventi in cui incontrare BrainTex, mostrati in "Parlano di noi".
// Elenco vuoto = la sezione invita a scriverci. Si aggiungono solo eventi confermati da bt; quelli passati spariscono da soli.
// Date verificate sui siti ufficiali il 28/11/2026.
import type { Lang } from '../i18n';

type Localized = Record<Lang, string>;

export interface EventItem {
  name: string;
  /** Data di inizio e di fine, formato AAAA-MM-GG. */
  start: string;
  end: string;
  place: Localized;
  /** Ci siamo come espositori o come visitatori. */
  role: 'exhibitor' | 'visitor';
  /** Padiglione e stand, quando si conoscono. */
  where?: Localized;
  url?: string;
}

export const EVENTS: EventItem[] = [
  {
    name: 'Milano Unica',
    start: '2027-02-02',
    end: '2027-02-04',
    place: { it: 'Fiera Milano, Rho', en: 'Fiera Milano, Rho (Milan)' },
    role: 'visitor',
    url: 'https://www.milanounica.it',
  },
  {
    name: 'Milano Unica',
    start: '2027-07-06',
    end: '2027-07-08',
    place: { it: 'Fiera Milano, Rho', en: 'Fiera Milano, Rho (Milan)' },
    role: 'visitor',
    url: 'https://www.milanounica.it',
  },
  {
    name: 'ITMA 2027',
    start: '2027-09-16',
    end: '2027-09-22',
    place: { it: 'Messegelände, Hannover (Germania)', en: 'Messegelände, Hannover (Germany)' },
    role: 'exhibitor',
    where: { it: 'Padiglione e stand in arrivo', en: 'Hall and stand to be announced' },
    url: 'https://itma.com',
  },
];

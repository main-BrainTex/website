// Fiere ed eventi in cui incontrare BrainTex, mostrati in "Parlano di noi".
// Elenco vuoto = la sezione invita a scriverci. Si aggiungono solo eventi confermati da bt; quelli passati spariscono da soli.
import type { Lang } from '../i18n';

type Localized = Record<Lang, string>;

export interface EventItem {
  name: string;
  /** Data di inizio e di fine, formato AAAA-MM-GG. */
  start: string;
  end: string;
  place: Localized;
  /** Padiglione e stand, o come ci si trova (facoltativo). */
  where?: Localized;
  url?: string;
}

export const EVENTS: EventItem[] = [];

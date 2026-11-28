// Posizioni aperte mostrate in "Lavora con noi".
// Elenco vuoto = la pagina invita alla candidatura spontanea. Una posizione si aggiunge solo su indicazione di bt.
import type { Lang } from '../i18n';

type Localized = Record<Lang, string>;

export interface Job {
  /** Identificativo breve, usato come ancora (es. "sviluppatore-backend"). */
  id: string;
  title: Localized;
  /** Area di lavoro (es. "Software e prodotto"). */
  area: Localized;
  /** Sede e modalità (es. "Biella, ibrido"). */
  place: Localized;
  summary: Localized;
}

export const JOBS: Job[] = [];

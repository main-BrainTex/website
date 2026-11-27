// Configurazione del sito: dati societari, numeri pubblicabili, ambiente di build.
// Valori letti in build (Node): non finiscono nel JS del browser salvo dove passati esplicitamente.

export const SITE = {
  origin: 'https://www.braintex.it',
  name: 'BrainTex',
  legalName: 'BrainTex srl',
  vat: '02789950033',
  rea: 'NO-317837',
  shareCapital: '22.222,22 €',
  shareCapitalFullyPaid: true,
  registry: 'Novara',
  foundingDate: '2024-11',
  legalSeat: 'Romagnano Sesia (NO)',
  operationalSeat: 'Biella',
  legalAddress: { street: 'Via Lamaccia, 11', postalCode: '28078', city: 'Romagnano Sesia', province: 'NO' },
  operationalAddress: { street: 'Via Pietro Micca, 4', postalCode: '13900', city: 'Biella', province: 'BI' },
  linkedin: 'https://www.linkedin.com/company/braintex-it',
  gaMeasurementId: 'G-MCRF25VPT6',
} as const;

// Numeri approvati per la pubblicazione. Aggiornare a mano metersInspected ogni mese.
export const STATS = {
  metersInspected: 4_000_000,
  minutesToLearnFabric: 2,
  wasteReductionPercent: 50,
} as const;

export type Address = { street: string; postalCode: string; city: string; province: string };

/** Indirizzo su una riga, es. "Via Lamaccia, 11, 28078 Romagnano Sesia (NO)". */
export const formatAddress = (a: Address) => `${a.street}, ${a.postalCode} ${a.city} (${a.province})`;

/** true solo per la build del sito pubblico (DEPLOY_TARGET=production). */
export const IS_PRODUCTION = process.env.DEPLOY_TARGET === 'production';

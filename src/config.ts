// Configurazione del sito: dati societari, numeri pubblicabili, ambiente di build.
// Valori letti in build (Node): non finiscono nel JS del browser salvo dove passati esplicitamente.

export const SITE = {
  origin: 'https://www.braintex.it',
  name: 'BrainTex',
  legalName: 'BrainTex srl',
  vat: '02789950033',
  rea: 'NO-317837',
  shareCapital: '22.222,22 €',
  foundingDate: '2024-11',
  legalSeat: 'Romagnano Sesia (NO)',
  operationalSeat: 'Biella',
  linkedin: 'https://www.linkedin.com/company/braintex-it',
  gaMeasurementId: 'G-MCRF25VPT6',
} as const;

// Numeri approvati per la pubblicazione. Aggiornare a mano metersInspected ogni mese.
export const STATS = {
  metersInspected: 4_000_000,
  minutesToLearnFabric: 2,
  wasteReductionPercent: 50,
} as const;

/** true solo per la build del sito pubblico (DEPLOY_TARGET=production). */
export const IS_PRODUCTION = process.env.DEPLOY_TARGET === 'production';

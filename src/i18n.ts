// Rotte bilingui: italiano alla radice, inglese sotto /en.
import { SITE } from './config';

export type Lang = 'it' | 'en';
export const LANGS: Lang[] = ['it', 'en'];

export const ROUTES = {
  home: { it: '/', en: '/en' },
  solution: { it: '/soluzione', en: '/en/solution' },
  factory: { it: '/fabbrica', en: '/en/factory' },
  benefits: { it: '/benefici', en: '/en/benefits' },
  about: { it: '/chi-siamo', en: '/en/about' },
  careers: { it: '/lavora-con-noi', en: '/en/careers' },
  investors: { it: '/investitori-e-partner', en: '/en/investors-partners' },
  press: { it: '/parlano-di-noi', en: '/en/press' },
  contact: { it: '/contatti', en: '/en/contact' },
  faq: { it: '/domande-frequenti', en: '/en/faq' },
  privacy: { it: '/privacypolicy-braintex', en: '/en/privacy-policy' },
  cookies: { it: '/cookie-policy', en: '/en/cookie-policy' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof ROUTES;

/** Antepone il percorso base (es. /website in anteprima). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path === '/') return base ? `${base}/` : '/';
  return `${base}${path}`;
}

/** Link interno a una pagina nella lingua data. */
export function href(key: RouteKey, lang: Lang): string {
  return withBase(ROUTES[key][lang]);
}

/** URL canonico assoluto, sempre su www.braintex.it. */
export function canonical(key: RouteKey, lang: Lang): string {
  return `${SITE.origin}${ROUTES[key][lang]}`;
}

export const UI = {
  it: {
    skip: 'Vai al contenuto',
    menu: 'Menu',
    mainNav: 'Navigazione principale',
    langSwitch: 'English',
    langSwitchLabel: 'Read in English',
    nav: {
      solution: 'Soluzione',
      factory: 'La fabbrica',
      benefits: 'Benefici',
      about: 'Chi siamo',
      careers: 'Lavora con noi',
      investors: 'Investitori e partner',
      press: 'Parlano di noi',
      contact: 'Contatti',
      faq: 'Domande frequenti',
    },
    logoPlaceholder: 'Segnaposto logo: in attesa del file vettoriale ufficiale',
    footer: {
      fse: 'Realizzato con il finanziamento del Fondo Sociale Europeo Plus',
      ngeu: "Finanziato dall'Unione europea – NextGenerationEU",
      funderLogos: 'Loghi dei finanziatori',
      legalSeat: 'Sede legale',
      operationalSeat: 'Sede operativa',
      taxVat: 'C.F. e P.IVA',
      registry: 'Registro Imprese di',
      capital: 'Capitale sociale',
      paidUp: 'i.v.',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      cookiePrefs: 'Preferenze cookie',
      follow: 'Seguici su LinkedIn',
    },
  },
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    mainNav: 'Main navigation',
    langSwitch: 'Italiano',
    langSwitchLabel: 'Leggi in italiano',
    nav: {
      solution: 'Solution',
      factory: 'The factory',
      benefits: 'Benefits',
      about: 'About us',
      careers: 'Careers',
      investors: 'Investors & partners',
      press: 'Press',
      contact: 'Contact',
      faq: 'FAQ',
    },
    logoPlaceholder: 'Logo placeholder: awaiting the official vector file',
    footer: {
      fse: 'Realizzato con il finanziamento del Fondo Sociale Europeo Plus',
      ngeu: "Finanziato dall'Unione europea – NextGenerationEU",
      funderLogos: 'Funders’ logos',
      legalSeat: 'Registered office',
      operationalSeat: 'Operational site',
      taxVat: 'Tax code and VAT no.',
      registry: 'Companies Register of',
      capital: 'Share capital',
      paidUp: 'fully paid',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      cookiePrefs: 'Cookie preferences',
      follow: 'Follow us on LinkedIn',
    },
  },
} as const;

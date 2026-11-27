// Google Analytics 4 con Google Consent Mode v2.
// GA si carica solo: (1) nella build di produzione (attributo data-ga su <html>),
// (2) su www.braintex.it / braintex.it, (3) dopo il consenso esplicito dell'utente.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export type Choice = 'granted' | 'denied';

const STORAGE_KEY = 'bt-consent-v1';
const PRODUCTION_HOSTS = ['www.braintex.it', 'braintex.it'];

const gaId = document.documentElement.dataset.ga;
const enabled = Boolean(gaId) && PRODUCTION_HOSTS.includes(location.hostname);
let loaded = false;

export function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Archiviazione non disponibile: la scelta vale solo per questa pagina.
  }
}

function initConsentMode() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js richiede l'oggetto arguments, non un array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

function loadGa() {
  if (!enabled || loaded) return;
  loaded = true;
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.append(script);
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

function removeGaCookies() {
  const domains = ['', location.hostname, `.${location.hostname.replace(/^www\./, '')}`];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

/** Registra la scelta dell'utente e applica il consenso. */
export function setChoice(choice: Choice) {
  saveChoice(choice);
  if (!enabled) return;
  if (choice === 'granted') {
    loadGa();
  } else {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
    removeGaCookies();
  }
}

/** Invia un evento a GA4 solo se GA è attivo (consenso dato). */
export function track(event: string, params: Record<string, string> = {}) {
  if (loaded) window.gtag('event', event, params);
}

if (enabled) {
  initConsentMode();
  if (readChoice() === 'granted') loadGa();
}

// Click su telefono, email o WhatsApp tracciati come evento.
document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a[href]');
  if (!link) return;
  const url = link.getAttribute('href') ?? '';
  const method = url.startsWith('tel:')
    ? 'phone'
    : url.startsWith('mailto:')
      ? 'email'
      : /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url)
        ? 'whatsapp'
        : null;
  if (method) track('contact_click', { method });
});

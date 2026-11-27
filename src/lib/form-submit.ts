// UNICO punto di invio dei messaggi del sito.
// Servizio attuale: Web3Forms (piano gratuito), recapito ad account@braintex.it.
// Per cambiare servizio basta riscrivere questo file mantenendo la stessa funzione esportata.

const ENDPOINT = 'https://api.web3forms.com/submit';
// Chiave pubblica legata alla casella di destinazione: arriva dalla variabile di build, mai dal codice.
const ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

export interface ContactMessage {
  name: string;
  email: string;
  /** Etichetta leggibile del pubblico ("Cliente", "Candidato"…), finisce nell'oggetto. */
  audience: string;
  company: string;
  link: string;
  message: string;
  lang: string;
  /** Campo trappola per i bot: se compilato, il messaggio viene scartato. */
  honeypot: boolean;
}

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' };

export async function sendContactMessage(msg: ContactMessage): Promise<SendResult> {
  if (!ACCESS_KEY) return { ok: false, reason: 'not-configured' };
  if (msg.honeypot) return { ok: true }; // finge il successo con i bot, senza inviare nulla

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `[braintex.it] ${msg.audience} – ${msg.name}`,
        from_name: 'Sito braintex.it',
        name: msg.name,
        email: msg.email,
        'Chi sei': msg.audience,
        Azienda: msg.company || '—',
        'LinkedIn / portfolio': msg.link || '—',
        Messaggio: msg.message,
        Lingua: msg.lang,
        botcheck: false,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return res.ok && data.success ? { ok: true } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

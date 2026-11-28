// UNICO punto di invio dei messaggi del sito.
// Servizio attuale: SimplyForms (server in Germania, inoltra il messaggio ad account@braintex.it senza conservarlo).
// Per cambiare servizio basta riscrivere questo file mantenendo la stessa funzione esportata.

// Identificativo pubblico del modulo (non è un segreto): arriva dalla variabile di build, mai dal codice.
const FORM_ID = import.meta.env.PUBLIC_FORM_ID as string | undefined;
const ENDPOINT = `https://api.simplyforms.app/v1/forms/${FORM_ID}`;

export interface ContactMessage {
  name: string;
  email: string;
  /** Etichetta leggibile del pubblico ("Cliente", "Candidato"…), finisce nell'oggetto. */
  audience: string;
  company: string;
  link: string;
  message: string;
  /** Campi in più per fornitori e agenti (etichetta → valore); quelli vuoti non vengono inviati. */
  details: Record<string, string>;
  lang: string;
  /** Campo trappola per i bot: se compilato, il messaggio viene scartato. */
  honeypot: boolean;
}

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' };

export async function sendContactMessage(msg: ContactMessage): Promise<SendResult> {
  if (!FORM_ID) return { ok: false, reason: 'not-configured' };
  if (msg.honeypot) return { ok: true }; // finge il successo con i bot, senza inviare nulla

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        // "subject" e "from_name" sono campi speciali del servizio; "email" diventa il Reply-To.
        subject: `[braintex.it] ${msg.audience} – ${msg.name}`,
        from_name: 'Sito braintex.it',
        name: msg.name,
        email: msg.email,
        'Chi sei': msg.audience,
        Azienda: msg.company || '—',
        'Link (profilo, sito o catalogo)': msg.link || '—',
        ...Object.fromEntries(Object.entries(msg.details).filter(([, value]) => value)),
        Messaggio: msg.message,
        Lingua: msg.lang,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return res.ok && data.success ? { ok: true } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

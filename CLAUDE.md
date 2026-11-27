# CLAUDE.md — sito braintex.it

Regole permanenti del progetto. Valgono in ogni sessione, anche se non vengono ricordate.
**Se una richiesta va contro queste regole, va segnalato PRIMA di procedere** e si aspetta conferma.

## Obiettivo
Nuovo sito statico di BrainTex srl (oggi su Wix, www.braintex.it): veloce, statico, semplice da mantenere.
Punto di partenza: contenuti del sito attuale. Decisione (27/11/2026): struttura multipagina nuova
(Home, Soluzione, Chi siamo, Lavora con noi, Investitori e partner, Parlano di noi, Contatti, Privacy, Cookie),
mantenendo gli URL esistenti `/` e `/privacypolicy-braintex`. Italiano (default, alla radice) e inglese (`/en/`);
i testi inglesi sono bozze da far approvare. I testi li approva solo bt.

Fase attuale: solo progettazione e anteprima. Il sito Wix resta online; il dominio non si tocca.

## Branch: dev e main
- `main` = versione approvata (in futuro il sito pubblico). `dev` = lavoro e anteprima.
- Prima di ogni modifica: verificare di essere su `dev` e che sia aggiornato (`git fetch` + pull). Se si è su `main`, passare a `dev` prima di toccare file.
- Commit e push **sempre e solo su `dev`**. Mai commit o push diretti su `main`, nemmeno per piccole correzioni.
- Dopo ogni push su `dev`: attendere che l'anteprima GitHub Pages sia aggiornata (workflow completato) e dare a bt il link.
- Merge `dev` → `main` **solo** quando bt dice esplicitamente "ok pubblica" (o equivalente). Nel dubbio, chiedere.
  Dopo il merge tornare su `dev` e riallinearlo a `main`.
- Se qualcosa va storto: proporre il `git revert` del commit responsabile.

## Anteprima su GitHub Pages
- Workflow GitHub Actions: a ogni push su `dev` compila e pubblica su Pages (`https://main-braintex.github.io/website/`).
- Percorso base gestito con la variabile di build `BASE_PATH` (`/website/` in anteprima, `/` in produzione), così lo stesso codice funziona alla radice di www.braintex.it.
- `DEPLOY_TARGET=preview` in anteprima: `<meta name="robots" content="noindex, nofollow">`, robots.txt che blocca tutto, Google Analytics escluso.
- Le impostazioni GitHub (Settings > Pages con sorgente "GitHub Actions", permesso a `dev` nell'environment `github-pages`) le fa bt: spiegargliele passo per passo.

## Commit
- Piccoli e atomici: una sola modifica logica per commit, annullabile con `git revert` senza toccare altro.
- Messaggi chiari in italiano, all'indicativo (es. "Aggiunge form contatti", "Rimuove CSS slider non usato").

## Codice pulito
- Niente codice inutile: ciò che smette di essere usato (componenti, CSS, JS, immagini, dipendenze, file) si rimuove subito, nello stesso commit della modifica che lo rende inutile.
- Niente librerie pesanti se basta poco codice. Pochissime dipendenze, tutte ospitate con il sito (font e librerie comprese), tenute aggiornate.
- Mai committare chiavi segrete, token o password. `.gitignore` adeguato; valori di configurazione tramite variabili di build / variabili GitHub.

## SEO
- HTML semantico, `lang` corretto ("it" / "en"), un solo `h1` per pagina, gerarchia dei titoli corretta.
- Title e meta description unici per pagina; canonical sempre su `https://www.braintex.it` (dominio canonico scelto: con www); Open Graph; hreflang IT/EN.
- `sitemap.xml` e `robots.txt` riferiti a www.braintex.it, generati in build dall'elenco pagine (sempre aggiornati).
- JSON-LD Organization (e LocalBusiness quando ci saranno gli indirizzi completi).
- `alt` su tutte le immagini; immagini ottimizzate (WebP/AVIF, dimensioni corrette, lazy loading).
- Ottime Core Web Vitals, responsive, accessibile (contrasto AA, tastiera, "riduci movimento"). Pagina 404 personalizzata.

## Google Analytics
- GA4, ID di misurazione `G-MCRF25VPT6` (proprietà 227207275). Attivo solo su www.braintex.it / braintex.it, mai sull'anteprima github.io (controllo in build e a runtime sull'hostname).
- GDPR: banner cookie leggero, Google Consent Mode v2 (default "denied"), GA caricato solo dopo il consenso. Scelta revocabile dal footer.
- Eventi: invio del form contatti; click su telefono/email/WhatsApp se presenti (oggi solo form + LinkedIn).
- Pagine Privacy Policy e Cookie Policy: testi base da far verificare.

## Form contatti
- Destinatario: account@braintex.it, tramite servizio esterno gratuito senza server e senza branding (Web3Forms; piano free: 250 invii/mese, niente upload file).
- Chiave di accesso fornita come variabile di build (`PUBLIC_WEB3FORMS_KEY`, variabile GitHub), mai scritta nel codice.
- Invio isolato in un solo modulo (`src/lib/form-submit.ts`): per cambiare servizio si cambia solo lì.
- Anti-spam: honeypot + filtri del servizio. Niente captcha di terze parti (nessuno script esterno oltre a GA).
- Validazione campi, messaggi chiari di conferma/errore, checkbox consenso privacy, campo "Chi sei?" che finisce nell'oggetto.

## Vincoli di contenuto (fatti da rispettare)
- Nessun riferimento ai clienti: niente nomi, loghi o casi riconoscibili.
- Nessun dettaglio tecnico riservato: niente numero o tipo di telecamere, LED e angoli, fornitori, schemi hardware. Hardware sempre stilizzato e generico ("unità di ispezione").
- Stato macchine: specola e controllo finito "validato in produzione"; telaio "in validazione tecnologica"; altre macchine "su richiesta / da valutare".
- Brevetto: solo "domanda di brevetto depositata".
- Numeri pubblicabili: oltre 4 milioni di metri ispezionati (valore in configurazione, aggiornato a mano); meno di 2 minuti per imparare un nuovo tessuto; oltre il 50% di scarti e rilavorazioni in meno. Altri numeri solo se approvati.
- Dati clienti: "i modelli sono addestrati per ogni singolo cliente e non vengono usati per altre aziende; il trattamento di immagini e dati è definito nel contratto".
- Footer obbligatorio in tutte le lingue, con i loghi: "Realizzato con il finanziamento del Fondo Sociale Europeo Plus" e "Finanziato dall'Unione europea – NextGenerationEU".
- Dati societari: BrainTex srl · P.IVA 02789950033 · REA NO-317837 · Capitale sociale 22.222,22 €. Sede legale Romagnano Sesia (NO), sede operativa Biella.
- Nessuna posizione aperta: solo candidatura spontanea.
- Contatti pubblici: solo form + LinkedIn (nessuna email in chiaro).
- Non usare l'articolo di Industria Italiana sul Premio MICS.

## Brand
- Font Metropolis (Regular, Bold, Italic), self-hosted woff2 in `src/assets/fonts` (pubblico dominio, Unlicense).
- Palette: verdi #9CED40 #30A016; azzurri #57F0FE #35D2F3 #169FCC; blu #1373A8 #00355D.
- Tema scuro su base #00355D (variante più profonda per gli sfondi); azzurri per evidenziare, verdi per "difetto trovato"/esito positivo; logo bianco su scuro.
- Logo: usare solo il vettoriale ufficiale fornito da bt (non ricostruirlo). Finché manca: segnaposto ben segnalati.

## Sicurezza
- Nessuna parte lato server, nessun CMS. Simulatori/contatori/3D girano solo nel browser con dati statici: mai collegarsi a sistemi interni, flotta o VPN.
- Nessuno script di terze parti oltre a GA (dopo consenso). Header di sicurezza (CSP, HSTS, ecc.) quando l'hosting lo permette.

## Interventi di bt
Per tutto ciò che non si può fare da qui (account, chiavi, impostazioni GitHub/Google/servizio email): fermarsi e spiegare passo per passo.

## Comandi
- `npm ci` installa le dipendenze · `npm run dev` sviluppo locale · `npm run build` compila in `dist/` · `npm run preview` serve la build.
- Variabili di build (vedi `.env.example`): `BASE_PATH`, `DEPLOY_TARGET` (`production` solo per il sito pubblico), `PUBLIC_WEB3FORMS_KEY`.

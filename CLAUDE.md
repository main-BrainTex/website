# CLAUDE.md — sito braintex.it

Regole permanenti del progetto. Valgono in ogni sessione, anche se non vengono ricordate.
**Se una richiesta va contro queste regole, va segnalato PRIMA di procedere** e si aspetta conferma.

## Obiettivo
Nuovo sito statico di BrainTex srl (oggi su Wix, www.braintex.it): veloce, statico, semplice da mantenere.
Punto di partenza: contenuti del sito attuale. Decisione (27/11/2026): struttura multipagina nuova
(Home, Soluzione, Benefici, Chi siamo, Lavora con noi, Investitori e partner, Parlano di noi, Contatti, Privacy, Cookie, più la pagina della fabbrica 3D),
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
- Banner conforme alle Linee guida cookie del Garante: Accetta e Rifiuta con pari evidenza, "X" che chiude senza consenso con l'avvertenza esplicita, scelta richiesta di nuovo dopo 6 mesi.
- Eventi: invio del form contatti; click su telefono/email/WhatsApp se presenti (oggi solo form + LinkedIn).
- Pagine Privacy Policy e Cookie Policy: testi base da far verificare.

## Form contatti
- Destinatario: account@braintex.it, tramite servizio esterno senza server e senza branding.
- Servizio scelto (27/11/2026): SimplyForms (ditta individuale, Rep. Ceca; server Hetzner in Germania; inoltra senza conservare, max 5 giorni in coda SMTP; DPA accettato alla registrazione). Web3Forms scartato: gestore in India, messaggi conservati fino a 3 anni, anti-spam negli USA. Il servizio va documentato nella Privacy Policy.
- Piano gratuito SimplyForms: 1 dominio, 1 modulo, 250 email/mese, 50 invii/giorno; anti-spam solo limite di frequenza (più il nostro honeypot); mittente "via SimplyForms" nella casella. Al passaggio in produzione il dominio va cambiato da github.io a www.braintex.it (o piano a pagamento).
- Identificativo del modulo come variabile di build `PUBLIC_FORM_ID` (variabile GitHub): è pubblico per natura ma non va scritto nel codice.
- Invio isolato in un solo modulo (`src/lib/form-submit.ts`): per cambiare servizio si cambia solo lì.
- Anti-spam: honeypot + filtri del servizio. Niente captcha di terze parti (nessuno script esterno oltre a GA).
- Validazione campi, messaggi chiari di conferma/errore, campo "Chi sei?" che finisce nell'oggetto.
- Decisione (28/11/2026): "Chi sei?" comprende anche confezionista/brand, controllo qualità conto terzi, IT provider/software house, fornitore e agente di commercio. Per fornitori e agenti compaiono pochi campi in più, solo quelli utili a valutare la proposta (fornitore: cosa propone, categoria, sito; agente: zone, settori, mandati attuali). Niente allegati.
- Decisione (28/11/2026): voce "Proposta di progetto" (bandi, co-sviluppo, ricerca) con tipo e scadenza facoltativa. Il form accetta `?chi=` (pubblico), `?tema=` (messaggio di partenza: presentazione, call, fattibilita) e `?domanda=` (messaggio libero già scritto: dall'assistente FAQ o dal pulsante "Fissiamo un incontro" delle fiere).
- Prenotazione di una call (decisione 28/11/2026): solo un link a Cal.com che compare dopo l'invio del form, e solo per aziende tessili, controlli conto terzi e confezionisti. Niente calendario incorporato né script esterni. URL nella variabile di build `PUBLIC_BOOKING_URL` (variabile GitHub); senza variabile il link non compare. Cal.com (USA, EU-US Data Privacy Framework) è indicato nella Privacy Policy.
- GDPR: la base giuridica per rispondere non è il consenso. Casella obbligatoria di sola presa visione ("Ho letto l'informativa privacy"), informativa breve sotto il pulsante (titolare, finalità, conservazione, link) e avviso di non inserire dati sensibili. Raccogliere solo i dati necessari.

## Vincoli di contenuto (fatti da rispettare)
- Nessun riferimento ai clienti: niente nomi, loghi o casi riconoscibili.
- Nessun dettaglio tecnico riservato: niente numero o tipo di telecamere, LED e angoli, fornitori, schemi hardware. Hardware sempre stilizzato e generico ("unità di ispezione").
- Fasi in cui si applica BrainTex: tessitura (maglieria e telai), finissaggio (rameuse, lavaggio), controllo del greggio, controllo finito (specola), controllo in accettazione per chi riceve il tessuto (es. confezionisti; aggiunto il 28/11/2026). Decisione (27/11/2026): NON indicare cosa è pronto e cosa è in sviluppo; i dettagli si discutono con il cliente.
- Brevetto: solo "domanda di brevetto depositata".
- Numeri pubblicabili: oltre 4 milioni di metri ispezionati (valore in configurazione, aggiornato a mano); meno di 2 minuti per imparare un nuovo articolo; oltre il 50% di scarti e rilavorazioni in meno; velocità di ispezione circa 2,5 volte quella manuale, fino a 1 m/s; assorbimento di circa 300 W. Altri numeri solo se approvati.
- Statistiche di settore solo con la fonte originale verificata e linkata accanto al dato.
- Nessuna prestazione economica: niente risparmi in euro, ROI, payback, prezzi, modello di business, casi reali con numeri (permetterebbero di dedurre il prezzo). Niente percentuali di accuratezza non approvate. Niente nomi delle linee di prodotto.
- Norme ambientali: citare il passaporto digitale di prodotto (ESPR) e le PEFCR con formula prudente ("dati utili per…", non "pronti per…"). Non citare la Green Claims Directive (proposta che la Commissione ha annunciato di ritirare).
- Questo file è nel repository: se il repository diventa pubblico è leggibile da tutti, quindi qui non vanno scritte informazioni riservate.
- Dati clienti: "i modelli sono addestrati per ogni singolo cliente e non vengono usati per altre aziende; il trattamento di immagini e dati è definito nel contratto".
- Footer obbligatorio in tutte le lingue, con i loghi: "Realizzato con il finanziamento del Fondo Sociale Europeo Plus" e "Finanziato dall'Unione europea – NextGenerationEU".
- Dati societari (art. 2250 c.c., sempre nel footer): BrainTex srl · Sede legale Via Lamaccia 11, 28078 Romagnano Sesia (NO) · Sede operativa Via Pietro Micca 4, 13900 Biella (BI) · C.F. e P.IVA 02789950033 · Registro Imprese di Novara · REA NO-317837 · Capitale sociale 22.222,22 € i.v.
- Lavora con noi (decisione 28/11/2026): spazio "Posizioni aperte" sempre presente, alimentato da `src/data/jobs.ts`; se l'elenco è vuoto (oggi lo è) mostra l'invito alla candidatura spontanea. Aree tecniche e business in card espandibili con esempi di attività (esempi, non offerte). Sezione dedicata ad agenti di commercio e rappresentanti. Una posizione si pubblica solo su indicazione di bt.
- Pubblici oltre alle aziende tessili (decisione 28/11/2026): confezionisti e brand (anche come partner: possono chiedere ai fornitori uno standard di controllo); controlli qualità conto terzi (messaggio dedicato: benessere degli operatori, velocità, capacità produttiva); IT provider e software house, soprattutto ERP e MES; fornitori (proposte solo tramite form).
- Assistenza (decisione 28/11/2026): niente chat esterna, niente WhatsApp. Assistente FAQ in tutte le pagine (`FaqAssistant.astro`), che gira solo nel browser, cerca tra le FAQ di `src/data/faq.ts` e se non trova la risposta porta al form con la domanda già scritta. Pagina "Domande frequenti" con JSON-LD FAQPage. Le FAQ contengono solo fatti già approvati.
- Contatti pubblici: solo form + LinkedIn (nessuna email in chiaro), salvo il recapito del titolare richiesto per legge nella Privacy Policy (info@braintex.it, confermato da bt il 28/11/2026).
- Non usare l'articolo di Industria Italiana sul Premio MICS.
- Glossario tessile (decisione 28/11/2026): pagina con guida ai difetti per fase (nomi, altri nomi anche di reparto, come si riconoscono, da dove nascono) e glossario apribile con ricerca, dati in `src/data/glossary.ts`. Contenuto divulgativo: mai dire quali difetti BrainTex rileva o no. In fondo l'invito a suggerire parole mancanti o nomi diversi (form con `?tema=glossario`).
- Sostenibilità (decisione 28/11/2026): pagina dedicata con dati di settore solo da fonti originali linkate accanto al dato (Agenzia europea dell'ambiente, studi scientifici), punti in cui BrainTex riduce lo spreco e stima di ordine di grandezza (acqua ed elettricità di tintura e finissaggio della lana per i metri fermati prima, fattori medi da uno studio su 150 aziende). Niente CO2 per metro finché non c'è un fattore con fonte adatta. ESPR e PEFCR solo con "dati utili per".
- Eventi e fiere (decisione 28/11/2026): sezione "Dove incontrarci" in Parlano di noi, alimentata da `src/data/events.ts` (solo eventi confermati da bt; quelli conclusi spariscono alla build successiva); se vuota invita a fissare un incontro. Per ogni fiera: date verificate sul sito ufficiale, espositori o visitatori, pulsante per fissare un incontro. Confermati: ITMA 2027 Hannover (espositori), Milano Unica febbraio e luglio 2027 (visitatori). Niente barra promozionale in cima alle pagine.
- Chi siamo (decisione 28/11/2026): tappe della storia, valori e reti di cui BrainTex fa parte (Assintel, InnovUp, Po.In.Tex, MICS), con loghi segnaposto finché non arrivano quelli ufficiali.
- Consegna e assistenza (decisione 28/11/2026): si pubblicano solo le fasi (analisi di fattibilità con sopralluogo, progettazione e analisi funzionale con valutazione di estensioni, installazione e attivazione, onboarding in loco e da remoto con affiancamento, assistenza e ascolto continui), mai i tempi: si definiscono nell'analisi di fattibilità. Progetti su misura: di norma no, ma si può fare richiesta; se in linea con la visione si valuta con un'analisi di fattibilità.
- Niente strisce di numeri in evidenza (decisione 28/11/2026): i numeri pubblicabili compaiono solo dentro le frasi, dove spiegano qualcosa (Soluzione, FAQ, storia); i metri ispezionati restano per gli investitori e nella storia in Chi siamo.
- Niente conteggi superflui o dettagli interni in pagina (decisione 28/11/2026): non si indica quanti sono i benefici o gli eventi; nessun commento HTML nel sito pubblicato; della tecnologia si dice solo "sistema di visione", senza descrivere telecamere o modalità di acquisizione.

## Esperienza interattiva
- Home leggera: racconto a scorrimento in 2D (CSS/SVG). La fabbrica 3D vive su una pagina dedicata e three.js si carica solo dopo "Entra in fabbrica", con alternativa 2D (mobile, niente WebGL, "riduci movimento"); i contenuti di ogni fase esistono anche come testo HTML.
- Simulatore = la fabbrica 3D stessa: azienda intera (linea + manutenzione, qualità, commerciale e direzione, magazzino e spedizioni, confezionista, ambiente), interruttore sempre visibile "senza / con BrainTex", eventi per fase con catene di conseguenze verso i reparti. Modalità demo pubblica a schermo intero ("Esplora la simulazione completa"): turno accelerato, eventi a scelta, lente per ruolo, pannello indicatori. Versione 2D per mobile, dispositivi lenti e "riduci movimento". Solo online.
- Simulatore concettuale ed esemplificativo: niente euro. Contatori in metri e difetti (dichiarati come esempio) e indicatori qualitativi a livelli (qualità consegnata, affidabilità delle consegne, salute delle macchine, conoscenza del processo, serenità del lavoro, fiducia della filiera, impronta ambientale, prontezza normativa). Stima ambientale (acqua, energia, CO2) solo come ordine di grandezza da metri salvati × fattori medi con fonti citate. Dicitura sempre presente: "Simulazione esemplificativa: eventi e risultati sono illustrativi". Il calcolatore "quanto ti costa un difetto" è escluso.
- Racconto in home (2D): un evento per fase — guasto con difetto continuo (tessitura), pezza difettosa fermata prima della tintoria (greggio e finissaggio), fine turno (controllo finito), contestazione del cliente risolta con il report. Gli altri eventi stanno nella modalità demo.
- A valle della fabbrica c'è il "confezionista", non il "cliente" (decisione 28/11/2026): la filiera è frammentata tra più aziende, anche conto terzi. In confezione si fa il taglio: mappa dei difetti utile al taglio automatico, resa del tessuto più alta, meno scarti di taglio (effetto ambientale), più fiducia verso il fornitore.
- Fabbrica 3D (decisione 28/11/2026): scena ampia generata dal codice (capannone, macchine, operatori stilizzati al lavoro, unità di ispezione che compaiono "con BrainTex", sala dati). Nessun modello o texture esterni; hardware sempre generico.
- Esempi dichiarati come tali, con dati inventati (decisione 28/11/2026): scanner in home con due viste, "Come vedi tu" (solo tessuto) e "Come vede il sistema" (aloni a mappa di calore, contorni e nomi; vista iniziale), e con classi di difetto impostabili su "filtra / mostra / allarma" (i contatori contano tutto; il tablet mostra solo le classi scelte; l'allarme lampeggia quando scatta una regola) e scheda con l'anagrafica della pezza; report di esempio (anagrafica, dati metrici, mappa digitale, elenco difetti, grafico, rimando a immagini e gemello digitale, commenti dell'operatore, indicazioni dell'AI); cruscotto di esempio in cui convergono i dati e che mette in relazione le variabili. Dal report si apre un gemello digitale di esempio della stessa pezza, navigabile metro per metro. Mai euro, clienti, articoli o macchine riconoscibili, percentuali di accuratezza.
- Pagina "Benefici" con il catalogo dei benefici, filtrabile per area e per ruolo; non distingue benefici attuali e futuri.
- Tono (decisione 28/11/2026): BrainTex si descrive come un collega, in terza persona, con verbi umani (guarda, impara, si ricorda, ti avvisa, capisce); il sistema non parla mai in prima persona e l'ultima parola resta all'operatore.
- Investitori (decisione 28/11/2026): la visione artificiale per il controllo qualità è la tecnologia abilitante; la visione è la fabbrica intelligente (sistemi interconnessi che generano dati, insight e decisioni basate sui dati). Si parla di crescita oltre il tessile senza nominare i settori. Presentazione e call solo su richiesta, tramite il form.
- Concetti di prodotto da far emergere: personalizzazione sul capitolato del cliente, uso dei feedback degli operatori, capacità di discernimento (difetto vs variazione voluta del disegno), adattamento rapido ai nuovi articoli, dialogo con la macchina (alert o fermo), il sapere resta in azienda.

## Brand
- Font Metropolis (Regular, Bold, Italic), self-hosted woff2 in `src/assets/fonts` (pubblico dominio, Unlicense).
- Palette: verdi #9CED40 #30A016; azzurri #57F0FE #35D2F3 #169FCC; blu #1373A8 #00355D.
- Tema scuro su base #00355D (variante più profonda per gli sfondi); azzurri per evidenziare, verdi per "difetto trovato"/esito positivo; logo bianco su scuro.
- Logo: usare solo i file ufficiali forniti da bt (non ricostruirlo). Dal 28/11/2026: PNG ufficiali ad alta risoluzione (`src/assets/brand`), versione negativa orizzontale in header e footer (`Logo.astro`), favicon dal cervello a colori. Se arriva il vettoriale si sostituisce il file.
- Immagini (28/11/2026): le tre viste in Soluzione sono illustrazioni disegnate dal codice (`FabricView.astro`), sostituibili con immagini reali; l'immagine per i social (`public/social-it.jpg`, `social-en.jpg`) non contiene il logo. Restano segnaposto, in attesa dei file ufficiali: loghi dei finanziatori, loghi delle reti. Foto del team (28/11/2026): ritratti ufficiali in `src/assets/team`, ritagliati 4:5.

## Sicurezza
- Nessuna parte lato server, nessun CMS. Simulatori/contatori/3D girano solo nel browser con dati statici: mai collegarsi a sistemi interni, flotta o VPN.
- Nessuno script di terze parti oltre a GA (dopo consenso).
- CSP restrittiva già attiva come meta tag generato da Astro (`security.csp` in `astro.config.mjs`): niente attributi `style=""` nel markup né script esterni non dichiarati lì. Header HTTP (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) da configurare sull'hosting definitivo.

## Interventi di bt
Per tutto ciò che non si può fare da qui (account, chiavi, impostazioni GitHub/Google/servizio email): fermarsi e spiegare passo per passo.

## Comandi
- `npm ci` installa le dipendenze · `npm run dev` sviluppo locale · `npm run build` compila in `dist/` · `npm run preview` serve la build.
- Variabili di build (vedi `.env.example`): `BASE_PATH`, `DEPLOY_TARGET` (`production` solo per il sito pubblico), `PUBLIC_FORM_ID`, `PUBLIC_BOOKING_URL`.

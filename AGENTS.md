# AGENTS.md

## Comandi

- `npm run build` — genera il bundle statico in `bundle/` (Vite, **nessun dev server**).
- `npm run watch` — rebuild ad ogni modifica di `src/` (sempre in produzione).
- `npm run typecheck` — controllo tipi (`tsc --noEmit`). Eseguirlo sempre dopo le modifiche.
- `npm run serve` — serve la root su `http://127.0.0.1:8080` (`http-server`).

Dopo ogni modifica a `src/` **eseguire `npm run build`** e committare anche
`bundle/`: il deploy è GitHub Pages "Deploy from a branch" (`main`, root) e
pubblica i file del branch, non c'è build in CI.

**Mai committare i CSV**: `.gitignore` esclude `*.csv` perché contengono dati
personali (anche i file di test tipo `Casellario_Massivo_*.csv` in root).

## Architettura

- `index.html` (root) — HTML eseguito; carica `./bundle/app.js` e `./bundle/app.css`.
- `vite.config.ts` — Vite usato solo per il bundle: `outDir: "bundle"`, entry
  `src/main.tsx`, nomi fissi `app.js`/`app.css`, alias `lib/*` → `src/lib/*`, `DEBUG`.
- `src/pages/CasellarioMassivo.tsx` — pagina principale: tabella righe
  (Cognome, Nome, Codice Fiscale + calcolati Sesso/Data), localStorage,
  pulsanti Nuovo / Carica CSV / Salva CSV, navigazione con i tasti cursore.
- `src/lib/CodiceFiscale.ts` — `ControllaCF` (controllo formale del CF).
- `src/lib/cfDecode.ts` — ricava Sesso e Data di nascita dal CF.
- `src/lib/csv.ts` — export (`buildCsvContent`/`salvaCsv`) e import (`parseCsvImport`).
- `src/lib/save-file.ts` — salvataggio con `showSaveFilePicker` + fallback `file-saver`.

## Componenti copiati (NON modificarli, salvo necessità)

`src/tags/CampoInput.tsx` e le sue dipendenze
(`src/lib/focusNextElement.ts`, `utils.ts`, `String.ts`, `Array.ts`,
`src/lib/date/*`) provengono dall'app **presenze** e sono mantenuti intatti.
Unica deroga già presente: in `CampoInput.tsx` la gestione del tasto **ESC**
(ripristina il valore d'ingresso se modificato, altrimenti toglie il focus).
`src/lib/api.ts` non esiste: il tail di `extensionMethods.ts` che agganciava
`JSON.parseFull` è stato rimosso.

`src/main.tsx` importa `./lib/extensions` per installare i prototipi
(`Array.contains`, `String.toInt`, `Date.format/today/isValid`) richiesti da `CampoInput`.

## Convenzioni

- Codice e commenti in italiano, stile compatto.
- Uppercase dei campi gestito in `setCampo`; il CF è valido solo a 16 caratteri
  col controcodice corretto, errato se lungo >0 e !=16.
- Formato CSV di export: 9 campi `;`, senza header, fine-riga CRLF, senza BOM,
  newline finale. L'import (`parseCsvImport`) accetta il formato nativo a 9
  campi o uno semplice a 3 colonne, con o senza header, separatore rilevato.

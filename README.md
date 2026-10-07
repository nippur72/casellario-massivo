# Casellario Massivo

Web app **client-only** (nessun server) per preparare il file CSV della richiesta
massiva al Casellario Giudiziario: si inseriscono Cognome, Nome e Codice Fiscale,
l'app calcola Sesso e Data di nascita dal codice fiscale e valida il controcodice.

Stack: TypeScript + React + Vite. I dati restano nel browser (localStorage).

## Requisiti

Node.js (v18+).

## Comandi

```bash
npm install
npm run build      # produce il bundle statico in bundle/
npm run serve      # serve la root del progetto su http://127.0.0.1:8080
npm run typecheck  # controllo tipi
```

Niente dev server: l'HTML eseguito è `index.html` nella root, che punta a
`./bundle/app.js` e `./bundle/app.css`.

## Deploy su GitHub Pages

Repository → **Settings → Pages → Build and deployment → Deploy from a branch**,
branch `main`, cartella **`/ (root)`**. Dopo ogni modifica esegui `npm run build`
e committa anche `bundle/`: Pages pubblica direttamente i file del branch.

## Formato CSV

In export il file ha 9 campi separati da `;`, senza header:

```
Cognome;Nome;<comune IT>;;<DataNascita>;<stato estero>;;<Sesso>;CodiceFiscale
```

Il codice del luogo di nascita (4 caratteri del CF) va nel campo 3 se italiano,
nel campo 6 se estero (`Z...`); altrimenti il campo 6 vale `Z000`.

In import vengono accettati il formato nativo a 9 campi e un formato semplice a
3 colonne (`Cognome;Nome;CodiceFiscale`), con o senza header.

## Autore

Antonino Porcino (nippur72) - https://github.com/nippur72

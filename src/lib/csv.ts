import { decodificaCodiceFiscale } from "./cfDecode";
import { saveAs } from "./save-file";

export interface RigaCasellario {
    id: string;
    cognome: string;
    nome: string;
    codiceFiscale: string;
}

// Normalizzazione dei nominativi nello stile dell'app componenti-seggio:
// maiuscolo, accenti -> apostrofo, mantenuti solo A-Z, spazi e apostrofo.
export function sanitizeNome(name: string | undefined | null): string {
    if (!name) return "";
    let upper = name.toUpperCase();
    upper = upper.replace(/[`'’‘´]/g, "'");
    const accentMap: Record<string, string> = {
        'À': "A'", 'È': "E'", 'É': "E'", 'Ì': "I'", 'Ò': "O'", 'Ù': "U'"
    };
    const replaced = upper.replace(/[ÀÈÉÌÒÙ]/g, m => accentMap[m] || m);
    return replaced.replace(/[^A-Z\s']/g, "");
}

// Formato del file "Casellario_Massivo" (9 campi separati da ';', senza header):
//   Cognome;Nome;<comune IT>;;<DataNascita>;<stato estero>;;<Sesso>;<CodiceFiscale>
// Il codice del luogo di nascita (4 caratteri del CF) finisce:
//   - nel campo 3 se e' un comune italiano (non inizia per Z);
//   - nel campo 6 se e' uno stato estero (inizia per Z), con campo 3 vuoto.
// Quando il luogo e' italiano il campo 6 vale "Z000".
function campiLuogoNascita(cf: string): { comune: string; stato: string } {
    const luogo = cf.length === 16 ? cf.substring(11, 15) : "";
    if (!luogo) return { comune: "", stato: "" };
    if (luogo.charAt(0) === "Z") return { comune: "", stato: luogo };
    return { comune: luogo, stato: "Z000" };
}

export function buildCsvContent(righe: RigaCasellario[]): string {
    const righeUtili = righe.filter(r =>
        (r.cognome ?? "").trim() !== "" ||
        (r.nome ?? "").trim() !== "" ||
        (r.codiceFiscale ?? "").trim() !== ""
    );

    const righeTesto = righeUtili.map(r => {
        const cf = (r.codiceFiscale ?? "").toUpperCase().trim();
        const dati = decodificaCodiceFiscale(cf);
        const luogo = campiLuogoNascita(cf);
        return [
            sanitizeNome(r.cognome),
            sanitizeNome(r.nome),
            luogo.comune,
            "",
            dati.dataNascita ?? "",
            luogo.stato,
            "",
            dati.sesso ?? "",
            cf
        ].join(";");
    });

    // Nessun header; CRLF e newline finale come nel file di esempio; senza BOM.
    return righeTesto.length > 0 ? righeTesto.join("\r\n") + "\r\n" : "";
}

function timestamp(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
        + `_${pad(date.getHours())}.${pad(date.getMinutes())}.${pad(date.getSeconds())}`;
}

// Salva il file CSV mostrando la finestra di dialogo "Salva con nome"
// (showSaveFilePicker dove disponibile, altrimenti fallback di save-file.ts).
export async function salvaCsv(righe: RigaCasellario[]): Promise<void> {
    const content = buildCsvContent(righe);
    // MIME senza charset: il picker di "Salva con nome" rifiuta i parametri extra
    const blob = new Blob([content], { type: "text/csv" });
    await saveAs(blob, `Casellario_Massivo_${timestamp(new Date())}.csv`);
}

// ---------------------------------------------------------------------------
// Importazione da file CSV
//
// Sono accettati:
//   - il formato nativo a 9 campi (quello prodotto da questa app), senza header:
//     Cognome;Nome;<comune>;;<Data>;<stato>;;<Sesso>;<CodiceFiscale>
//   - un formato semplice a 3 colonne: Cognome;Nome;CodiceFiscale
//   - entrambi con un eventuale header (le colonne vengono riconosciute dal nome)
// Il separatore (';' oppure ',') viene rilevato automaticamente.
// ---------------------------------------------------------------------------

function nuovoIdRiga(): string {
    return Math.random().toString(36).slice(2, 10);
}

function rilevaDelimitatore(text: string): string {
    const primaRiga = text.split("\n")[0] ?? "";
    let semi = 0, virgola = 0, inQuote = false;
    for (const ch of primaRiga) {
        if (ch === '"') inQuote = !inQuote;
        else if (!inQuote) {
            if (ch === ";") semi++;
            else if (ch === ",") virgola++;
        }
    }
    return virgola > semi ? "," : ";";
}

// Parser CSV minimale con supporto ai campi tra virgolette.
function parseRigheCsv(text: string, delim: string): string[][] {
    const righe: string[][] = [];
    let riga: string[] = [];
    let campo = "";
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuote) {
            if (ch === '"') {
                if (text[i + 1] === '"') { campo += '"'; i++; }
                else inQuote = false;
            } else campo += ch;
        } else if (ch === '"') {
            inQuote = true;
        } else if (ch === delim) {
            riga.push(campo); campo = "";
        } else if (ch === "\n") {
            riga.push(campo); righe.push(riga); riga = []; campo = "";
        } else {
            campo += ch;
        }
    }
    if (campo !== "" || riga.length > 0) {
        riga.push(campo);
        righe.push(riga);
    }
    return righe;
}

function normalizzaHeader(s: string): string {
    return (s ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase()
        .replace(/[\s_]+/g, "");
}

function trovaIndice(header: string[], ...nomi: string[]): number {
    for (let i = 0; i < header.length; i++) {
        if (nomi.includes(normalizzaHeader(header[i]))) return i;
    }
    return -1;
}

export function parseCsvImport(text: string): RigaCasellario[] {
    text = text.replace(/^\uFEFF/, ""); // rimuove l'eventuale BOM
    if (text.trim() === "") return [];

    const delim = rilevaDelimitatore(text);
    // normalizza i fine-riga e ignora le righe vuote finali
    const righe = parseRigheCsv(text.replace(/\r\n?/g, "\n"), delim);
    while (righe.length > 0 && righe[righe.length - 1].every(c => c.trim() === "")) {
        righe.pop();
    }
    if (righe.length === 0) return [];

    const primoNormalizzato = righe[0].map(normalizzaHeader);
    const haHeader = primoNormalizzato.some(c =>
        c === "COGNOME" || c === "NOME" || c === "CODICEFISCALE" || c === "CF");

    let idxCognome = -1, idxNome = -1, idxCf = -1;
    const inizio = haHeader ? 1 : 0;
    if (haHeader) {
        idxCognome = trovaIndice(righe[0], "COGNOME");
        idxNome = trovaIndice(righe[0], "NOME");
        idxCf = trovaIndice(righe[0], "CODICEFISCALE", "CF");
    }

    const out: RigaCasellario[] = [];
    for (let r = inizio; r < righe.length; r++) {
        const celle = righe[r];
        let cognome: string, nome: string, cf: string;

        if (haHeader) {
            cognome = idxCognome >= 0 ? (celle[idxCognome] ?? "") : "";
            nome = idxNome >= 0 ? (celle[idxNome] ?? "") : "";
            cf = idxCf >= 0 ? (celle[idxCf] ?? "") : "";
        } else if (celle.length >= 9) {
            // formato nativo: Cognome;Nome;...;CodiceFiscale (ultimo campo)
            cognome = celle[0] ?? "";
            nome = celle[1] ?? "";
            cf = celle[8] ?? "";
        } else {
            // formato semplice a 2/3 colonne: l'ultimo campo e' il codice fiscale
            cognome = celle[0] ?? "";
            nome = celle[1] ?? "";
            cf = celle[celle.length - 1] ?? "";
        }

        cognome = cognome.trim().toUpperCase();
        nome = nome.trim().toUpperCase();
        cf = cf.trim().toUpperCase().replace(/\s+/g, "");

        if (!cognome && !nome && !cf) continue;
        out.push({ id: nuovoIdRiga(), cognome, nome, codiceFiscale: cf });
    }

    return out;
}

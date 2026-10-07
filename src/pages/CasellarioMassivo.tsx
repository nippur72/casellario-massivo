import { useEffect, useRef, useState } from "react";
import { CampoInput, CursorNavigation } from "../tags/CampoInput";
import { decodificaCodiceFiscale } from "../lib/cfDecode";
import { RigaCasellario, salvaCsv, parseCsvImport } from "../lib/csv";

const STORAGE_KEY = "casellario-massivo:v1";

type Campo = "cognome" | "nome" | "codiceFiscale";
const COLONNE: Campo[] = ["cognome", "nome", "codiceFiscale"];

function nuovoId(): string {
    return Math.random().toString(36).slice(2, 10);
}

function rigaVuota(): RigaCasellario {
    return { id: nuovoId(), cognome: "", nome: "", codiceFiscale: "" };
}

function caricaRighe(): RigaCasellario[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [rigaVuota()];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [rigaVuota()];
        const righe = parsed
            .filter((r: any) => r && typeof r === "object")
            .map((r: any) => ({
                id: typeof r.id === "string" ? r.id : nuovoId(),
                cognome: typeof r.cognome === "string" ? r.cognome : "",
                nome: typeof r.nome === "string" ? r.nome : "",
                codiceFiscale: typeof r.codiceFiscale === "string" ? r.codiceFiscale : ""
            }));
        return righe.length > 0 ? righe : [rigaVuota()];
    } catch {
        return [rigaVuota()];
    }
}

function cellId(rigaId: string, campo: Campo): string {
    return `cell-${rigaId}-${campo}`;
}

const ID_AGGIUNGI_RIGA = "btn-aggiungi-riga";

// Costruisce la navigazione tramite i tasti cursore per la cella (r,c).
// Ai bordi resta sulla cella corrente (nessuno spostamento).
function navigazione(righe: RigaCasellario[], r: number, c: number): CursorNavigation {
    const cella = (rr: number, cc: number) => cellId(righe[rr].id, COLONNE[cc]);
    const ultimaRiga = righe.length - 1;
    const ultimaCol = COLONNE.length - 1;
    const ultimaCella = r === ultimaRiga && c === ultimaCol;

    // Invio: campo successivo nell'ordine di lettura (come Tab); dall'ultimo
    // campo (codice fiscale dell'ultima riga) va sul pulsante "Aggiungi riga".
    let enter: string;
    if (ultimaCella) enter = ID_AGGIUNGI_RIGA;
    else if (c < ultimaCol) enter = cella(r, c + 1);
    else enter = cella(r + 1, 0);

    return {
        up:    r > 0       ? cella(r - 1, c) : cella(r, c),
        down:  r < ultimaRiga ? cella(r + 1, c) : cella(r, c),
        left:  c > 0       ? cella(r, c - 1) : (r > 0 ? cella(r - 1, ultimaCol) : cella(r, c)),
        right: c < ultimaCol ? cella(r, c + 1) : (r < ultimaRiga ? cella(r + 1, 0) : cella(r, c)),
        enter
    };
}

export function CasellarioMassivo() {
    const [righe, setRighe] = useState<RigaCasellario[]>(caricaRighe);
    const [avviso, setAvviso] = useState<{ testo: string; tipo: "ok" | "errore" } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const focusPendente = useRef<string | null>(null);

    // Persistenza su localStorage ad ogni modifica.
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(righe));
        } catch {
            /* spazio esaurito o storage non disponibile: ignora */
        }
    }, [righe]);

    // Applica il focus richiesto dopo un aggiornamento dell'elenco (es. riga aggiunta).
    useEffect(() => {
        const id = focusPendente.current;
        if (!id) return;
        focusPendente.current = null;
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) {
            el.focus();
            if ("select" in el) el.select();
        }
    }, [righe]);

    function setCampo(id: string, campo: Campo, valore: string) {
        const upper = valore.toUpperCase();
        setRighe(prev => prev.map(r => (r.id === id ? { ...r, [campo]: upper } : r)));
        if (avviso) setAvviso(null);
    }

    function aggiungiRiga(dopoId?: string) {
        const nuova = rigaVuota();
        setRighe(prev => {
            if (!dopoId) return [...prev, nuova];
            const idx = prev.findIndex(r => r.id === dopoId);
            if (idx === -1) return [...prev, nuova];
            return [...prev.slice(0, idx + 1), nuova, ...prev.slice(idx + 1)];
        });
        focusPendente.current = cellId(nuova.id, "cognome");
    }

    function eliminaRiga(id: string) {
        const idx = righe.findIndex(r => r.id === id);
        const riga = idx >= 0 ? righe[idx] : undefined;
        const descr = riga ? [riga.cognome, riga.nome].filter(Boolean).join(" ") : "";
        const msg = descr
            ? `Eliminare la riga ${idx + 1} (${descr})?`
            : `Eliminare la riga ${idx + 1}?`;
        if (!window.confirm(msg)) return;

        setRighe(prev => {
            const next = prev.filter(r => r.id !== id);
            return next.length > 0 ? next : [rigaVuota()];
        });
    }

    function nuovo() {
        if (!window.confirm("Azzerare tutti i dati inseriti?")) return;
        setRighe([rigaVuota()]);
        setAvviso(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    async function onSalvaCsv() {
        await salvaCsv(righe);
    }

    function apriImport() {
        fileInputRef.current?.click();
    }

    async function fileScelto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            const testo = await file.text();
            const importate = parseCsvImport(testo);

            if (importate.length === 0) {
                setAvviso({ testo: "Nessuna riga valida trovata nel file.", tipo: "errore" });
                return;
            }

            const haDati = righe.some(r => r.cognome || r.nome || r.codiceFiscale);
            if (haDati && !window.confirm(
                `Sostituire le righe attuali (${righe.length}) con le ${importate.length} righe del file?`
            )) {
                return;
            }

            setRighe(importate);
            setAvviso({ testo: `Importate ${importate.length} righe da "${file.name}".`, tipo: "ok" });
        } catch {
            setAvviso({ testo: "Errore nella lettura del file.", tipo: "errore" });
        }
    }

    return (
        <div className="pagina">
            <div className="toolbar">
                <button className="btn" onClick={nuovo}>Nuovo</button>
                <button className="btn" onClick={apriImport}>Carica CSV</button>
                <button className="btn btn-primary" onClick={onSalvaCsv}>Salva CSV</button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={fileScelto}
                />
                <span className="totale">{righe.length} {righe.length === 1 ? "riga" : "righe"}</span>
            </div>

            {avviso && <div className={"avviso " + avviso.tipo}>{avviso.testo}</div>}

            <div className="tabella-wrap">
                <table className="tabella">
                    <thead>
                        <tr>
                            <th className="col-num">#</th>
                            <th>Cognome</th>
                            <th>Nome</th>
                            <th className="col-fiscale">Codice Fiscale</th>
                            <th className="col-sesso">Sesso</th>
                            <th className="col-calc">Data di nascita</th>
                            <th className="col-azioni"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {righe.map((riga, indice) => {
                            const dati = decodificaCodiceFiscale(riga.codiceFiscale);
                            const cfValido = riga.codiceFiscale.length === 16 && dati.valido;
                            // errato se la lunghezza non e' 16 (pur essendo stato digitato qualcosa)
                            // oppure se il carattere di controllo non torna
                            const cfErrato = riga.codiceFiscale.length > 0 && !cfValido;
                            return (
                                <tr key={riga.id}>
                                    <td className="col-num">{indice + 1}</td>
                                    <td>
                                        <CampoInput
                                            type="string"
                                            id={cellId(riga.id, "cognome")}
                                            className="campo"
                                            value={riga.cognome}
                                            maxLength={40}
                                            data-focusable
                                            cursorNavigation={navigazione(righe, indice, 0)}
                                            onText={v => setCampo(riga.id, "cognome", v)}
                                        />
                                    </td>
                                    <td>
                                        <CampoInput
                                            type="string"
                                            id={cellId(riga.id, "nome")}
                                            className="campo"
                                            value={riga.nome}
                                            maxLength={40}
                                            data-focusable
                                            cursorNavigation={navigazione(righe, indice, 1)}
                                            onText={v => setCampo(riga.id, "nome", v)}
                                        />
                                    </td>
                                    <td className="col-fiscale">
                                        <CampoInput
                                            type="string"
                                            id={cellId(riga.id, "codiceFiscale")}
                                            className="campo campo-cf"
                                            value={riga.codiceFiscale}
                                            maxLength={16}
                                            valid={cfValido}
                                            invalid={cfErrato}
                                            data-focusable
                                            cursorNavigation={navigazione(righe, indice, 2)}
                                            onText={v => setCampo(riga.id, "codiceFiscale", v)}
                                        />
                                    </td>
                                    <td className="col-sesso">{dati.sesso ?? ""}</td>
                                    <td className="col-calc">{dati.dataNascita ?? ""}</td>
                                    <td className="col-azioni">
                                        <button
                                            className="icon-btn"
                                            title="Inserisci riga sotto"
                                            onClick={() => aggiungiRiga(riga.id)}
                                        >+</button>
                                        <button
                                            className="icon-btn danger"
                                            title="Elimina riga"
                                            onClick={() => eliminaRiga(riga.id)}
                                        >×</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="sotto">
                <button id={ID_AGGIUNGI_RIGA} className="btn" onClick={() => aggiungiRiga()}>+ Aggiungi riga</button>
                <span className="suggerimento">
                    Tasti cursore per spostarsi tra le celle · Invio scende alla riga successiva
                </span>
            </div>
        </div>
    );
}

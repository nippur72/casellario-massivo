import { ControllaCF } from "./CodiceFiscale";

export type Sesso = "M" | "F";

export interface DatiCodiceFiscale {
    valido: boolean;
    sesso?: Sesso;
    dataNascita?: string; // GG/MM/AAAA
}

// lettera del mese nel codice fiscale -> numero del mese
const MESI: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, H: 6,
    L: 7, M: 8, P: 9, R: 10, S: 11, T: 12
};

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

// Ricava sesso e data di nascita dal codice fiscale.
// Il controllo formale (controcarattere) e' delegato a ControllaCF.
export function decodificaCodiceFiscale(cf: string): DatiCodiceFiscale {
    cf = (cf ?? "").toUpperCase().trim();
    if (cf.length !== 16) return { valido: false };

    const valido = ControllaCF(cf);

    const anno2 = parseInt(cf.substring(6, 8), 10);
    const mese = MESI[cf.charAt(8)];
    let giorno = parseInt(cf.substring(9, 11), 10);

    if (mese === undefined || isNaN(anno2) || isNaN(giorno)) return { valido };

    // Nel codice fiscale, per le donne al giorno di nascita si somma 40.
    const sesso: Sesso = giorno > 40 ? "F" : "M";
    if (giorno > 40) giorno -= 40;
    if (giorno < 1 || giorno > 31) return { valido };

    // Le ultime due cifre dell'anno: si assume 2000+ se non sono nel futuro,
    // altrimenti 1900+ (es. 85 -> 1985, 05 -> 2005, 26 -> 2026).
    const annoCorrente = new Date().getFullYear();
    const secolo = anno2 <= (annoCorrente % 100) ? 2000 : 1900;
    const anno = secolo + anno2;

    return { valido, sesso, dataNascita: `${pad2(giorno)}/${pad2(mese)}/${anno}` };
}

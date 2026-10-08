import { dateParse } from "lib/date/dateParse";
import { timeParse } from "lib/date/timeParse";

// ---------------------------------------------------------------------------
// Parsing/validazione per CampoInputBase (input non gestito).
//
// Un parser e' una funzione che riceve il testo digitato e restituisce:
//   - una stringa  => valore canonico, il testo e' VALIDO;
//   - undefined    => il testo e' NON VALIDO (resta quello digitato e il campo
//                     viene marcato localmente come invalido).
// Viene invocato al commit, cioe' al blur del campo.
// ---------------------------------------------------------------------------

export type ParseField = (raw: string) => string | undefined;

// emptyValid: true (default) = il campo vuoto e' valido.
export function makeDateParse(emptyValid = true): ParseField {
   return raw => (raw.trim() === "" ? (emptyValid ? "" : undefined) : dateParse(raw));
}

export function makeTimeParse(emptyValid = true): ParseField {
   return raw => (raw.trim() === "" ? (emptyValid ? "" : undefined) : timeParse(raw));
}

export function makeNumberParse(emptyValid = true): ParseField {
   return raw => {
      const t = raw.trim();
      if (t === "") return emptyValid ? "" : undefined;
      return /^-?\d*([.,]\d*)?$/.test(t) && /\d/.test(t) ? t : undefined;
   };
}

export function makeTextParse(): ParseField {
   return raw => raw;
}

// Parser di default: accetta il testo cosi' com'e'.
export const defaultParse: ParseField = raw => raw;

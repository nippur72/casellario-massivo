import { ParseField, defaultParse } from "./CampoInput_Parsers";

import { focusElement, focusRelativeScheduled } from "lib/focusNextElement";

import { AllHTMLAttributes, useEffect, useRef, useState } from "react";

export interface CursorNavigation {
   up?: string;
   down?: string;
   left?: string;
   right?: string;
   enter?: string;
}

interface Props extends AllHTMLAttributes<{}> {
   value?: string;                       // solo iniziale + riallineamento esterno
   parse?: ParseField;                   // parser/validatore del campo
   onCommit?: (value: string) => void;   // valore canonico, o testo digitato se non valido
   valid?: boolean;
   invalid?: boolean;
   uppercase?: boolean;                  // testo maiuscolo (style + al commit)
   type?: "search" | "password";         // solo tipi nativi che cambiano il rendering
   innerRef?: any;
   cursorNavigation?: CursorNavigation;
}

export function CampoInputBase(props: Props) {

   const inputRef = useRef<HTMLInputElement | null>(null);
   const entryValue = useRef("");   // valore presente all'ingresso nel campo
   const [status, setStatus] = useState<"clean" | "valid" | "invalid">("clean");

   const {
      className,
      valid,
      invalid,
      uppercase,
      type,
      innerRef,
      parse,
      onCommit,
      cursorNavigation,
      style,
      value,              // estratto da rest: l'input deve restare non controllato
      ...rest
   } = props;

   const classes = className === undefined ? [] : className.split(" ");

   const isInvalid = invalid ?? (status === "invalid");
   const isValid   = valid   ?? (status === "valid");
   if (isValid)   classes.push("is-valid");
   if (isInvalid) classes.push("is-invalid");

   // style passato dall'esterno, con l'eventuale text-transform uppercase
   const augmentedStyle: React.CSSProperties | undefined =
      uppercase ? { ...style, textTransform: "uppercase" } : style;

   // Riallineamento esterno: scrive nel DOM solo quando il campo NON ha il
   // focus, cioe' quando l'utente non sta digitando.
   useEffect(() => {
      const el = inputRef.current;
      if (!el || document.activeElement === el) return;
      if (value !== undefined && el.value !== value) el.value = value;
   }, [value]);

   function assignRef(el: HTMLInputElement | null) {
      inputRef.current = el;
      if (typeof innerRef === "function") innerRef(el);
      else if (innerRef) innerRef.current = el;
   }

   function commit(el: HTMLInputElement) {
      let raw = el.value;
      if (uppercase) {
         const up = raw.toUpperCase();
         if (up !== raw) {
            raw = up;
            el.value = up;   // il testo diventa realmente maiuscolo al commit
         }
      }
      const valueParsed = (parse ?? defaultParse)(raw);   // string | undefined

      if (valueParsed !== undefined) {
         if (valueParsed !== raw) {
            el.value = valueParsed;       // normalizzazione solo a commit
         }
         setStatus("valid");
      }
      else {
         setStatus("invalid");            // il testo digitato resta invariato
      }

      if (onCommit) onCommit(valueParsed ?? raw);

      entryValue.current = valueParsed !== undefined ? valueParsed : raw;
   }

   function handleChange() {
      if (status !== "clean") setStatus("clean");  // ridigitare rimuove il mark
   }

   function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      entryValue.current = e.target.value;
   }

   function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      commit(e.target);
   }

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {

      // Escape: se il campo e' stato modificato ripristina il valore
      // d'ingresso (mantenendo il focus); se non e' stato modificato toglie
      // il focus dal campo.
      if(e.key === "Escape") {
         e.preventDefault();
         const el = e.currentTarget;
         if(el.value !== entryValue.current) {
            el.value = entryValue.current;
            setStatus("clean");
         }
         else {
            el.blur();
         }
         return;
      }

      // navigation keys
      if(!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].contains(e.key)) return;

      // intercept Left/Right only if at beginning/end of the input box
      const curr_el = (e.target as HTMLInputElement);
      const start = curr_el.selectionStart == 0;
      const end = curr_el.selectionStart == curr_el.value.length;
      if(e.key == "ArrowLeft" && !start)  return;
      if(e.key == "ArrowRight" && !end)   return;

      let element_id: string | undefined;
      let move;
      const cn = cursorNavigation;

           if(e.key == "ArrowUp")    { move = -1; element_id = cn?.up; }
      else if(e.key == "ArrowDown")  { move = +1; element_id = cn?.down; }
      else if(e.key == "ArrowLeft")  { move = -1; element_id = cn?.left || cn?.up; }
      else if(e.key == "ArrowRight") { move = +1; element_id = cn?.right || cn?.down; }
      else if(e.key == "Enter")      { move = +1; element_id = cn?.enter || cn?.right || cn?.down; }

      if(cn === undefined || element_id === undefined) {
         // navigate via data-focusable
         e.preventDefault();
         if(move !== undefined) focusRelativeScheduled(move);
      }
      else {
         // navigate via CursorNavigation
         e.preventDefault();
         focusElement(element_id);
      }
   }

   return (
      <input {...rest}
         ref={assignRef}
         className={classes.join(" ")}
         type={type ?? "text"}
         style={augmentedStyle}
         defaultValue={value}
         onFocus={handleFocus}
         onBlur={handleBlur}
         onChange={handleChange}
         onKeyDown={handleKeyDown}
         spellCheck={false}
         autoComplete={props.autoComplete ?? "off"}
         />
   );
}

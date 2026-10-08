import { dateParse } from "lib/date/dateParse";
import { timeParse } from "lib/date/timeParse";

import { focusElement, focusRelative, focusRelativeScheduled } from "lib/focusNextElement";

import { AllHTMLAttributes, useState, useEffect } from "react";

export interface CursorNavigation {
   up?: string;
   down?: string;
   left?: string;
   right?: string;
   enter?: string;
}

interface Props extends AllHTMLAttributes<{}> {
   onText?: (e: string)=>void;
   onLeave?: (e: string)=>void;
   onCambiato?: (newvalue: string, oldvalue?: string)=>void;
   onKeyEnter?: (rawText: string)=>void;    
   size?: number;
   value: string;
   valid?: boolean;
   invalid?: boolean;
   tabindex?: string;
   type: "date" | "time" | "number" | "string" | "password" | "search";
   innerRef?: any;
   cursorNavigation?: CursorNavigation
}

export function CampoInput(props: Props) {  

   const [value, setValue] = useState(props.value);
   const [initialValue, setInitialValue] = useState("");

   useEffect(()=>{
      setValue(props.value)
   },[props.value]);

   const { 
      className, 
      valid, 
      invalid, 
      type, 
      size, 
      innerRef, 
      onText, 
      onLeave, 
      onKeyEnter, 
      onCambiato, 
      cursorNavigation,
      ...rest 
   } = props;

   const classes = className === undefined ? [] : className.split(" ");

   if(valid === true) classes.push("is-valid");
   if(invalid === true) classes.push("is-invalid");      

   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const newValue = e.target.value;
      if(newValue !== value) {
         setValue(newValue); 
         if(props.onText) props.onText(newValue);         
      }
   }

   function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setInitialValue(e.target.value);
   }

   function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      const text = e.target.value;
      let converted: string|undefined;           

           if(props.type === "date") converted = dateParse(text);
      else if(props.type === "time") converted = timeParse(text);
      else if(props.type === "number") converted = text;      
      else if(props.type === "string") converted = text;      
      else if(props.type === "password") converted = text;      
      else if(props.type === "search") converted = text;      

      if(converted !== undefined) {
         if(converted !== value) {
            setValue(converted);                     
            e.target.value = converted;
            if(props.onText) props.onText(converted);
         }
      }   
      else converted = e.target.value as string;

      if(props.onLeave) props.onLeave(converted);     

      if(props.onCambiato) {         
         if(converted !== initialValue) {
            props.onCambiato(converted, props.value);            
         }
      }
   };

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {

      // Enter key events
      if(e.which === 13) {         
         if(props.onKeyEnter !== undefined) {
            e.preventDefault();
            props.onKeyEnter(e.currentTarget.value);
            return;
         }         
      }

      // Escape: se il campo e' stato modificato ripristina il valore
      // d'ingresso (mantenendo il focus); se non e' stato modificato toglie
      // il focus dal campo.
      if(e.key === "Escape") {
         e.preventDefault();
         const el = e.currentTarget;
         if(el.value !== initialValue) {
            el.value = initialValue;
            setValue(initialValue);
            if(props.onText) props.onText(initialValue);
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
      let cn = props.cursorNavigation;

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

   function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
      if(props.type === "date") {
         if(e.which === 45 || e.which === 46 || e.which === 58) {
            replaceKey(e, "/");
            return;
         }
      }
      else if(props.type === "time") {
         if(e.which === 45 || e.which === 46 || e.which === 47 ) {
            replaceKey(e, ":");  
            return;
         }
      }
      
      //if(e.which === 13) {         
      //   e.preventDefault();
      //   focusNextElement();   
      //}     
   }

   function replaceKey(e: React.KeyboardEvent<HTMLInputElement>, newKey: string) {      
      const el = e.target as HTMLInputElement; 
      const c = el.selectionStart ?? 0;
      const value = el.value.substr(0,c) + newKey + el.value.substr(c);
      el.value = value;
      el.selectionStart = c+1;
      el.selectionEnd = c+1;
      setValue(value);
      if(props.onText) props.onText(value);
      e.preventDefault();
   }

   return (
      <input {...rest}
         ref={innerRef}
         className={classes.join(" ")}         
         type = {type === "password" || type === "search" ? type : "text"}
         maxLength={type === "date" ? 10 : undefined} 
         size={type === "date" ? 10 : size} 
         onFocus={handleFocus}
         onBlur={handleBlur}
         value={value}
         onChange={handleChange}
         onKeyDown={handleKeyDown}
         onKeyPress={handleKeyPress}
         spellCheck={false}
         autoComplete={props.autoComplete ?? "off"}
         />
   );
}


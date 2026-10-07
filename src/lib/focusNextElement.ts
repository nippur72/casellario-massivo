//
// taken and adapted from: 
// http://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index
//

function getFocusableElements() {
   let selector = [ "[data-focusable]" ].map(e=>`${e}:not([disabled]):not([tabindex="-1"])`).join(", ");
   var elements = Array.prototype.filter.call(document.querySelectorAll(selector), function (element) {
      //check for visibility while always include the current activeElement 
      return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
   });
   return elements;
}

export function focusRelative(move: number) {
  
   let activeElement = document.activeElement;
   if(!activeElement) return;

   let elements = getFocusableElements();

   let index = elements.indexOf(activeElement) + move;      

   if(index >= 0 && index < elements.length) {
      let el = elements[index];
      el.focus();
      if('select' in el) el.select();
      if(DEBUG) console.log(`focused on ${el.id} via relative move ${move}`);
   }
   else removeFocus();
}

// esegue il focus solo dopo aver fatto un removeFocus
// facendo così scattare eventuali render, e poi
// fa il focus relativo
//
export function focusRelativeScheduled(move: number) {
  
   function do_focus(activeElement: Element) {
      let elements = getFocusableElements();

      let index = elements.indexOf(activeElement) + move;      

      if(index >= 0 && index < elements.length) {
         let el = elements[index];
         el.focus();
         if('select' in el) el.select();
         if(DEBUG) console.log(`focused on ${el.id} via relative move ${move}`);
      }
      else removeFocus();
   }

   const activeElement = document.activeElement;
   if(!activeElement) return;

   setTimeout(()=>removeFocus(),1);             // rimuove il focus
   setTimeout(()=>do_focus(activeElement),2);   // schedula il focus dopo il render (eventuale)
}

export function removeFocus() {
   let activeElement = document.activeElement;
   if(!activeElement) return;
   if('blur' in activeElement) (activeElement as HTMLElement).blur();
}

export function focusElement(id: string, delay?: number) {
   function do_focus(id: string) {
      let el = document.getElementById(id);
      if(el !== null) {
         el.focus();
         if('select' in el) (el as HTMLInputElement).select();
         if(DEBUG) console.log(`focused on ${id} via id`);
      }
      else {
         if(DEBUG) console.log(`didn't focus, element ${id} was not here`);
         removeFocus();
      }
   }

   // delay focus
   setTimeout(()=>do_focus(id),delay??0);
}


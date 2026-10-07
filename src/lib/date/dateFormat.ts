import { rset } from "lib/utils";

const week_days = [ "Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato" ];
const months = [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ];

export function dateFormat(data: Date, f: string)
{
   let replacer = (str: string, d:string|undefined, m:string|undefined, y:string|undefined, h:string|undefined, s:string|undefined) => {       

      if(d) {
         switch(d)
         {
            case "d"    : return String(data.getDate());
            case "dd"   : return rset(data.getDate(),2,"0");
            case "ddd"  : return week_days[data.getDay()].substr(0,3).toLowerCase();
            case "dddd" : return week_days[data.getDay()].toLowerCase();
            case "Ddd"  : return week_days[data.getDay()].substr(0,3);
            case "Dddd" : return week_days[data.getDay()];            
         }
      }

      if(m) {
         switch(m)
         {
            case "M"    : return String(data.getMonth()+1);
            case "MM"   : return rset(data.getMonth()+1,2,"0");
            case "MMM"  : return months[data.getMonth()].substr(0,3).toLowerCase();
            case "MMMM" : return months[data.getMonth()].toLowerCase();
            case "Mmm"  : return months[data.getMonth()].substr(0,3);
            case "Mmmm" : return months[data.getMonth()];
            case "m"    : return String(data.getMinutes());
            case "mm"   : return rset(data.getMinutes(),2,"0");            
         }
      }

      if(y) {
         switch(y)
         {            
            case "yy"   : return String(data.getFullYear()).substr(2,2);
            case "yyyy" : return rset(data.getFullYear(),4,"0");
            default: throw `unrecognized format string ${y}`;
         }
      }

      if(h) {
         switch(h)
         {            
            case "h"  : return String(data.getHours());
            case "hh" : return rset(data.getHours(),2,"0");
            default: throw `unrecognized format string ${h}`;
         }
      }

      if(s) {
         switch(s)
         {            
            case "s"  : return String(data.getSeconds());
            case "ss" : return rset(data.getSeconds(),2,"0");
            default: throw `unrecognized format string ${s}`;
         }
      }

      throw `unrecognized format string ${str}`;
   };

   let regex = /([d|D]{1,4})|([M|m]{1,4})|(y{1,4})|([h]{1,2})|(s{1,2})/g;

   return f.replace(regex, replacer);         
}


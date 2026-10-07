import { rset } from "lib/utils";

export function dateParse(s: string): string | undefined
{
   let d = dateFromInput(s);
   if(d === undefined) return undefined;
   else return d.format("dd/MM/yyyy");
}

export function dateFromInput(s: string): Date | undefined
{
   function parseDay(s: string): number|undefined
   {
      if(s==="") return undefined;   
      let n = Number(s);
      if(isNaN(n)) return undefined;
      if(n<1 || n>31) return undefined;
      return n;   
   }

   function parseMonth(s: string): number|undefined
   {
      if(s==="") return undefined;
      let n = Number(s);
      if(isNaN(n)) return undefined;
      if(n<1 || n>12) return undefined;
      return n;   
   }

   function parseYear(s: string): number|undefined
   {
      if(s==="") return undefined;
      let n = Number(s);
      if(isNaN(n)) return undefined;
      if(n<0) return undefined;
      if(n>40 && n<99) n+=1900;
      else if(n<40) n+=2000;
      if(n<1900 || n>2099) return undefined;
      return n;   
   }

   if(s==="") return undefined;

   let curr_year = Date.today().getFullYear();
   let curr_month = Date.today().getMonth()+1;
   
   let day: number|undefined;
   let month: number|undefined;
   let year: number|undefined;

   s = s.replaceAll("-", "/").replaceAll(".", "/");

   let arr = s.split("/");

   if(arr.length === 1) 
   {  
      if(s.length === 6)
      {
         day   = s.substr(0,2).toInt();
         month = s.substr(2,2).toInt();
         year  = s.substr(4,2).toInt();
         if(year<40) year += 2000;
         else year += 1900;         
      }
      else if(s.length === 8)
      {
         day   = s.substr(0,2).toInt();
         month = s.substr(2,2).toInt();
         year  = s.substr(4,4).toInt();
      }
      else if(s.length === 4)
      {
         day   = s.substr(0,2).toInt();
         month = s.substr(2,2).toInt();
         year  = curr_year;
      }
      else
      {
         day = parseDay(arr[0]);
         month = curr_month;
         year = curr_year;      
      }
   }
   else if(arr.length === 2) 
   {
      day = parseDay(arr[0]);
      month = parseMonth(arr[1]);
      year = curr_year;      
   }
   else if(arr.length === 3) 
   {
      day = parseDay(arr[0]);
      month = parseMonth(arr[1]);
      year = parseYear(arr[2]);
   }
   else return undefined;

   if(day === undefined || month === undefined || year === undefined) return undefined;

   // check it's an actual existing date   
   let result = new Date(year, month-1, day);
   if(!result.isValid) return undefined;

   if(result.getDate() !== day || result.getMonth() !== month-1 || result.getFullYear() !== year) return undefined;   
   
   return result;      
}

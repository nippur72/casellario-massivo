import { rset } from "lib/utils";

export function timeFromInput(time: string): Date | undefined
{
   let t = timeParse(time);
   if(t === undefined) return undefined;
   let [ h, m ] = t.split(":");
   return new Date(1970,0,1,Number(h),Number(m),0);
}

export function timeFromString(time: string): Date | undefined
{
   let t = timeParse(time);
   if(t === undefined) return undefined;
   let [ h, m ] = t.split(":");
   return new Date(1899,11,30,Number(h),Number(m),0);
}

export function timeParse(s: string): string | undefined
{
   function parseHour(s: string): {hour: number|undefined, minutes: number|undefined }
   {
      if(s==="") return { hour: undefined, minutes: undefined };
      let h = Number(s);
      let m = 0;
      if(isNaN(h)) return { hour: undefined, minutes: undefined };
      if(h>=100) { m = h % 100; h = (h - m) / 100; }
      if(h<0 || h>23 || m<0 || m>59) return { hour: undefined, minutes: undefined };   
      return { hour: h, minutes: m };   
   }

   function parseMins(s: string): number|undefined
   {
      if(s==="") return undefined;
      let m = Number(s);   
      if(isNaN(m)) return undefined;   
      if(m<0 || m>59) return undefined;   
      return m;   
   }

   if(s==="") return undefined;
   
   let hour: number|undefined;
   let minutes: number|undefined;

   s = s.replaceAll("-", ":").replaceAll(".", ":").replaceAll(",", ":");

   let arr = s.split(":");

   if(arr.length === 1) 
   {  
      let r = parseHour(arr[0]);      
      hour = r.hour;
      minutes = r.minutes;
   }
   else if(arr.length === 2) 
   {
      hour = parseHour(arr[0]).hour;      
      minutes = parseMins(arr[1]);
   }
   else return undefined;

   if(hour === undefined || minutes === undefined) return undefined;

   if(hour < 0 || hour > 23 || minutes < 0 || minutes > 59) return undefined;

   return `${rset(hour,2,"0")}:${rset(minutes,2,"0")}`;      
}

export function parseMinutes(s: string): number | undefined
{
   let r = timeParse(s);
   if(r !== undefined)
   {
      let [ h, m ] = r.split(':');
      return Number(h)*60 + Number(m);
   }
   return undefined;
}


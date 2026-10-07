import { timeParse } from "lib/date/timeParse";
                    
export function repeat(s: string, n: number)
{
   if(n===0) return "";
   let a = new Array(n+1);
   return String(a.join(s));
}

export function rset(s: string|number, n: number, c: string)
{
   const p = repeat(c, n) + s;
   return right(p, n);
}

export function right(s: string, n: number)
{
   if(s.length < n) return s;      
   else return s.substr(s.length-n, n);
}

export function makeList(arr: string[])
{
   let result = "";

   arr.forEach((e,i)=>
   {
      result += arr;
           if(i<=arr.length-2) result += ", ";
      else if(i === arr.length-2) result += " e ";
   });
}

export function pluralize(n: number, singular: string, plural: string)
{
   if(n===1) return singular;
   else return plural;
}

export function uniqBy<T extends {[key:string]: any}>(arr: T[], fieldName: string): T[]
{
   let mappa: {[key: string|number]: T} = {};
   arr.forEach(el => mappa[el[fieldName]]=el); 
   return Object.keys(mappa).map(key => mappa[key]);
}

export function uniq<T>(arr: T[]): T[]
{
   let mappa: {[key: string]: T} = {};
   arr.forEach(el => mappa[String(el)] = el); 
   return Object.keys(mappa).map(key => mappa[key]);
}

export function count<T>(rows: T[]): {[key: string]: number}
{
   let countMap: {[key: string]: number} = {};

   rows.forEach(it => {
      const key = String(it);
      countMap[key] = (countMap[key]|0) + 1;      
   });

   return countMap;
}

export function sleep(milliseconds: number) {
   return new Promise((resolve,reject)=>{
      setTimeout(()=>{
         resolve(undefined);
      }, milliseconds);
   });   
}

export function delay(f: ()=>void) {
   setTimeout(()=>f(),0);
}

export function capitalize(str: string) {
   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeAll(str: string) {
   return str.split(" ").map(capitalize).join(" ");
}
String.prototype["toInt"] = function(this: string)
{
   return toInt(this as string);
}               

String.prototype["contains"] = function(this: string, match: string)
{
   return this.indexOf(match)>=0;
}

declare global {
   interface String
   {                                        
      toInt: ()=>number;
      contains(match: string): boolean;
   }
}

export function replaceAll(text: string, search: string, replace: string) 
{
   return text.split(search).join(replace);
}

export function toInt(s: string|undefined|null)
{
   var n = Number(s);
   if(isNaN(n)) return 0;
   else return n;   
}

export function capitalize(str: string) {
   return str.charAt(0).toUpperCase() + str.slice(1);
}
import { rset } from "lib/utils";
import { dateFormat } from "lib/date/dateFormat";

declare global 
{
   interface Date
   {
      datePart:          ()=>Date;
      addDays:           (ndays: number)=>Date;
      equals:            (date: Date)=>boolean;
      isValid:           ()=>boolean;
      isNullDate:        ()=>boolean;
      format:            (s:string)=>string;
      toShortString:     ()=>string;
      toShortTimeString: ()=>string;
      endOfMonth:        ()=>Date;
      startOfMonth:      ()=>Date;   
   }

   interface DateConstructor
   {
      fromValue(val: number): Date;
      fromDDMMAAAA(val: string): Date;
      fromCompact(val: string): Date;
      today(): Date;
      nullDate(): Date; 
      fromString(s: string): Date;
   }
}

Date.prototype.format = function(this: Date, f: string) 
{ 
   return dateFormat(this, f);
}

Date.prototype.datePart = function(this: Date)
{
   var j = new Date(this.valueOf());
   j.setHours(0);
   j.setMinutes(0);
   j.setSeconds(0);
   j.setMilliseconds(0);
   return j;
}

Date.prototype.addDays = function(this:Date, ndays: number)
{
   var j = new Date(this.valueOf());
   j.setDate(j.getDate()+ndays);   
   return j;
}

Date.prototype.equals = function(this: Date, date: Date)
{
   if(date===null || date===undefined) return false;
   return this.valueOf() === date.valueOf();
}

Date.prototype.isValid = function(this: Date)
{
   if(isNaN(this.valueOf())) return false;
   return true;  
}

Date.prototype.isNullDate = function(this: Date)
{   
   return this.valueOf()===0;  
}

Date.prototype.toShortString = function(this: Date)
{    
	return this.format("dd/MM/yyyy");
}

Date.prototype.startOfMonth = function(this: Date)
{   
   var d = new Date(this.valueOf());
   d.setDate(1);
   return d;
}

Date.prototype.endOfMonth = function(this: Date)
{   
   return new Date(this.getFullYear(), this.getMonth()+1, 0);
}

// do not use in production, for debug only
Date.prototype.toString = function(this: Date)
{
   return this.format("dd/MM/yyyy hh:mm:ss.")+String(this.getMilliseconds());
}

Date.prototype.toShortTimeString = function(this: Date)
{
   return this.format("hh:mm");
}

Date["fromValue"] = function(val: number)
{   
   return new Date(Number(val));      
}

Date["fromDDMMAAAA"] = function(s: string) {
   let args = s.split("/");
   if(args.length!==3) throw `${s} is no date`;
   let [ giorno, mese, anno ] = args;
   let ngiorno = giorno.toInt();
   let nmese = mese.toInt();
   let nanno = anno.toInt();

   let created = new Date(nanno, nmese-1, ngiorno);

   if(created.getDate()!=ngiorno || created.getMonth()!=nmese-1 || created.getFullYear()!=nanno) throw `${s} is invalid date`;
   return created;
}

Date["fromCompact"] = function(s: string) {
   let giorno = s.substr(0,2);
   let mese = s.substr(2,2);
   let anno = s.substr(4,4);
   return Date.fromDDMMAAAA(`${giorno}/${mese}/${anno}`);
}

Date["fromString"] = function(s: string): Date 
{ 
   let dd=1, MM=1, yyyy=1970, hh=0, mm=0, ss=0;

   let regex_date = /^([\d]{1,2})\/([\d]{1,2})\/([\d]{2,4})/g;
   let regex_hour = /([\d]{1,2})\:([\d]{2})(?:\:([\d]{2}))?$/g;

   let match_date = regex_date.exec(s);
   let match_hour = regex_hour.exec(s);

   if(match_date != null)
   {
      dd   = match_date[1].toInt();
      MM   = match_date[2].toInt();
      yyyy = match_date[3].toInt(); 
      if(yyyy < 30) yyyy+=2000; 
      else if(yyyy < 100) yyyy+=1900; 
   }

   if(match_hour != null)
   {
      hh = match_hour[1].toInt();
      mm = match_hour[2].toInt();
      ss = (match_hour[3]||"0").toInt();
   }

   // force invalid date
   if(match_date == null && match_hour == null) dd = 0; 

   let created = new Date(yyyy, MM-1, dd, hh, mm, ss);

   if(created.getDate()!=dd || created.getMonth()!=MM-1 || created.getFullYear()!=yyyy ||
      created.getHours()!==hh || created.getMinutes()!=mm || created.getSeconds()!=ss) 
   {
      throw `invalid date '${s}'`;
   }
   return created;
}

Date["today"] = function()
{      
   return new Date().datePart();
}

Date["nullDate"] = function()
{      
   return new Date(0);
}

/*
Date.prototype.toJSON = function(this: Date) {
     return "/Date(" + this.valueOf() + ")/";
};
*/

Date.prototype.toJSON = function(this: Date) {
   let d = Date.UTC(
      this.getFullYear(), 
      this.getMonth(), 
      this.getDate(),
      this.getHours(),
      this.getMinutes(),
      this.getSeconds(),
      this.getMilliseconds()
   );         
   return "/Date(" + d.valueOf() + ")/";
};

// NOTA: nell'originale questo file terminava agganciando JSON.parseFull al
// parse JSON del server (import da lib/api). In questa app non serve: e' stato
// rimosso insieme a lib/api.ts, lasciando intatto il resto delle estensioni.

Array.prototype["sum"] = function(this: Array<number>)
{
   return this.reduce((previous, current) => previous + current, 0); 
}

Array.prototype["contains"] = function<T>(this: Array<T>, match: T)
{
   return this.indexOf(match)>=0;
}

Array.prototype["removeAt"] = function(this: Array<unknown>, index: number)
{
   return this.splice(index, 1);
}

Array.prototype["replaceElement"] = function(this: Array<unknown>, index: number, value: unknown)
{
   return this.map((el,idx) => (idx !== index ? el : value));
}

Array.prototype["removeUndefined"] = function<Q>(this: Array<Q|undefined>): Array<Q>
{
   return this.filter(it => it !== undefined) as Array<Q>;
}

Array.prototype["without"] = function<Q>(this: Array<Q|undefined>, index: number): Array<Q>
{
   return this.filter( (it, i) => i!==index) as Array<Q>;
}


Array.prototype["first"] = function<Q>(this: Array<Q>): Q|undefined
{
   return this.length > 0 ? this[0] : undefined;
}

Array.prototype["add"] = function<T>(this: Array<T>, item: T): Array<T>
{
   const copy = this.map(it=>it);
   copy.push(item);
   return copy;
}

declare global 
{  
   interface Array<T>
   {          
      add(item: T): Array<T>;
      contains(match: T): boolean;
      removeAt(index: number): void;
      replaceElement(index: number, value: T): Array<T>;
      without(index: number): Array<T>;
      first<Q>(this: Array<Q>): Q|undefined;
      removeUndefined<Q>(this: Array<Q|undefined>): Array<Q>;
      sum(this: Array<number>): number;
   }   
}

export {};

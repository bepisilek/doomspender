// Backend-ready minimal data layer (localStorage for MVP)
export class DataLayer {
  get(key){ try{ const v = localStorage.getItem(key); return v? JSON.parse(v): null; }catch(e){ return null; } }
  set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(e){ return false; } }
  clear(){ localStorage.removeItem('profile'); localStorage.removeItem('saved'); localStorage.removeItem('spent'); }
}

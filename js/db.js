/**
 * db v4 : resynchronise automatiquement les pannes (DATA_VERSION)
 */
const DB_NAME='AutoDiagProDB';
const DB_VERSION=1;
const DB_CONFIG={ stores:{ users:{keyPath:'username'}, faults:{keyPath:'id'}, accessRequests:{keyPath:'id'}, settings:{keyPath:'key'}, backups:{keyPath:'id'} } };

class Database{
  constructor(){ this.db=null; }
  async init(){
    return new Promise((resolve,reject)=>{
      if(this.db){ resolve(this.db); return; }
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onerror=()=>reject(request.error);
      request.onsuccess=()=>{ this.db=request.result; resolve(this.db); };
      request.onupgradeneeded=(e)=>{
        const db=e.target.result;
        Object.entries(DB_CONFIG.stores).forEach(([name,config])=>{
          if(!db.objectStoreNames.contains(name)) db.createObjectStore(name,{keyPath:config.keyPath,autoIncrement:config.autoIncrement||false});
        });
      };
    });
  }
  async add(s,d){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readwrite'); const r=t.objectStore(s).add(d); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async put(s,d){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readwrite'); const r=t.objectStore(s).put(d); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async get(s,k){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readonly'); const r=t.objectStore(s).get(k); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
  async getAll(s){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readonly'); const r=t.objectStore(s).getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error); }); }
  async delete(s,k){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readwrite'); const r=t.objectStore(s).delete(k); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
  async clear(s){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readwrite'); const r=t.objectStore(s).clear(); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
  async count(s){ await this.init(); return new Promise((res,rej)=>{ const t=this.db.transaction([s],'readonly'); const r=t.objectStore(s).count(); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
}
const db=new Database();

const DBUtils={
  async createUser(u,p,role='user'){ const hp=await this.hashPassword(p); return db.add('users',{username:u,password:hp,role,status:'pending',createdAt:Date.now(),lastLogin:null}); },
  async getUser(u){ return db.get('users',u); },
  async updateUser(u,up){ const user=await this.getUser(u); if(!user) throw new Error('Utilisateur non trouvé'); return db.put('users',{...user,...up}); },
  async getAllUsers(){ return db.getAll('users'); },
  async deleteUser(u){ return db.delete('users',u); },
  async verifyPassword(u,p){ const user=await this.getUser(u); if(!user) return false; return user.password===await this.hashPassword(p); },
  async hashPassword(p){ const data=new TextEncoder().encode(p+'AutoDiagPro_Salt_2026'); const buf=await crypto.subtle.digest('SHA-256',data); return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(''); },
  async createAccessRequest(d){ return db.add('accessRequests',{id:'req_'+Date.now(),...d,status:'pending',createdAt:Date.now()}); },
  async getAllAccessRequests(){ return db.getAll('accessRequests'); },
  async updateAccessRequest(id,up){ const r=await db.get('accessRequests',id); if(!r) throw new Error('Demande non trouvée'); return db.put('accessRequests',{...r,...up}); },
  async setSetting(k,v){ return db.put('settings',{key:k,value:v,updatedAt:Date.now()}); },
  async getSetting(k){ const s=await db.get('settings',k); return s?s.value:null; },
  async createBackup(d){ return db.add('backups',{id:'backup_'+Date.now(),data:d,createdAt:Date.now()}); },
  async getAllBackups(){ return db.getAll('backups'); },
  async exportAll(){ return { users:await db.getAll('users'), accessRequests:await db.getAll('accessRequests'), settings:await db.getAll('settings'), exportedAt:Date.now(), version:DB_VERSION }; },
  async importAll(d){ if(!d||!d.users) throw new Error('Format invalide'); for(const u of d.users) await db.put('users',u); if(d.accessRequests) for(const r of d.accessRequests) await db.put('accessRequests',r); if(d.settings) for(const s of d.settings) await db.put('settings',s); return true; },

  async initializeDefaults(){
    // Admin par défaut
    const adminExists=await this.getUser('admin');
    if(!adminExists){
      await this.createUser('admin','Kevin83600','admin');
      await this.updateUser('admin',{status:'approved'});
    }
    // 🔁 Resynchronisation des pannes selon DATA_VERSION
    const target=window.DATA_VERSION||1;
    const stored=await this.getSetting('dataVersion');
    if(stored!==target){
      await db.clear('faults');
      for(const f of AUTO_DATA.faults) await db.put('faults',f);
      await this.setSetting('dataVersion',target);
      console.log('[DB] Pannes resynchronisées v'+target+':',AUTO_DATA.faults.length);
    } else if((await db.count('faults'))===0){
      for(const f of AUTO_DATA.faults) await db.put('faults',f);
    }
    // Paramètres
    if(!(await this.getSetting('theme'))){
      await this.setSetting('theme','light');
      await this.setSetting('language','fr');
      await this.setSetting('autoBackup',true);
    }
  }
};
if (typeof window !== 'undefined'){ window.db=db; window.DBUtils=DBUtils; }

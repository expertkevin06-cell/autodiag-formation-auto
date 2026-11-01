const UPDATE_INTERVAL = 30*24*3600*1000;
const FEED_URL = './updates/feed.json';
const NHTSA_FR = {
  "ENGINE":"Moteur","ENGINE AND ENGINE COOLING":"Moteur et refroidissement","FUEL SYSTEM":"Circuit carburant",
  "AIR BAGS":"Airbags","SEAT BELTS":"Ceintures de sécurité","ELECTRICAL SYSTEM":"Système électrique",
  "ELECTRICAL SYSTEM:SOFTWARE":"Électronique / logiciel","BRAKES":"Freins","STEERING":"Direction",
  "SUSPENSION":"Suspension","POWER TRAIN":"Transmission","WHEELS":"Roues","TIRES":"Pneumatiques",
  "BACK OVER PREVENTION":"ADAS - caméra de recul","LANE DEPARTURE:ASSISTANCE":"ADAS - maintien de voie",
  "FORWARD COLLISION AVOIDANCE":"ADAS - anticollision","ELECTRIC":"Système haute tension",
  "BATTERY":"Batterie","BATTERY:CHARGING":"Charge batterie","VISIBILITY":"Visibilité","LIGHTING":"Éclairage",
  "FIRE":"Risque incendie","SEATS":"Sièges","SERVICE BRAKES":"Freins de service","PARKING BRAKE":"Frein de stationnement"
};
function nhtsaSystem(comp){
  const c=(comp||'').toUpperCase();
  const label=NHTSA_FR[c]||"Système divers";
  if(/AIR BAG|SEAT BELT|SIÈGE|CEINTURE/.test(c)) return {label,sys:'securite'};
  if(/BRAKE|FREIN/.test(c)) return {label,sys:'freinage'};
  if(/STEERING|DIRECTION/.test(c)) return {label,sys:'direction'};
  if(/POWER TRAIN|TRANSMISSION/.test(c)) return {label,sys:'transmission'};
  if(/BATTERY:CHARGING|CHARGE/.test(c)) return {label,sys:'charge'};
  if(/BATTERY|ELECTRIC|BATTERIE/.test(c)) return {label,sys:'batterie'};
  if(/BACK OVER|LANE|COLLISION|ADAS/.test(c)) return {label,sys:'adas'};
  if(/SOFTWARE|VISIBILITY|LIGHTING|LOGICIEL/.test(c)) return {label,sys:'multimedia'};
  if(/ELECTRICAL|ÉLECTRIQUE/.test(c)) return {label,sys:'electricite'};
  if(/ENGINE|MOTEUR|FUEL|SUSPENSION/.test(c)) return {label,sys:'moteur'};
  return {label,sys:'moteur'};
}

class UpdateManager {
  async init(){ await this.applyExtras(); await this.checkAuto(); setInterval(()=>this.checkAuto(), 3600*1000); }
  async checkAuto(){ const last=(await DBUtils.getSetting('lastUpdate'))||0; if(Date.now()-last>UPDATE_INTERVAL) await this.refresh(false); }
  notify(m,t){ if(window.backupManager&&backupManager.showNotification) backupManager.showNotification(m,t||'info'); console.log('[UPD]',m); }

  async refresh(manual){
    try{
      for(const f of AUTO_DATA.faults) await db.put('faults', f);
      const added={faults:0,campaigns:0,models:0};
      try{ const r=await fetch(FEED_URL+'?t='+Date.now(),{cache:'no-store'}); if(r.ok) Object.assign(added, await this.mergeFeed(await r.json())); }catch(e){ console.warn('[UPD] feed offline OK'); }
      await this.applyExtras();
      await DBUtils.setSetting('lastUpdate', Date.now());
      this.notify(`🔄 MàJ ${manual?'manuelle':'auto'} : +${added.faults} pannes, +${added.campaigns} campagnes, +${added.models} motorisations`,'success');
      if(window.filterManager) window.filterManager.renderResults();
      return true;
    }catch(e){ this.notify('Erreur MàJ : '+e.message,'error'); return false; }
  }

  // ---- Connecteur NHTSA (rappels US traduits FR) ----
  async importNHTSA(){
    const f=window.filterManager?window.filterManager.currentFilters:{};
    if(!f.brand||!f.model){ this.notify('Sélectionnez marque + modèle puis relancez','error'); return 0; }
    try{
      const url=`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(f.brand)}&model=${encodeURIComponent(f.model)}`;
      const r=await fetch(url,{cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const j=await r.json();
      let n=0;
      for(const rec of (j.results||[]).slice(0,60)){
        const id='NHTSA-'+(rec.NHTSACampaignNumber||rec.Id);
        if(await db.get('faults',id)) continue;
        const {label,sys}=nhtsaSystem(rec.Component);
        await db.put('faults',{ id, code:id, title:`Rappel NHTSA : ${label} — ${f.brand} ${f.model}`, type:'electronique', component:label, system:sys, brands:[f.brand], modelRefs:[f.model], engines:['essence','diesel','hybride','electrique'], symptoms:[rec.Summary||'Défaut répertorié NHTSA'], causes:[rec.DefectSummary||'Voir campagne'], consequences:[rec.ConsequenceSummary||'Risque sécurité'], diagnostics:['Consulter campagne NHTSA '+ (rec.NHTSACampaignNumber||'')], repairs:[rec.RemedySummary||'Réparation concession'], tsb:['Source NHTSA traduite FR : '+label], recalls:['Campagne NHTSA '+(rec.NHTSACampaignNumber||'')], severity:'important', cost:'0€ (rappel)' });
        n++;
      }
      this.notify(`🌐 NHTSA : ${n} rappel(s) importé(s) pour ${f.brand} ${f.model}`,'success');
      if(window.filterManager) window.filterManager.renderResults();
      return n;
    }catch(e){ this.notify('NHTSA inaccessible : '+e.message+' (utilisez feed.json)','error'); return 0; }
  }

  // ---- Nouveaux modèles commercialisés (2017→2027) non répertoriés ----
  async importNewModels(){
    const f=window.filterManager?window.filterManager.currentFilters:{};
    if(!f.brand){ this.notify('Sélectionnez une marque','error'); return 0; }
    try{
      const r=await fetch(`https://api.nhtsa.gov/vehicles/GetModelsForMake/${encodeURIComponent(f.brand)}?modelYear=2026`,{cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const j=await r.json(); let n=0;
      for(const m of (j.Results||[])){
        const name=m.Model_Name;
        if(!AUTO_DATA.brands[f.brand]) AUTO_DATA.brands[f.brand]={country:'?',models:[],engines:['essence','diesel','hybride','electrique']};
        if(!AUTO_DATA.brands[f.brand].models.includes(name)){
          AUTO_DATA.brands[f.brand].models.push(name); n++;
          if(!AUTO_DATA.enginesByModel[f.brand]) AUTO_DATA.enginesByModel[f.brand]={};
          AUTO_DATA.enginesByModel[f.brand][name]=AUTO_DATA.enginesByModel[f.brand][name]||[];
          await this.persistExtra('extraModels',{brand:f.brand,model:name,engines:[]});
        }
      }
      this.notify(`🆕 ${n} nouveau(x) modèle(s) ${f.brand} importé(s) (motorisations à compléter via feed.json)`,'success');
      if(window.filterManager){ window.filterManager.updateModelSelect(f.brand); }
      return n;
    }catch(e){ this.notify('Modèles NHTSA inaccessibles : '+e.message,'error'); return 0; }
  }

  // ---- Flux JSON externe (Safety Gate UE, sites spécialisés, feed personnalisé) ----
  async importFromUrl(url){
    try{ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); const added=await this.mergeFeed(await r.json()); this.notify(`📥 Flux importé : +${added.faults} pannes, +${added.campaigns} campagnes, +${added.models} motorisations`,'success'); if(window.filterManager) window.filterManager.renderResults(); return added; }
    catch(e){ this.notify('Flux inaccessible : '+e.message,'error'); return null; }
  }
  async importFromFile(file){
    try{ const added=await this.mergeFeed(JSON.parse(await file.text())); this.notify(`📥 Fichier importé : +${added.faults} pannes`,'success'); if(window.filterManager) window.filterManager.renderResults(); return added; }
    catch(e){ this.notify('Fichier invalide : '+e.message,'error'); return null; }
  }

  async mergeFeed(feed){
    const c={faults:0,campaigns:0,models:0}; if(!feed) return c;
    if(Array.isArray(feed.faults)) for(const f of feed.faults){ if(f&&f.id){ f.brands=f.brands||['ALL']; await db.put('faults',f); if(!AUTO_DATA.faults.some(x=>x.id===f.id)) AUTO_DATA.faults.push(f); c.faults++; } }
    if(Array.isArray(feed.campaigns)) for(const cam of feed.campaigns){ if(!cam||!cam.id) continue; if(!AUTO_DATA.campaigns.some(x=>x.id===cam.id)){ AUTO_DATA.campaigns.push(cam); c.campaigns++; await this.persistExtra('extraCampaigns',cam); } }
    if(Array.isArray(feed.models)) for(const m of feed.models){ if(!m||!m.brand||!m.model) continue; if(this.mergeModel(m)){ c.models++; await this.persistExtra('extraModels',m); } }
    return c;
  }
  mergeModel(m){
    let changed=false;
    if(!AUTO_DATA.brands[m.brand]){ AUTO_DATA.brands[m.brand]={country:m.country||'?',models:[],engines:m.enginesTypes||['essence','diesel','hybride','electrique']}; changed=true; }
    const b=AUTO_DATA.brands[m.brand];
    if(!b.models.includes(m.model)){ b.models.push(m.model); changed=true; }
    if(!AUTO_DATA.enginesByModel[m.brand]) AUTO_DATA.enginesByModel[m.brand]={};
    const cur=AUTO_DATA.enginesByModel[m.brand][m.model]||[];
    if(Array.isArray(m.engines)) for(const e of m.engines){ if(!cur.some(x=>x.name===e.name)){ cur.push(e); changed=true; } }
    AUTO_DATA.enginesByModel[m.brand][m.model]=cur;
    return changed;
  }
  async persistExtra(key,item){ const l=(await DBUtils.getSetting(key))||[]; l.push(item); await DBUtils.setSetting(key,l); }
  async applyExtras(){
    for(const cam of ((await DBUtils.getSetting('extraCampaigns'))||[])) if(!AUTO_DATA.campaigns.some(x=>x.id===cam.id)) AUTO_DATA.campaigns.push(cam);
    for(const m of ((await DBUtils.getSetting('extraModels'))||[])) this.mergeModel(m);
  }
  async lastUpdateLabel(){ const l=await DBUtils.getSetting('lastUpdate'); return l?new Date(l).toLocaleString('fr-FR'):'jamais'; }
}
if (typeof window !== 'undefined') window.UpdateManager = UpdateManager;

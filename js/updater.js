/**
 * updater.js - Mise à jour de la base
 * - Auto tous les 30 jours (contrôle hourly)
 * - Manuelle via bouton 🔄
 * - Fusionne updates/feed.json (nouvelles pannes, campagnes, modèles 2017→2027)
 */
const UPDATE_INTERVAL = 30 * 24 * 3600 * 1000;
const FEED_URL = './updates/feed.json';

class UpdateManager {
  async init(){
    await this.applyExtras();
    await this.checkAuto();
    setInterval(() => this.checkAuto(), 3600 * 1000);
  }

  async checkAuto(){
    const last = (await DBUtils.getSetting('lastUpdate')) || 0;
    if (Date.now() - last > UPDATE_INTERVAL) await this.refresh(false);
  }

  notify(msg, type){
    if (window.backupManager && backupManager.showNotification) backupManager.showNotification(msg, type || 'info');
    console.log('[UPD]', msg);
  }

  async refresh(manual){
    try {
      // 1) Resynchronisation base locale embarquée
      for (const f of AUTO_DATA.faults) await db.put('faults', f);
      // 2) Flux distant (nouvelles données publiées par l'admin)
      const added = { faults:0, campaigns:0, models:0 };
      try {
        const r = await fetch(FEED_URL + '?t=' + Date.now(), { cache:'no-store' });
        if (r.ok) Object.assign(added, await this.mergeFeed(await r.json()));
      } catch(e){ console.warn('[UPD] feed inaccessible (mode hors ligne OK):', e.message); }
      // 3) Ré-applique les extras persistés
      await this.applyExtras();
      await DBUtils.setSetting('lastUpdate', Date.now());
      this.notify(`🔄 Mise à jour ${manual ? 'manuelle' : 'automatique'} : +${added.faults} pannes, +${added.campaigns} campagnes, +${added.models} motorisations`, 'success');
      if (window.filterManager) window.filterManager.renderResults();
      return true;
    } catch(e){
      this.notify('Erreur mise à jour : ' + e.message, 'error');
      return false;
    }
  }

  async mergeFeed(feed){
    const c = { faults:0, campaigns:0, models:0 };
    if (!feed) return c;
    if (Array.isArray(feed.faults)) for (const f of feed.faults){ if (f && f.id){ await db.put('faults', f); c.faults++; } }
    if (Array.isArray(feed.campaigns)) for (const cam of feed.campaigns){
      if (!cam || !cam.id) continue;
      if (!AUTO_DATA.campaigns.some(x => x.id === cam.id)){ AUTO_DATA.campaigns.push(cam); c.campaigns++; await this.persistExtra('extraCampaigns', cam); }
    }
    if (Array.isArray(feed.models)) for (const m of feed.models){
      if (!m || !m.brand || !m.model) continue;
      if (this.mergeModel(m)) { c.models++; await this.persistExtra('extraModels', m); }
    }
    return c;
  }

  mergeModel(m){
    let changed = false;
    if (!AUTO_DATA.brands[m.brand]){ AUTO_DATA.brands[m.brand] = { country:m.country||'?', models:[], engines:m.enginesTypes||["essence","diesel","hybride","electrique"] }; changed = true; }
    const b = AUTO_DATA.brands[m.brand];
    if (!b.models.includes(m.model)){ b.models.push(m.model); changed = true; }
    if (!AUTO_DATA.enginesByModel[m.brand]) AUTO_DATA.enginesByModel[m.brand] = {};
    const cur = AUTO_DATA.enginesByModel[m.brand][m.model] || [];
    if (Array.isArray(m.engines)) for (const e of m.engines){
      if (!cur.some(x => x.name === e.name)){ cur.push(e); changed = true; }
    }
    AUTO_DATA.enginesByModel[m.brand][m.model] = cur;
    return changed;
  }

  async persistExtra(key, item){
    const list = (await DBUtils.getSetting(key)) || [];
    list.push(item);
    await DBUtils.setSetting(key, list);
  }

  async applyExtras(){
    const cams = (await DBUtils.getSetting('extraCampaigns')) || [];
    for (const cam of cams) if (!AUTO_DATA.campaigns.some(x => x.id === cam.id)) AUTO_DATA.campaigns.push(cam);
    const mods = (await DBUtils.getSetting('extraModels')) || [];
    for (const m of mods) this.mergeModel(m);
  }

  async lastUpdateLabel(){
    const last = await DBUtils.getSetting('lastUpdate');
    return last ? new Date(last).toLocaleString('fr-FR') : 'jamais';
  }
}
if (typeof window !== 'undefined') window.UpdateManager = UpdateManager;

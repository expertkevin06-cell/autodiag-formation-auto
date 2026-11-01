class AdminManager {
  constructor(){ this.currentUser=null; this.attachEventListeners(); }
  attachEventListeners(){
    const on=(id,ev,fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); };
    document.addEventListener('click',e=>{ const t=e.target.closest?e.target.closest('#adminBtn'):null; if(t){ e.preventDefault(); this.showAdminModal(); } });
    on('adminClose','click',()=>this.closeModal());
    on('shareClose','click',()=>{ const m=document.getElementById('shareModal'); if(m)m.classList.remove('active'); });
    document.addEventListener('click',e=>{ const b=e.target.closest?e.target.closest('.tab-btn'):null; if(b) this.switchTab(b.dataset.tab); });
    on('generateLink','click',()=>this.copyShareLink());
    on('downloadAPK','click',()=>this.showAPKInstructions());
    on('exportData','click',()=>{ if(window.backupManager) backupManager.exportData(); });
    on('updateBtn','click',()=>{ if(window.updateManager) updateManager.refresh(true); });
  }
  closeModal(){ const m=document.getElementById('adminModal'); if(m)m.classList.remove('active'); }
  setCurrentUser(user){
    this.currentUser=user;
    const isAdmin=user&&user.role==='admin';
    const ud=document.getElementById('userDisplay'); if(ud) ud.textContent=user?('👤 '+user.username):'';
    const ab=document.getElementById('adminBtn'); if(ab) ab.style.display=isAdmin?'inline-block':'none';
    const ub=document.getElementById('updateBtn'); if(ub) ub.style.display=isAdmin?'inline-block':'none';
    if(isAdmin) this.refreshBadge(); else { const b=document.getElementById('adminBadge'); if(b)b.style.display='none'; }
  }
  async refreshBadge(){ try{ const n=await DBUtils.pendingCount(); const b=document.getElementById('adminBadge'); if(b){ b.textContent=n; b.style.display=n>0?'inline-block':'none'; } }catch(e){} }
  async showAdminModal(){
    try{
      if(!this.currentUser||this.currentUser.role!=='admin'){ alert('Accès réservé aux administrateurs'); return; }
      const m=document.getElementById('adminModal'); if(!m){ alert('Modal admin introuvable'); return; }
      m.classList.add('active'); await this.switchTab('pending');
    }catch(e){ alert('Erreur ouverture admin : '+e.message); }
  }
  async switchTab(tab){
    try{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
      const c=document.getElementById('adminContent'); if(!c)return;
      if(tab==='pending') await this.renderPendingTab(c);
      else if(tab==='users') await this.renderUsersTab(c);
      else if(tab==='data') await this.renderDataTab(c);
      else if(tab==='perso') await this.renderPersoTab(c);
      else if(tab==='share') await this.renderShareTab(c);
    }catch(e){ const c=document.getElementById('adminContent'); if(c)c.innerHTML='<p style="color:#991b1b">Erreur onglet : '+e.message+'</p>'; }
  }
  async renderPendingTab(c){
    const reqs=(await DBUtils.getAllAccessRequests()).filter(r=>r.status==='pending');
    c.innerHTML=`<h3>📨 Demandes en attente (${reqs.length})</h3>${reqs.length===0?'<p>Aucune demande</p>':''}
      <div class="user-list">${reqs.map(r=>`<div class="user-item"><div class="user-info"><strong>${r.firstName||'?'} (${r.username})</strong><small>${r.email?('📧 '+r.email+' | '):''}${r.message?('💬 '+r.message+' | '):''}🕐 ${new Date(r.createdAt).toLocaleDateString('fr-FR')}</small></div>
      <div class="user-actions"><button class="btn btn-success" onclick="window.adminManager.approveRequest('${r.id}')">✓ Autoriser</button><button class="btn btn-danger" onclick="window.adminManager.rejectRequest('${r.id}')">✗ Refuser</button></div></div>`).join('')}</div>`;
  }
  async renderUsersTab(c){
    const users=await DBUtils.getAllUsers();
    const st={pending:'En attente',approved:'Autorisé',revoked:'Révoqué'};
    c.innerHTML=`<h3>👥 Utilisateurs (${users.length})</h3><div class="user-list">${users.map(u=>`<div class="user-item"><div class="user-info"><strong>${u.firstName?(u.firstName+' / '):''}${u.username}</strong><small>Rôle: ${u.role} | Statut: <span class="status-badge ${u.status}">${st[u.status]||u.status}</span></small></div>
      <div class="user-actions">${u.username!=='admin'?`${u.status!=='approved'?`<button class="btn btn-success" onclick="window.adminManager.approveUser('${u.username}')">✓</button>`:''}${u.status!=='revoked'?`<button class="btn btn-danger" onclick="window.adminManager.revokeUser('${u.username}')">✗</button>`:''}<button class="btn btn-secondary" onclick="window.adminManager.deleteUser('${u.username}')">🗑️</button>`:'<span>Admin principal</span>'}</div></div>`).join('')}</div>`;
  }
  async renderDataTab(c){
    const faults=await db.count('faults');
    const last=window.updateManager?await updateManager.lastUpdateLabel():'?';
    c.innerHTML=`<h3>📊 Données & mises à jour</h3>
      <p><strong>Pannes :</strong> ${faults} | <strong>Campagnes :</strong> ${(window.AUTO_DATA&&AUTO_DATA.campaigns||[]).length} | <strong>Dernière MàJ :</strong> ${last}</p>
      <button class="btn btn-primary" onclick="window.updateManager.refresh(true)">🔄 MàJ manuelle</button>
      <button class="btn btn-secondary" onclick="window.updateManager.importNHTSA()">🌐 Rappels NHTSA (FR)</button>
      <button class="btn btn-secondary" onclick="window.updateManager.importNewModels()">🆕 Nouveaux modèles</button>
      <h4>Importer un flux JSON</h4>
      <input type="text" id="feedUrl" placeholder="https://.../feed.json" style="width:100%;margin:.25rem 0">
      <button class="btn btn-secondary" onclick="window.updateManager.importFromUrl(document.getElementById('feedUrl').value)">Par URL</button>
      <input type="file" id="feedFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importFeedFile()">Par fichier</button>
      <h4>Pannes locales</h4>
      <input type="file" id="importFaultsFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importFaultsFile()">Importer</button>
      <button class="btn btn-secondary" onclick="window.backupManager.exportFaults()">Exporter</button>`;
  }
  async renderPersoTab(c){
    const op=await DBUtils.getSetting('wallpaperOpacity');
    const val=(op==null?50:op);
    c.innerHTML=`<h3>🖼️ Fond d'écran & opacité</h3>
      <p>Photo visible en permanence ; réglez son taux d'opacité (diffusé aux tiers via Export/Import).</p>
      <input type="file" id="wallpaperFile" accept="image/*">
      <button class="btn btn-primary" onclick="window.adminManager.setWallpaperFromFile()" style="margin:.5rem">Appliquer le fond</button>
      <button class="btn btn-danger" onclick="window.adminManager.removeWallpaper()">Retirer</button>
      <h4>Taux d'opacité : <span id="opVal">${val}</span> %</h4>
      <input type="range" id="wpOpacity" min="5" max="100" step="5" value="${val}" style="width:100%" oninput="window.previewWallpaperOpacity(this.value)">
      <button class="btn btn-secondary" onclick="window.adminManager.saveWallpaperOpacity()" style="margin-top:.5rem">💾 Enregistrer l'opacité</button>`;
  }
  async saveWallpaperOpacity(){
    const r=document.getElementById('wpOpacity'); if(!r)return;
    await DBUtils.setSetting('wallpaperOpacity', parseInt(r.value,10));
    if(window.applyWallpaper) await window.applyWallpaper();
    this.toast('💾 Opacité enregistrée : '+r.value+' %');
  }
  async renderShareTab(c){
    const link=window.backupManager?backupManager.generateShareLink():'';
    c.innerHTML=`<h3>📤 Partager</h3><div class="share-result"><code>${link}</code></div><button class="btn btn-secondary" onclick="window.adminManager.copyShareLink()" style="margin-top:.75rem">📋 Copier</button><h4>📱 APK</h4><ol style="padding-left:1.25rem"><li>GitHub Pages (HTTPS)</li><li>pwabuilder.com → Package for stores → Android</li><li>Installer l'APK</li></ol>`;
  }
  async approveUser(u){ if(!confirm('Autoriser '+u+' ?'))return; await DBUtils.updateUser(u,{status:'approved'}); this.toast('✅ '+u+' autorisé'); this.switchTab('users'); }
  async revokeUser(u){ if(!confirm('Révoquer '+u+' ?'))return; await DBUtils.updateUser(u,{status:'revoked'}); this.toast('🚫 '+u+' révoqué'); this.switchTab('users'); }
  async deleteUser(u){ if(!confirm('Supprimer '+u+' ?'))return; await DBUtils.deleteUser(u); this.toast('🗑️ supprimé'); this.switchTab('users'); }
  async approveRequest(id){ const r=await db.get('accessRequests',id); if(!r)return; try{ await db.put('users',{username:r.username,password:r.passwordHash,role:'user',status:'approved',firstName:r.firstName,createdAt:Date.now(),lastLogin:null}); }catch(e){ await DBUtils.updateUser(r.username,{status:'approved'}); } await DBUtils.updateAccessRequest(id,{status:'approved'}); this.toast('✅ '+r.firstName+' autorisé'); this.refreshBadge(); this.switchTab('pending'); }
  async rejectRequest(id){ const r=await db.get('accessRequests',id); if(!r)return; await DBUtils.updateAccessRequest(id,{status:'rejected'}); this.toast('❌ demande refusée'); this.refreshBadge(); this.switchTab('pending'); }
  toast(m){ if(window.backupManager&&backupManager.showNotification) backupManager.showNotification(m,'success'); }
  async setWallpaperFromFile(){ const f=document.getElementById('wallpaperFile'); if(!f||!f.files[0]){ this.toast('Choisissez une image','error'); return; } const rd=new FileReader(); rd.onload=async()=>{ await DBUtils.setWallpaper(rd.result); if(window.applyWallpaper) await window.applyWallpaper(); this.toast('🖼️ Fond appliqué'); }; rd.readAsDataURL(f.files[0]); }
  async removeWallpaper(){ await DBUtils.setWallpaper(null); if(window.applyWallpaper) await window.applyWallpaper(); this.toast('Fond retiré'); }
  async importFaultsFile(){ const f=document.getElementById('importFaultsFile'); if(f&&f.files[0]) await backupManager.importFaults(f.files[0]); }
  async importFeedFile(){ const f=document.getElementById('feedFile'); if(f&&f.files[0]) await updateManager.importFromFile(f.files[0]); }
  copyShareLink(){ if(navigator.clipboard) navigator.clipboard.writeText(backupManager.generateShareLink()).then(()=>this.toast('Lien copié')); }
  showAPKInstructions(){ alert('1. GitHub Pages\n2. pwabuilder.com → URL\n3. Package for stores → Android\n4. Installer APK'); }
}
if (typeof window !== 'undefined') window.AdminManager = AdminManager;

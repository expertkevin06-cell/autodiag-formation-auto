class AdminManager {
  constructor(){ this.currentUser=null; this.attachEventListeners(); }

  attachEventListeners(){
    const adminBtn=document.getElementById('adminBtn');
    if(adminBtn) adminBtn.addEventListener('click', ()=>this.showAdminModal());
    const adminClose=document.getElementById('adminClose');
    if(adminClose) adminClose.addEventListener('click', ()=>document.getElementById('adminModal').classList.remove('active'));
    const shareClose=document.getElementById('shareClose');
    if(shareClose) shareClose.addEventListener('click', ()=>document.getElementById('shareModal').classList.remove('active'));
    document.addEventListener('click', e=>{ if(e.target.classList.contains('tab-btn')) this.switchTab(e.target.dataset.tab); });
    const gl=document.getElementById('generateLink'); if(gl) gl.addEventListener('click', ()=>this.copyShareLink());
    const da=document.getElementById('downloadAPK'); if(da) da.addEventListener('click', ()=>this.showAPKInstructions());
    const ed=document.getElementById('exportData'); if(ed) ed.addEventListener('click', ()=>window.backupManager.exportData());
    const ub=document.getElementById('updateBtn'); if(ub) ub.addEventListener('click', ()=>window.updateManager.refresh(true));
  }

  setCurrentUser(user){
    this.currentUser=user;
    const adminBtn=document.getElementById('adminBtn');
    const updateBtn=document.getElementById('updateBtn');
    const userDisplay=document.getElementById('userDisplay');
    if(user){
      if(userDisplay) userDisplay.textContent='👤 '+user.username;
      const isAdmin=user.role==='admin';
      if(adminBtn) adminBtn.style.display=isAdmin?'inline-block':'none';
      if(updateBtn) updateBtn.style.display=isAdmin?'inline-block':'none';
      if(isAdmin) this.refreshBadge();
    } else {
      if(userDisplay) userDisplay.textContent='';
      if(adminBtn) adminBtn.style.display='none';
      if(updateBtn) updateBtn.style.display='none';
      const b=document.getElementById('adminBadge'); if(b) b.style.display='none';
    }
  }

  async refreshBadge(){
    const n=await DBUtils.pendingCount();
    const b=document.getElementById('adminBadge');
    if(!b) return;
    b.textContent=n; b.style.display=n>0?'inline-block':'none';
  }

  async showAdminModal(){
    if(!this.currentUser||this.currentUser.role!=='admin'){ alert('Accès réservé aux administrateurs'); return; }
    document.getElementById('adminModal').classList.add('active');
    this.switchTab('pending');
  }

  async switchTab(tab){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    const c=document.getElementById('adminContent');
    if(tab==='pending') await this.renderPendingTab(c);
    if(tab==='users') await this.renderUsersTab(c);
    if(tab==='data') await this.renderDataTab(c);
    if(tab==='perso') await this.renderPersoTab(c);
    if(tab==='share') await this.renderShareTab(c);
  }

  async renderPendingTab(c){
    const reqs=(await DBUtils.getAllAccessRequests()).filter(r=>r.status==='pending');
    c.innerHTML=`<h3>📨 Demandes d'accès en attente (${reqs.length})</h3>
      ${reqs.length===0?'<p style="color:var(--text-light)">Aucune demande en attente</p>':''}
      <div class="user-list">${reqs.map(r=>`
        <div class="user-item">
          <div class="user-info"><strong>${r.firstName} (${r.username})</strong>
            <small>${r.email?('📧 '+r.email+' | '):''}${r.message?('💬 '+r.message+' | '):''}🕐 ${new Date(r.createdAt).toLocaleDateString('fr-FR')}</small></div>
          <div class="user-actions">
            <button class="btn btn-success" onclick="window.adminManager.approveRequest('${r.id}')">✓ Autoriser</button>
            <button class="btn btn-danger" onclick="window.adminManager.rejectRequest('${r.id}')">✗ Refuser</button>
          </div>
        </div>`).join('')}</div>`;
  }

  async renderUsersTab(c){
    const users=await DBUtils.getAllUsers();
    c.innerHTML=`<h3>👥 Utilisateurs (${users.length})</h3><div class="user-list">${users.map(u=>`
      <div class="user-item">
        <div class="user-info"><strong>${u.username}</strong>
          <small>Rôle: ${u.role} | Statut: <span class="status-badge ${u.status}">${{pending:'En attente',approved:'Autorisé',revoked:'Révoqué'}[u.status]||u.status}</span>${u.lastLogin?(' | Dernière connexion: '+new Date(u.lastLogin).toLocaleDateString('fr-FR')):''}</small></div>
        <div class="user-actions">
          ${u.username!=='admin'?`
            ${u.status!=='approved'?`<button class="btn btn-success" onclick="window.adminManager.approveUser('${u.username}')">✓ Autoriser</button>`:''}
            ${u.status!=='revoked'?`<button class="btn btn-danger" onclick="window.adminManager.revokeUser('${u.username}')">✗ Révoquer</button>`:''}
            <button class="btn btn-secondary" onclick="window.adminManager.deleteUser('${u.username}')">🗑️</button>`
          :'<span style="color:var(--text-light);font-size:.75rem">Admin principal</span>'}
        </div>
      </div>`).join('')}</div>`;
  }

  async renderDataTab(c){
    const faults=await db.count('faults');
    const last=await window.updateManager.lastUpdateLabel();
    c.innerHTML=`<h3>📊 Données & mises à jour</h3>
      <p><strong>Pannes en base :</strong> ${faults} | <strong>Campagnes :</strong> ${AUTO_DATA.campaigns.length}</p>
      <p><strong>Dernière mise à jour :</strong> ${last} <em>(auto tous les 30 jours)</em></p>
      <button class="btn btn-primary" onclick="window.updateManager.refresh(true)" style="margin:.5rem 0">🔄 Mise à jour manuelle maintenant</button>
      <h4>Importer des pannes (JSON)</h4>
      <input type="file" id="importFaultsFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importFaultsFile()">Importer</button>
      <h4>Exporter les pannes</h4>
      <button class="btn btn-secondary" onclick="window.backupManager.exportFaults()">Exporter</button>`;
  }

  async renderPersoTab(c){
    c.innerHTML=`<h3>🖼️ Fond d'écran (admin)</h3>
      <p>Photo appliquée à tous les écrans et <strong>diffusée aux tiers</strong> via Export/Import de sauvegarde.</p>
      <input type="file" id="wallpaperFile" accept="image/*">
      <button class="btn btn-primary" onclick="window.adminManager.setWallpaperFromFile()" style="margin:.5rem">Appliquer le fond</button>
      <button class="btn btn-danger" onclick="window.adminManager.removeWallpaper()">Retirer</button>`;
  }

  async renderShareTab(c){
    const link=window.backupManager.generateShareLink();
    c.innerHTML=`<h3>📤 Partager</h3><div class="share-result"><code>${link}</code></div>
      <button class="btn btn-secondary" onclick="window.adminManager.copyShareLink()" style="margin-top:.75rem">📋 Copier</button>
      <h4>📱 APK</h4><ol style="padding-left:1.25rem"><li>Hébergé sur GitHub Pages (HTTPS)</li><li>pwabuilder.com → URL → Package for stores → Android</li><li>Installer l'APK</li></ol>`;
  }

  getStatusLabel(s){ return {pending:'En attente',approved:'Autorisé',revoked:'Révoqué'}[s]||s; }

  async approveUser(u){ if(!confirm('Autoriser '+u+' ?'))return; await DBUtils.updateUser(u,{status:'approved'}); backupManager.showNotification('✅ '+u+' autorisé','success'); this.switchTab('users'); }
  async revokeUser(u){ if(!confirm('Révoquer '+u+' ?'))return; await DBUtils.updateUser(u,{status:'revoked'}); backupManager.showNotification('🚫 '+u+' révoqué','success'); this.switchTab('users'); }
  async deleteUser(u){ if(!confirm('Supprimer '+u+' ?'))return; await DBUtils.deleteUser(u); backupManager.showNotification('🗑️ '+u+' supprimé','success'); this.switchTab('users'); }

  async approveRequest(id){
    const r=await db.get('accessRequests',id); if(!r) return;
    try{ await db.put('users',{ username:r.username, password:r.passwordHash, role:'user', status:'approved', firstName:r.firstName, createdAt:Date.now(), lastLogin:null }); }catch(e){ await DBUtils.updateUser(r.username,{status:'approved'}); }
    await DBUtils.updateAccessRequest(id,{status:'approved'});
    backupManager.showNotification('✅ '+r.firstName+' ('+r.username+') autorisé','success');
    this.refreshBadge(); this.switchTab('pending');
  }
  async rejectRequest(id){
    const r=await db.get('accessRequests',id); if(!r) return;
    await DBUtils.updateAccessRequest(id,{status:'rejected'});
    backupManager.showNotification('❌ Demande de '+r.firstName+' refusée','success');
    this.refreshBadge(); this.switchTab('pending');
  }

  async setWallpaperFromFile(){
    const f=document.getElementById('wallpaperFile');
    if(!f||!f.files[0]){ backupManager.showNotification('Choisissez une image','error'); return; }
    const reader=new FileReader();
    reader.onload=async()=>{ await DBUtils.setWallpaper(reader.result); window.applyWallpaper(); backupManager.showNotification('🖼️ Fond d\'écran appliqué','success'); };
    reader.readAsDataURL(f.files[0]);
  }
  async removeWallpaper(){ await DBUtils.setWallpaper(null); window.applyWallpaper(); backupManager.showNotification('Fond retiré','success'); }

  async importFaultsFile(){
    const f=document.getElementById('importFaultsFile');
    if(!f||!f.files[0]) return;
    await window.backupManager.importFaults(f.files[0]);
  }
  copyShareLink(){
    const l=window.backupManager.generateShareLink();
    navigator.clipboard.writeText(l).then(()=>backupManager.showNotification('Lien copié','success'));
  }
  showAPKInstructions(){ alert('1. Hébergez sur GitHub Pages\n2. pwabuilder.com → URL\n3. Package for stores → Android\n4. Installez l\'APK'); }
}
if (typeof window !== 'undefined') window.AdminManager = AdminManager;

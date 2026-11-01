class AdminManager {
  constructor(){ this.currentUser=null; this.attachEventListeners(); }
  attachEventListeners(){
    document.getElementById('adminBtn').addEventListener('click',()=>this.showAdminModal());
    document.getElementById('adminClose').addEventListener('click',()=>document.getElementById('adminModal').classList.remove('active'));
    document.getElementById('shareClose').addEventListener('click',()=>document.getElementById('shareModal').classList.remove('active'));
    document.addEventListener('click',e=>{ if(e.target.classList.contains('tab-btn')) this.switchTab(e.target.dataset.tab); });
    document.getElementById('generateLink').addEventListener('click',()=>this.copyShareLink());
    document.getElementById('downloadAPK').addEventListener('click',()=>this.showAPKInstructions());
    document.getElementById('exportData').addEventListener('click',()=>window.backupManager.exportData());
    document.getElementById('updateBtn').addEventListener('click',()=>window.updateManager.refresh(true));
  }
  setCurrentUser(user){
    this.currentUser=user;
    const isAdmin=user&&user.role==='admin';
    document.getElementById('userDisplay').textContent=user?('👤 '+user.username):'';
    document.getElementById('adminBtn').style.display=isAdmin?'inline-block':'none';
    document.getElementById('updateBtn').style.display=isAdmin?'inline-block':'none';
    if(isAdmin) this.refreshBadge(); else document.getElementById('adminBadge').style.display='none';
  }
  async refreshBadge(){ const n=await DBUtils.pendingCount(); const b=document.getElementById('adminBadge'); b.textContent=n; b.style.display=n>0?'inline-block':'none'; }
  async showAdminModal(){ if(!this.currentUser||this.currentUser.role!=='admin'){alert('Accès réservé');return;} document.getElementById('adminModal').classList.add('active'); this.switchTab('pending'); }
  async switchTab(tab){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    const c=document.getElementById('adminContent');
    if(tab==='pending') await this.renderPendingTab(c);
    if(tab==='users') await this.renderUsersTab(c);
    if(tab==='data') await this.renderDataTab(c);
    if(tab==='perso') await this.renderPersoTab(c);
    if(tab==='share') await this.renderShareTab(c);
  }
  async renderPendingTab(c){
    const reqs=(await DBUtils.getAllAccessRequests()).filter(r=>r.status==='pending');
    c.innerHTML=`<h3>📨 Demandes en attente (${reqs.length})</h3>${reqs.length===0?'<p>Aucune demande</p>':''}
      <div class="user-list">${reqs.map(r=>`<div class="user-item"><div class="user-info"><strong>${r.firstName} (${r.username})</strong><small>${r.email?('📧 '+r.email+' | '):''}${r.message?('💬 '+r.message+' | '):''}🕐 ${new Date(r.createdAt).toLocaleDateString('fr-FR')}</small></div>
      <div class="user-actions"><button class="btn btn-success" onclick="window.adminManager.approveRequest('${r.id}')">✓ Autoriser</button><button class="btn btn-danger" onclick="window.adminManager.rejectRequest('${r.id}')">✗ Refuser</button></div></div>`).join('')}</div>`;
  }
  async renderUsersTab(c){
    const users=await DBUtils.getAllUsers();
    c.innerHTML=`<h3>👥 Utilisateurs (${users.length})</h3><div class="user-list">${users.map(u=>`<div class="user-item"><div class="user-info"><strong>${u.firstName?(u.firstName+' / '):''}${u.username}</strong><small>Rôle: ${u.role} | Statut: <span class="status-badge ${u.status}">${{pending:'En attente',approved:'Autorisé',revoked:'Révoqué'}[u.status]||u.status}</span></small></div>
      <div class="user-actions">${u.username!=='admin'?`${u.status!=='approved'?`<button class="btn btn-success" onclick="window.adminManager.approveUser('${u.username}')">✓</button>`:''}${u.status!=='revoked'?`<button class="btn btn-danger" onclick="window.adminManager.revokeUser('${u.username}')">✗</button>`:''}<button class="btn btn-secondary" onclick="window.adminManager.deleteUser('${u.username}')">🗑️</button>`:'<span>Admin principal</span>'}</div></div>`).join('')}</div>`;
  }
  async renderDataTab(c){
    const faults=await db.count('faults'); const last=await window.updateManager.lastUpdateLabel();
    c.innerHTML=`<h3>📊 Données & mises à jour</h3>
      <p><strong>Pannes :</strong> ${faults} | <strong>Campagnes :</strong> ${AUTO_DATA.campaigns.length} | <strong>Dernière MàJ :</strong> ${last}</p>
      <button class="btn btn-primary" onclick="window.updateManager.refresh(true)">🔄 MàJ manuelle (feed + resync)</button>
      <button class="btn btn-secondary" onclick="window.updateManager.importNHTSA()">🌐 Rappels NHTSA (marque+modèle filtrés, traduits FR)</button>
      <button class="btn btn-secondary" onclick="window.updateManager.importNewModels()">🆕 Nouveaux modèles 2026 (NHTSA)</button>
      <h4>Importer un flux JSON (Safety Gate UE, sites spécialisés...)</h4>
      <input type="text" id="feedUrl" placeholder="https://.../feed.json" style="width:100%;margin:.25rem 0">
      <button class="btn btn-secondary" onclick="window.updateManager.importFromUrl(document.getElementById('feedUrl').value)">Importer par URL</button>
      <input type="file" id="feedFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importFeedFile()">Importer par fichier</button>
      <h4>Pannes locales</h4>
      <input type="file" id="importFaultsFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importFaultsFile()">Importer pannes</button>
      <button class="btn btn-secondary" onclick="window.backupManager.exportFaults()">Exporter pannes</button>`;
  }
  async renderPersoTab(c){
    c.innerHTML=`<h3>🖼️ Fond d'écran (visible 50 % en permanence)</h3>
      <p>Appliqué à tous les écrans et diffusé aux tiers via Export/Import.</p>
      <input type="file" id="wallpaperFile" accept="image/*">
      <button class="btn btn-primary" onclick="window.adminManager.setWallpaperFromFile()" style="margin:.5rem">Appliquer</button>
      <button class="btn btn-danger" onclick="window.adminManager.removeWallpaper()">Retirer</button>`;
  }
  async renderShareTab(c){
    const link=window.backupManager.generateShareLink();
    c.innerHTML=`<h3>📤 Partager</h3><div class="share-result"><code>${link}</code></div><button class="btn btn-secondary" onclick="window.adminManager.copyShareLink()" style="margin-top:.75rem">📋 Copier</button><h4>📱 APK</h4><ol style="padding-left:1.25rem"><li>GitHub Pages (HTTPS)</li><li>pwabuilder.com → Package for stores → Android</li><li>Installer l'APK</li></ol>`;
  }
  async approveUser(u){ if(!confirm('Autoriser '+u+' ?'))return; await DBUtils.updateUser(u,{status:'approved'}); backupManager.showNotification('✅ '+u+' autorisé','success'); this.switchTab('users'); }
  async revokeUser(u){ if(!confirm('Révoquer '+u+' ?'))return; await DBUtils.updateUser(u,{status:'revoked'}); backupManager.showNotification('🚫 '+u+' révoqué','success'); this.switchTab('users'); }
  async deleteUser(u){ if(!confirm('Supprimer '+u+' ?'))return; await DBUtils.deleteUser(u); backupManager.showNotification('🗑️ supprimé','success'); this.switchTab('users'); }
  async approveRequest(id){ const r=await db.get('accessRequests',id); if(!r)return; try{ await db.put('users',{username:r.username,password:r.passwordHash,role:'user',status:'approved',firstName:r.firstName,createdAt:Date.now(),lastLogin:null}); }catch(e){ await DBUtils.updateUser(r.username,{status:'approved'}); } await DBUtils.updateAccessRequest(id,{status:'approved'}); backupManager.showNotification('✅ '+r.firstName+' autorisé','success'); this.refreshBadge(); this.switchTab('pending'); }
  async rejectRequest(id){ const r=await db.get('accessRequests',id); if(!r)return; await DBUtils.updateAccessRequest(id,{status:'rejected'}); backupManager.showNotification('❌ demande refusée','success'); this.refreshBadge(); this.switchTab('pending'); }
  async setWallpaperFromFile(){ const f=document.getElementById('wallpaperFile'); if(!f||!f.files[0]){backupManager.showNotification('Choisissez une image','error');return;} const rd=new FileReader(); rd.onload=async()=>{ await DBUtils.setWallpaper(rd.result); window.applyWallpaper(); backupManager.showNotification('🖼️ Fond appliqué (50 %)','success'); }; rd.readAsDataURL(f.files[0]); }
  async removeWallpaper(){ await DBUtils.setWallpaper(null); window.applyWallpaper(); backupManager.showNotification('Fond retiré','success'); }
  async importFaultsFile(){ const f=document.getElementById('importFaultsFile'); if(f&&f.files[0]) await window.backupManager.importFaults(f.files[0]); }
  async importFeedFile(){ const f=document.getElementById('feedFile'); if(f&&f.files[0]) await window.updateManager.importFromFile(f.files[0]); }
  copyShareLink(){ navigator.clipboard.writeText(window.backupManager.generateShareLink()).then(()=>backupManager.showNotification('Lien copié','success')); }
  showAPKInstructions(){ alert('1. GitHub Pages\n2. pwabuilder.com → URL\n3. Package for stores → Android\n4. Installer APK'); }
}
if (typeof window !== 'undefined') window.AdminManager = AdminManager;

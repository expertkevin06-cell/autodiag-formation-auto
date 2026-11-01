class AutoDiagApp {
  constructor(){ this.filterManager=null; this.backupManager=null; this.adminManager=null; this.currentUser=null; }
  async init(){
    try{
      await db.init(); await DBUtils.initializeDefaults(); await this.registerServiceWorker();
      this.filterManager=new FilterManager(); this.backupManager=new BackupManager(); this.adminManager=new AdminManager();
      window.updateManager=new UpdateManager();
      window.filterManager=this.filterManager; window.backupManager=this.backupManager; window.adminManager=this.adminManager;
      await this.filterManager.init(); await window.updateManager.init(); await this.applyWallpaper();
      await this.checkSession(); this.attachGlobalEventListeners(); this.prefillSaved(); this.updateConnectionStatus();
      window.addEventListener('online',()=>this.updateConnectionStatus()); window.addEventListener('offline',()=>this.updateConnectionStatus());
    }catch(e){ console.error(e); alert('Erreur d\'initialisation : '+e.message); }
  }
  async registerServiceWorker(){ if('serviceWorker' in navigator){ try{ await navigator.serviceWorker.register('./sw.js'); }catch(e){} } }
  async applyWallpaper(){
    const url=await DBUtils.getWallpaper();
    const layer=document.getElementById('wpLayer');
    if(layer) layer.style.backgroundImage = url ? `url(${url})` : '';
  }
  prefillSaved(){
    const creds=DBUtils.getCredentials(); const fill=document.getElementById('fillSaved');
    if(creds){ document.getElementById('loginUsername').value=creds.username; document.getElementById('rememberMe').checked=true; if(fill){fill.style.display='block'; fill.onclick=()=>{document.getElementById('loginPassword').value=creds.password;};} }
    else if(fill) fill.style.display='none';
  }
  attachGlobalEventListeners(){
    document.getElementById('loginForm').addEventListener('submit',e=>this.handleLogin(e));
    document.getElementById('logoutBtn').addEventListener('click',()=>this.handleLogout());
    document.getElementById('modalClose').addEventListener('click',()=>document.getElementById('faultModal').classList.remove('active'));
    document.getElementById('openRequest').addEventListener('click',()=>document.getElementById('requestModal').classList.add('active'));
    document.getElementById('requestClose').addEventListener('click',()=>document.getElementById('requestModal').classList.remove('active'));
    document.getElementById('requestForm').addEventListener('submit',e=>this.handleRequest(e));
    window.addEventListener('click',e=>{ if(e.target.classList.contains('modal')) e.target.classList.remove('active'); });
    ['filterCode','filterSearch'].forEach(id=>document.getElementById(id).addEventListener('keypress',e=>{ if(e.key==='Enter') this.filterManager.applyFilters(); }));
  }
  async handleRequest(e){
    e.preventDefault();
    const info=document.getElementById('requestInfo');
    const firstName=document.getElementById('reqFirstName').value.trim();
    const username=document.getElementById('reqUsername').value.trim();
    const password=document.getElementById('reqPassword').value;
    if(!firstName||!username||!password){ info.textContent='Prénom, identifiant et mot de passe obligatoires'; return; }
    if(await DBUtils.getUser(username)){ info.textContent='Identifiant déjà existant'; return; }
    await DBUtils.createAccessRequest({ firstName, username, passwordHash:await DBUtils.hashPassword(password), email:document.getElementById('reqEmail').value.trim(), message:document.getElementById('reqMessage').value.trim() });
    info.style.color='#065f46'; info.textContent='✅ Demande envoyée (notification admin immédiate)';
    document.getElementById('requestForm').reset();
  }
  async handleLogin(e){
    e.preventDefault();
    const username=document.getElementById('loginUsername').value.trim();
    const password=document.getElementById('loginPassword').value;
    const err=document.getElementById('loginError'); err.textContent='';
    try{
      const user=await DBUtils.getUser(username);
      if(!user){ err.textContent='Utilisateur non trouvé. Faites une demande d\'accès.'; return; }
      if(user.status==='revoked'){ err.textContent='Accès révoqué.'; return; }
      if(user.status==='pending'){ err.textContent='Compte en attente d\'autorisation.'; return; }
      if(!(await DBUtils.verifyPassword(username,password))){ err.textContent='Mot de passe incorrect'; return; }
      this.currentUser=user; await DBUtils.updateUser(username,{lastLogin:Date.now()});
      sessionStorage.setItem('currentUser',JSON.stringify(user));
      if(document.getElementById('rememberMe').checked) DBUtils.saveCredentials(username,password); else DBUtils.clearCredentials();
      this.adminManager.setCurrentUser(user); this.showMainScreen(); await this.filterManager.renderResults();
      if(user.role==='admin'){ const n=await DBUtils.pendingCount(); if(n>0){ backupManager.showNotification(`📨 ${n} demande(s) en attente`,'info'); this.adminManager.refreshBadge(); } }
    }catch(er){ err.textContent='Erreur : '+er.message; }
  }
  handleLogout(){ if(!confirm('Se déconnecter ?'))return; this.currentUser=null; sessionStorage.removeItem('currentUser'); this.adminManager.setCurrentUser(null); this.showLoginScreen(); document.getElementById('loginForm').reset(); this.prefillSaved(); }
  async checkSession(){ const s=sessionStorage.getItem('currentUser'); if(s){ try{ const u=JSON.parse(s); const d=await DBUtils.getUser(u.username); if(d&&d.status==='approved'){ this.currentUser=d; this.adminManager.setCurrentUser(d); this.showMainScreen(); await this.filterManager.renderResults(); return; } }catch(e){} } this.showLoginScreen(); }
  showLoginScreen(){ document.getElementById('loginScreen').classList.add('active'); document.getElementById('mainScreen').classList.remove('active'); }
  showMainScreen(){ document.getElementById('loginScreen').classList.remove('active'); document.getElementById('mainScreen').classList.add('active'); }
  updateConnectionStatus(){ const el=document.getElementById('connectionStatus'); el.textContent=navigator.onLine?'● En ligne (4G/5G/WiFi)':'● Hors ligne (cache local)'; el.parentElement.classList.toggle('online',navigator.onLine); }
}
window.applyWallpaper=async()=>{ if(window.autoDiagApp) await window.autoDiagApp.applyWallpaper(); };
document.addEventListener('DOMContentLoaded',()=>{ const app=new AutoDiagApp(); window.autoDiagApp=app; app.init(); });

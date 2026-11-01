class AutoDiagApp {
  constructor(){ this.filterManager=null; this.backupManager=null; this.adminManager=null; this.currentUser=null; }

  async init(){
    window.addEventListener('error', e => console.error('[APP ERROR]', e.message));
    window.addEventListener('unhandledrejection', e => console.error('[APP PROMISE]', e.reason));
    try{ await db.init(); await DBUtils.initializeDefaults(); }catch(e){ console.error('[DB]', e); }
    try{ await this.registerServiceWorker(); }catch(e){}

    this.filterManager=new FilterManager(); this.backupManager=new BackupManager(); this.adminManager=new AdminManager();
    window.updateManager=new UpdateManager();
    window.filterManager=this.filterManager; window.backupManager=this.backupManager; window.adminManager=this.adminManager;

    try{ this.attachGlobalEventListeners(); }catch(e){ console.error('[LISTENERS]', e); }
    try{ await this.checkSession(); }catch(e){ this.showLoginScreen(); }
    try{ this.refreshQuickLogin(); }catch(e){}
    try{ this.clearLoginFields(); }catch(e){}
    try{ await this.applyWallpaper(); }catch(e){}
    try{ this.updateConnectionStatus(); }catch(e){}
    window.addEventListener('online',()=>this.updateConnectionStatus());
    window.addEventListener('offline',()=>this.updateConnectionStatus());
    // Anti-autofill : re-vide les cases à chaque affichage de page
    window.addEventListener('pageshow',()=>this.clearLoginFields());

    try{ await this.filterManager.init(); }catch(e){ console.error('[FILTRES]', e); }
    try{ await window.updateManager.init(); }catch(e){ console.error('[UPDATER]', e); }
    try{ if(this.currentUser) await this.filterManager.renderResults(); }catch(e){ console.error('[RESULTS]', e); }
    console.log('[APP] v11 prête');
  }

  async registerServiceWorker(){ if('serviceWorker' in navigator){ try{ await navigator.serviceWorker.register('./sw.js'); }catch(e){} } }

  // Cases identifiant/mot de passe TOUJOURS vides
  clearLoginFields(){
    const u=document.getElementById('loginUsername'), p=document.getElementById('loginPassword');
    if(u) u.value='';
    if(p) p.value='';
  }

  // Affiche le bouton de connexion rapide si compte enregistré (sans rien afficher dans les cases)
  refreshQuickLogin(){
    const wrap=document.getElementById('quickLoginWrap');
    if(!wrap) return;
    wrap.style.display = DBUtils.getCredentials() ? 'block' : 'none';
  }

  async applyWallpaper(){
    const layer=document.getElementById('wpLayer'); if(!layer) return;
    const url=await DBUtils.getWallpaper();
    layer.style.backgroundImage = url ? `url(${url})` : '';
    const op=await DBUtils.getSetting('wallpaperOpacity');
    layer.style.opacity = (op==null?50:op)/100;
  }

  attachGlobalEventListeners(){
    const on=(id,ev,fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); };
    on('loginForm','submit',e=>this.handleLogin(e));
    on('quickLoginBtn','click',()=>this.quickLogin());
    on('logoutBtn','click',()=>this.handleLogout());
    on('modalClose','click',()=>document.getElementById('faultModal').classList.remove('active'));
    on('openRequest','click',()=>document.getElementById('requestModal').classList.add('active'));
    on('requestClose','click',()=>document.getElementById('requestModal').classList.remove('active'));
    on('requestForm','submit',e=>this.handleRequest(e));
    window.addEventListener('click',e=>{ if(e.target.classList&&e.target.classList.contains('modal')) e.target.classList.remove('active'); });
    ['filterCode','filterSearch'].forEach(id=>on(id,'keypress',e=>{ if(e.key==='Enter') this.filterManager.applyFilters(); }));
  }

  // Authentification centralisée (jamais d'affichage des identifiants)
  async attemptLogin(username, password, remember){
    const user=await DBUtils.getUser(username);
    if(!user) throw new Error('Utilisateur non trouvé. Faites une demande d\'accès.');
    if(user.status==='revoked') throw new Error('Accès révoqué.');
    if(user.status==='pending') throw new Error('Compte en attente d\'autorisation.');
    if(!(await DBUtils.verifyPassword(username,password))) throw new Error('Mot de passe incorrect');
    this.currentUser=user;
    await DBUtils.updateUser(username,{lastLogin:Date.now()});
    sessionStorage.setItem('currentUser',JSON.stringify(user));
    if(remember) DBUtils.saveCredentials(username,password);
    this.adminManager.setCurrentUser(user);
    this.showMainScreen();
    this.clearLoginFields();
    try{ await this.filterManager.renderResults(); }catch(e){}
    if(user.role==='admin'){
      const n=await DBUtils.pendingCount();
      if(n>0){ backupManager.showNotification(`📨 ${n} demande(s) en attente`,'info'); this.adminManager.refreshBadge(); }
    }
    return user;
  }

  async handleLogin(e){
    e.preventDefault();
    const username=document.getElementById('loginUsername').value.trim();
    const password=document.getElementById('loginPassword').value;
    const remember=document.getElementById('rememberMe').checked;
    const err=document.getElementById('loginError'); err.textContent='';
    try{
      await this.attemptLogin(username,password,remember);
      this.refreshQuickLogin();
    }catch(er){ err.textContent=er.message; this.clearLoginFields(); }
  }

  // Connexion rapide : utilise les identifiants enregistrés SANS les afficher
  async quickLogin(){
    const creds=DBUtils.getCredentials();
    const err=document.getElementById('loginError'); err.textContent='';
    if(!creds){ this.refreshQuickLogin(); return; }
    try{ await this.attemptLogin(creds.username, creds.password, true); }
    catch(er){ err.textContent=er.message; DBUtils.clearCredentials(); this.refreshQuickLogin(); }
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

  handleLogout(){
    if(!confirm('Se déconnecter ?')) return;
    this.currentUser=null; sessionStorage.removeItem('currentUser');
    this.adminManager.setCurrentUser(null);
    this.showLoginScreen();
    this.clearLoginFields();
    document.getElementById('loginError').textContent='';
    this.refreshQuickLogin();
  }

  async checkSession(){
    const s=sessionStorage.getItem('currentUser');
    if(s){ try{
      const u=JSON.parse(s); const d=await DBUtils.getUser(u.username);
      if(d&&d.status==='approved'){ this.currentUser=d; this.adminManager.setCurrentUser(d); this.showMainScreen(); return; }
    }catch(e){} }
    this.showLoginScreen();
  }

  showLoginScreen(){ document.getElementById('loginScreen').classList.add('active'); document.getElementById('mainScreen').classList.remove('active'); }
  showMainScreen(){ document.getElementById('loginScreen').classList.remove('active'); document.getElementById('mainScreen').classList.add('active'); }
  updateConnectionStatus(){ const el=document.getElementById('connectionStatus'); if(!el)return; el.textContent=navigator.onLine?'● En ligne (4G/5G/WiFi)':'● Hors ligne (cache local)'; el.parentElement.classList.toggle('online',navigator.onLine); }
}
window.applyWallpaper=async()=>{ if(window.autoDiagApp) await window.autoDiagApp.applyWallpaper(); };
window.previewWallpaperOpacity=v=>{ const l=document.getElementById('wpLayer'); if(l) l.style.opacity=v/100; const s=document.getElementById('opVal'); if(s) s.textContent=v; };
document.addEventListener('DOMContentLoaded',()=>{ const app=new AutoDiagApp(); window.autoDiagApp=app; app.init(); });

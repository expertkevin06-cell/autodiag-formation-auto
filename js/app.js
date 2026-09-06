/**
 * Application principale AutoDiag Pro
 */

class AutoDiagApp {
  constructor() {
    this.filterManager = null;
    this.backupManager = null;
    this.adminManager = null;
    this.currentUser = null;
  }

  async init() {
    console.log('[App] Initialisation de AutoDiag Pro...');

    try {
      await db.init();
      await DBUtils.initializeDefaults();

      await this.registerServiceWorker();

      this.filterManager = new FilterManager();
      this.backupManager = new BackupManager();
      this.adminManager = new AdminManager();

      window.filterManager = this.filterManager;
      window.backupManager = this.backupManager;
      window.adminManager = this.adminManager;

      await this.filterManager.init();
      await this.checkSession();
      this.attachGlobalEventListeners();
      this.updateConnectionStatus();
      
      window.addEventListener('online', () => this.updateConnectionStatus());
      window.addEventListener('offline', () => this.updateConnectionStatus());

      await this.backupManager.handleShareLink();

      console.log('[App] Application initialisée avec succès');
    } catch (error) {
      console.error('[App] Erreur d\'initialisation:', error);
      alert('Erreur d\'initialisation de l\'application: ' + error.message);
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('[App] Service Worker enregistré:', registration.scope);
      } catch (error) {
        console.warn('[App] Service Worker non enregistré:', error);
      }
    }
  }

  async checkSession() {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        const dbUser = await DBUtils.getUser(user.username);
        
        if (dbUser && dbUser.status === 'approved') {
          this.currentUser = dbUser;
          this.adminManager.setCurrentUser(dbUser);
          this.showMainScreen();
          await this.filterManager.renderResults();
          return;
        }
      } catch (error) {
        console.error('[App] Erreur vérification session:', error);
      }
    }
    this.showLoginScreen();
  }

  attachGlobalEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        document.getElementById('faultModal').classList.remove('active');
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
      }
    });

    const filterCode = document.getElementById('filterCode');
    const filterSearch = document.getElementById('filterSearch');
    
    if (filterCode) {
      filterCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.filterManager.applyFilters();
      });
    }
    
    if (filterSearch) {
      filterSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.filterManager.applyFilters();
      });
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    if (!username || !password) {
      errorElement.textContent = 'Veuillez remplir tous les champs';
      return;
    }

    try {
      const user = await DBUtils.getUser(username);
      
      if (!user) {
        errorElement.textContent = 'Utilisateur non trouvé. Contactez un administrateur.';
        return;
      }

      if (user.status === 'revoked') {
        errorElement.textContent = 'Votre accès a été révoqué. Contactez un administrateur.';
        return;
      }

      if (user.status === 'pending') {
        errorElement.textContent = 'Votre compte est en attente d\'approbation.';
        return;
      }

      const validPassword = await DBUtils.verifyPassword(username, password);
      if (!validPassword) {
        errorElement.textContent = 'Mot de passe incorrect';
        return;
      }

      this.currentUser = user;
      await DBUtils.updateUser(username, { lastLogin: Date.now() });
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      this.adminManager.setCurrentUser(user);
      errorElement.textContent = '';
      
      this.showMainScreen();
      await this.filterManager.renderResults();
      
    } catch (error) {
      console.error('[App] Erreur de connexion:', error);
      errorElement.textContent = 'Erreur de connexion: ' + error.message;
    }
  }

  handleLogout() {
    if (!confirm('Voulez-vous vraiment vous déconnecter ?')) return;
    
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
    this.adminManager.setCurrentUser(null);
    this.showLoginScreen();
    
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').textContent = '';
  }

  showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
  }

  showMainScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
  }

  updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;

    if (navigator.onLine) {
      statusElement.textContent = '● En ligne';
      statusElement.parentElement.classList.add('online');
    } else {
      statusElement.textContent = '● Hors ligne';
      statusElement.parentElement.classList.remove('online');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AutoDiagApp();
  window.autoDiagApp = app;
  app.init();
});

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

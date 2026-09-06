/**
 * Gestion du mode administrateur
 */

class AdminManager {
  constructor() {
    this.currentUser = null;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const adminBtn = document.getElementById('adminBtn');
    const adminClose = document.getElementById('adminClose');
    const shareClose = document.getElementById('shareClose');

    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.showAdminModal());
    }

    if (adminClose) {
      adminClose.addEventListener('click', () => {
        document.getElementById('adminModal').classList.remove('active');
      });
    }

    if (shareClose) {
      shareClose.addEventListener('click', () => {
        document.getElementById('shareModal').classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      }
    });

    const generateLinkBtn = document.getElementById('generateLink');
    const downloadAPKBtn = document.getElementById('downloadAPK');
    const exportDataBtn = document.getElementById('exportData');

    if (generateLinkBtn) {
      generateLinkBtn.addEventListener('click', () => this.generateShareLink());
    }

    if (downloadAPKBtn) {
      downloadAPKBtn.addEventListener('click', () => this.showAPKInstructions());
    }

    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => window.backupManager.exportData());
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    const adminBtn = document.getElementById('adminBtn');
    const userDisplay = document.getElementById('userDisplay');
    
    if (user) {
      if (userDisplay) userDisplay.textContent = `👤 ${user.username}`;
      if (adminBtn) adminBtn.style.display = user.role === 'admin' ? 'inline-block' : 'none';
    } else {
      if (userDisplay) userDisplay.textContent = '';
      if (adminBtn) adminBtn.style.display = 'none';
    }
  }

  async showAdminModal() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('Accès réservé aux administrateurs');
      return;
    }

    const modal = document.getElementById('adminModal');
    modal.classList.add('active');
    this.switchTab('users');
  }

  async switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const content = document.getElementById('adminContent');
    
    switch (tab) {
      case 'users': await this.renderUsersTab(content); break;
      case 'pending': await this.renderPendingTab(content); break;
      case 'data': await this.renderDataTab(content); break;
      case 'share': await this.renderShareTab(content); break;
    }
  }

  async renderUsersTab(container) {
    const users = await DBUtils.getAllUsers();
    
    container.innerHTML = `
      <h3>👥 Utilisateurs enregistrés (${users.length})</h3>
      <div class="user-list">
        ${users.map(user => `
          <div class="user-item">
            <div class="user-info">
              <strong>${user.username}</strong>
              <small>
                Rôle: ${user.role} | 
                Statut: <span class="status-badge ${user.status}">${this.getStatusLabel(user.status)}</span> |
                Créé le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}
                ${user.lastLogin ? ` | Dernière connexion: ${new Date(user.lastLogin).toLocaleDateString('fr-FR')}` : ''}
              </small>
            </div>
            <div class="user-actions">
              ${user.username !== 'admin' ? `
                ${user.status !== 'approved' ? `<button class="btn btn-success" onclick="window.adminManager.approveUser('${user.username}')">✓ Approuver</button>` : ''}
                ${user.status !== 'revoked' ? `<button class="btn btn-danger" onclick="window.adminManager.revokeUser('${user.username}')">✗ Révoquer</button>` : ''}
                <button class="btn btn-secondary" onclick="window.adminManager.deleteUser('${user.username}')">🗑️</button>
              ` : '<span style="color: var(--text-light); font-size: 0.75rem;">Admin principal</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async renderPendingTab(container) {
    const requests = await DBUtils.getAllAccessRequests();
    const pendingRequests = requests.filter(r => r.status === 'pending');
    
    container.innerHTML = `
      <h3>⏳ Demandes en attente (${pendingRequests.length})</h3>
      ${pendingRequests.length === 0 ? '<p style="color: var(--text-light);">Aucune demande en attente</p>' : ''}
      <div class="user-list">
        ${pendingRequests.map(request => `
          <div class="user-item">
            <div class="user-info">
              <strong>${request.username}</strong>
              <small>
                Email: ${request.email || 'N/A'} |
                Message: ${request.message || 'Aucun'} |
                Demandé le: ${new Date(request.createdAt).toLocaleDateString('fr-FR')}
              </small>
            </div>
            <div class="user-actions">
              <button class="btn btn-success" onclick="window.adminManager.approveRequest('${request.id}')">✓ Accepter</button>
              <button class="btn btn-danger" onclick="window.adminManager.rejectRequest('${request.id}')">✗ Refuser</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async renderDataTab(container) {
    const faultsCount = await db.count('faults');
    const backups = await DBUtils.getAllBackups();
    
    container.innerHTML = `
      <h3>📊 Gestion des données</h3>
      <div style="margin-bottom: 1rem;">
        <p><strong>Pannes enregistrées:</strong> ${faultsCount}</p>
        <p><strong>Sauvegardes disponibles:</strong> ${backups.length}</p>
      </div>
      
      <h4>Importer des pannes</h4>
      <input type="file" id="importFaultsFile" accept=".json" style="margin-bottom: 1rem;">
      <button class="btn btn-primary" onclick="window.adminManager.importFaultsFile()" style="margin-bottom: 1rem;">Importer les pannes</button>
      
      <h4>Exporter les pannes</h4>
      <button class="btn btn-secondary" onclick="window.backupManager.exportFaults()" style="margin-bottom: 1rem;">Exporter les pannes</button>
      
      <h4>Sauvegarde complète</h4>
      <button class="btn btn-primary" onclick="window.backupManager.exportData()" style="margin-bottom: 1rem;">Créer une sauvegarde</button>
      
      <h4>Restaurer une sauvegarde</h4>
      <input type="file" id="importBackupFile" accept=".json">
      <button class="btn btn-secondary" onclick="window.adminManager.importBackupFile()">Restaurer</button>
    `;
  }

  async renderShareTab(container) {
    const shareLink = window.backupManager.generateShareLink();
    
    container.innerHTML = `
      <h3>📤 Partager l'application</h3>
      <p>Partagez ce lien pour permettre à d'autres utilisateurs d'accéder à l'application :</p>
      <div class="share-result">
        <code>${shareLink}</code>
      </div>
      <button class="btn btn-secondary" onclick="window.adminManager.copyShareLink()" style="margin-top: 1rem;">📋 Copier le lien</button>
      
      <h4 style="margin-top: 2rem;">📱 Convertir en APK</h4>
      <p>Pour créer un APK Android :</p>
      <ol style="margin: 1rem 0; padding-left: 1.5rem;">
        <li>Hébergez ce projet sur un serveur HTTPS (GitHub Pages, Netlify, etc.)</li>
        <li>Allez sur <a href="https://www.pwabuilder.com" target="_blank">pwabuilder.com</a></li>
        <li>Entrez l'URL de votre site hébergé</li>
        <li>Cliquez sur "Package for stores" → "Android"</li>
        <li>Téléchargez le fichier APK généré</li>
      </ol>
      
      <h4 style="margin-top: 2rem;">🔗 Hébergement gratuit recommandé</h4>
      <ul style="margin: 1rem 0; padding-left: 1.5rem;">
        <li><strong>GitHub Pages:</strong> Gratuit, HTTPS automatique</li>
        <li><strong>Netlify:</strong> Gratuit, HTTPS automatique</li>
        <li><strong>Vercel:</strong> Gratuit, HTTPS automatique</li>
        <li><strong>Cloudflare Pages:</strong> Gratuit, HTTPS automatique</li>
      </ul>
    `;
  }

  getStatusLabel(status) {
    const labels = { 'pending': 'En attente', 'approved': 'Approuvé', 'revoked': 'Révoqué' };
    return labels[status] || status;
  }

  async approveUser(username) {
    if (!confirm(`Approuver l'utilisateur ${username} ?`)) return;
    try {
      await DBUtils.updateUser(username, { status: 'approved' });
      window.backupManager.showNotification('Utilisateur approuvé', 'success');
      this.switchTab('users');
    } catch (error) {
      window.backupManager.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  async revokeUser(username) {
    if (!confirm(`Révoquer l'accès de ${username} ?`)) return;
    try {
      await DBUtils.updateUser(username, { status: 'revoked' });
      window.backupManager.showNotification('Utilisateur révoqué', 'success');
      this.switchTab('users');
    } catch (error) {
      window.backupManager.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  async deleteUser(username) {
    if (!confirm(`Supprimer définitivement l'utilisateur ${username} ?`)) return;
    try {
      await DBUtils.deleteUser(username);
      window.backupManager.showNotification('Utilisateur supprimé', 'success');
      this.switchTab('users');
    } catch (error) {
      window.backupManager.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  async approveRequest(requestId) {
    try {
      const request = await db.get('accessRequests', requestId);
      if (!request) throw new Error('Demande non trouvée');
      await DBUtils.createUser(request.username, request.password || 'temp123', 'user');
      await DBUtils.updateUser(request.username, { status: 'approved' });
      await DBUtils.updateAccessRequest(requestId, { status: 'approved' });
      window.backupManager.showNotification('Demande approuvée, utilisateur créé', 'success');
      this.switchTab('pending');
    } catch (error) {
      window.backupManager.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  async rejectRequest(requestId) {
    if (!confirm('Refuser cette demande ?')) return;
    try {
      await DBUtils.updateAccessRequest(requestId, { status: 'rejected' });
      window.backupManager.showNotification('Demande refusée', 'success');
      this.switchTab('pending');
    } catch (error) {
      window.backupManager.showNotification('Erreur: ' + error.message, 'error');
    }
  }

  async importFaultsFile() {
    const fileInput = document.getElementById('importFaultsFile');
    if (!fileInput || !fileInput.files[0]) {
      window.backupManager.showNotification('Veuillez sélectionner un fichier', 'error');
      return;
    }
    await window.backupManager.importFaults(fileInput.files[0]);
  }

  async importBackupFile() {
    const fileInput = document.getElementById('importBackupFile');
    if (!fileInput || !fileInput.files[0]) {
      window.backupManager.showNotification('Veuillez sélectionner un fichier', 'error');
      return;
    }
    await window.backupManager.importData(fileInput.files[0]);
  }

  copyShareLink() {
    const shareLink = window.backupManager.generateShareLink();
    navigator.clipboard.writeText(shareLink).then(() => {
      window.backupManager.showNotification('Lien copié dans le presse-papiers', 'success');
    }).catch(() => {
      window.backupManager.showNotification('Impossible de copier le lien', 'error');
    });
  }

  showAPKInstructions() {
    alert(
      '📱 Comment créer un APK Android :\n\n' +
      '1. Hébergez ce projet sur GitHub Pages, Netlify ou Vercel (gratuit, HTTPS requis)\n\n' +
      '2. Allez sur https://www.pwabuilder.com\n\n' +
      '3. Entrez l\'URL de votre site hébergé\n\n' +
      '4. Cliquez sur "Package for stores" puis "Android"\n\n' +
      '5. Téléchargez le fichier APK généré\n\n' +
      '6. Installez-le sur votre appareil Android'
    );
  }

  generateShareLink() {
    const shareLink = window.backupManager.generateShareLink();
    navigator.clipboard.writeText(shareLink).then(() => {
      window.backupManager.showNotification('Lien copié dans le presse-papiers', 'success');
    });
  }
}

if (typeof window !== 'undefined') {
  window.AdminManager = AdminManager;
}

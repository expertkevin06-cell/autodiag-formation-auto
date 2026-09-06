/**
 * Gestion des sauvegardes et restaurations
 */

class BackupManager {
  constructor() {
    this.attachEventListeners();
  }

  attachEventListeners() {
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.showBackupModal());
    }
  }

  showBackupModal() {
    const shareModal = document.getElementById('shareModal');
    shareModal.classList.add('active');
  }

  async exportData() {
    try {
      const data = await DBUtils.exportAll();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `autodiag-backup-${timestamp}.json`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await DBUtils.createBackup(data);
      this.showNotification('Sauvegarde créée avec succès', 'success');
      return true;
    } catch (error) {
      console.error('[Backup] Erreur export:', error);
      this.showNotification('Erreur lors de la sauvegarde', 'error');
      return false;
    }
  }

  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.users) {
        throw new Error('Format de fichier invalide');
      }

      const confirmed = confirm('Cela remplacera toutes les données actuelles. Continuer ?');
      if (!confirmed) return false;

      await DBUtils.importAll(data);
      this.showNotification('Données importées avec succès', 'success');
      return true;
    } catch (error) {
      console.error('[Backup] Erreur import:', error);
      this.showNotification('Erreur lors de l\'import: ' + error.message, 'error');
      return false;
    }
  }

  async exportFaults() {
    try {
      const faults = await db.getAll('faults');
      const jsonStr = JSON.stringify(faults, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `autodiag-faults-${timestamp}.json`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification('Pannes exportées avec succès', 'success');
      return true;
    } catch (error) {
      console.error('[Backup] Erreur export pannes:', error);
      this.showNotification('Erreur lors de l\'export', 'error');
      return false;
    }
  }

  async importFaults(file) {
    try {
      const text = await file.text();
      const faults = JSON.parse(text);
      
      if (!Array.isArray(faults)) {
        throw new Error('Format de fichier invalide');
      }

      const confirmed = confirm(`Importer ${faults.length} pannes ? Cela ajoutera aux données existantes.`);
      if (!confirmed) return false;

      for (const fault of faults) {
        await db.put('faults', fault);
      }

      this.showNotification(`${faults.length} pannes importées avec succès`, 'success');
      
      if (window.filterManager) {
        window.filterManager.renderResults();
      }
      
      return true;
    } catch (error) {
      console.error('[Backup] Erreur import pannes:', error);
      this.showNotification('Erreur lors de l\'import: ' + error.message, 'error');
      return false;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  generateShareLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareData = {
      app: 'AutoDiag Pro',
      version: '1.0',
      timestamp: Date.now()
    };
    const encoded = btoa(JSON.stringify(shareData));
    const shareUrl = `${baseUrl}?share=${encoded}`;
    return shareUrl;
  }

  async handleShareLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    
    if (shareData) {
      try {
        const decoded = JSON.parse(atob(shareData));
        console.log('[Backup] Lien de partage détecté:', decoded);
        this.showNotification('Bienvenue sur AutoDiag Pro !', 'success');
      } catch (error) {
        console.error('[Backup] Erreur décodage lien:', error);
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.BackupManager = BackupManager;
}

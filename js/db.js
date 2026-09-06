/**
 * Gestion de la base de données locale IndexedDB
 * Fonctionne hors ligne avec sauvegarde automatique
 */

const DB_NAME = 'AutoDiagProDB';
const DB_VERSION = 1;

const DB_CONFIG = {
  stores: {
    users: { keyPath: 'username' },
    faults: { keyPath: 'id' },
    accessRequests: { keyPath: 'id' },
    settings: { keyPath: 'key' },
    backups: { keyPath: 'id' }
  }
};

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[DB] Erreur d\'ouverture:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[DB] Base de données ouverte');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        Object.entries(DB_CONFIG.stores).forEach(([name, config]) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, {
              keyPath: config.keyPath,
              autoIncrement: config.autoIncrement || false
            });
            
            if (config.indexes) {
              config.indexes.forEach(index => {
                store.createIndex(index.name, index.keyPath, { unique: index.unique || false });
              });
            }
          }
        });

        console.log('[DB] Structure de la base créée/mise à jour');
      };
    });
  }

  async add(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const db = new Database();

const DBUtils = {
  async createUser(username, password, role = 'user') {
    const hashedPassword = await this.hashPassword(password);
    const user = {
      username,
      password: hashedPassword,
      role,
      status: 'pending',
      createdAt: Date.now(),
      lastLogin: null
    };
    return db.add('users', user);
  },

  async getUser(username) {
    return db.get('users', username);
  },

  async updateUser(username, updates) {
    const user = await this.getUser(username);
    if (!user) throw new Error('Utilisateur non trouvé');
    const updatedUser = { ...user, ...updates };
    return db.put('users', updatedUser);
  },

  async getAllUsers() {
    return db.getAll('users');
  },

  async deleteUser(username) {
    return db.delete('users', username);
  },

  async verifyPassword(username, password) {
    const user = await this.getUser(username);
    if (!user) return false;
    const hashedPassword = await this.hashPassword(password);
    return user.password === hashedPassword;
  },

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'AutoDiagPro_Salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async createAccessRequest(data) {
    const request = {
      id: 'req_' + Date.now(),
      ...data,
      status: 'pending',
      createdAt: Date.now()
    };
    return db.add('accessRequests', request);
  },

  async getAllAccessRequests() {
    return db.getAll('accessRequests');
  },

  async updateAccessRequest(id, updates) {
    const request = await db.get('accessRequests', id);
    if (!request) throw new Error('Demande non trouvée');
    const updatedRequest = { ...request, ...updates };
    return db.put('accessRequests', updatedRequest);
  },

  async deleteAccessRequest(id) {
    return db.delete('accessRequests', id);
  },

  async setSetting(key, value) {
    return db.put('settings', { key, value, updatedAt: Date.now() });
  },

  async getSetting(key) {
    const setting = await db.get('settings', key);
    return setting ? setting.value : null;
  },

  async createBackup(data) {
    const backup = {
      id: 'backup_' + Date.now(),
      data,
      createdAt: Date.now()
    };
    return db.add('backups', backup);
  },

  async getAllBackups() {
    return db.getAll('backups');
  },

  async deleteBackup(id) {
    return db.delete('backups', id);
  },

  async exportAll() {
    const data = {
      users: await db.getAll('users'),
      accessRequests: await db.getAll('accessRequests'),
      settings: await db.getAll('settings'),
      exportedAt: Date.now(),
      version: DB_VERSION
    };
    return data;
  },

  async importAll(data) {
    if (!data || !data.users) {
      throw new Error('Format de données invalide');
    }

    for (const user of data.users) {
      await db.put('users', user);
    }

    if (data.accessRequests) {
      for (const request of data.accessRequests) {
        await db.put('accessRequests', request);
      }
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await db.put('settings', setting);
      }
    }

    return true;
  },

  // 🔐 INITIALISATION AVEC MOT DE PASSE ADMIN : Kevin83600
  async initializeDefaults() {
    const adminExists = await this.getUser('admin');
    if (!adminExists) {
      await this.createUser('admin', 'Kevin83600', 'admin');
      await this.updateUser('admin', { status: 'approved' });
      console.log('[DB] Administrateur par défaut créé (admin/Kevin83600)');
    }

    const faultsCount = await db.count('faults');
    if (faultsCount === 0) {
      for (const fault of AUTO_DATA.faults) {
        await db.add('faults', fault);
      }
      console.log('[DB] Pannes par défaut importées:', AUTO_DATA.faults.length);
    }

    const theme = await this.getSetting('theme');
    if (!theme) {
      await this.setSetting('theme', 'light');
      await this.setSetting('language', 'fr');
      await this.setSetting('autoBackup', true);
    }
  }
};

if (typeof window !== 'undefined') {
  window.db = db;
  window.DBUtils = DBUtils;
}

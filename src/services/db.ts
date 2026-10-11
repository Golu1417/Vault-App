import type { MediaItem, Album, VaultSettings } from '../types';

const DB_NAME = 'CalculatorVaultDB';
const DB_VERSION = 1;

const DEFAULT_SETTINGS: VaultSettings = {
  isConfigured: false,
  authMode: 'permanent',
  permanentPin: '1234',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'blue',
  disguise: 'calculator',
  theme: 'dark',
  soundEnabled: true,
  timeFormat: '24h',
  autoLockOnMinimize: true,
};

class VaultDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Media store
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('type', 'type', { unique: false });
          mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
          mediaStore.createIndex('isTrash', 'isTrash', { unique: false });
          mediaStore.createIndex('albumId', 'albumId', { unique: false });
        }

        // Albums store
        if (!db.objectStoreNames.contains('albums')) {
          db.createObjectStore('albums', { keyPath: 'id' });
        }

        // Key-Value Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- SETTINGS ---
  async getSettings(): Promise<VaultSettings> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('app_settings');

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...request.result.value });
        } else {
          // Fallback to localStorage if any
          const cached = localStorage.getItem('calc_vault_settings');
          if (cached) {
            try {
              resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
              return;
            } catch {
              // ignore
            }
          }
          resolve(DEFAULT_SETTINGS);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: VaultSettings): Promise<void> {
    const db = await this.openDB();
    localStorage.setItem('calc_vault_settings', JSON.stringify(settings));
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key: 'app_settings', value: settings });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- MEDIA ---
  async getAllMedia(): Promise<MediaItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readonly');
      const store = tx.objectStore('media');
      const request = store.getAll();

      request.onsuccess = () => {
        const items: MediaItem[] = request.result || [];
        // Sort descending by createdAt
        items.sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addMedia(item: {
    name: string;
    type: 'image' | 'video';
    mimeType: string;
    size: number;
    blob: Blob;
    albumId?: string | null;
  }): Promise<MediaItem> {
    const db = await this.openDB();
    const newItem: MediaItem = {
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: item.name,
      type: item.type,
      mimeType: item.mimeType,
      size: item.size,
      blob: item.blob,
      createdAt: Date.now(),
      albumId: item.albumId || null,
      isFavorite: false,
      isTrash: false,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      const request = store.add(newItem);

      request.onsuccess = () => resolve(newItem);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMedia(id: string, permanent: boolean = false): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');

      if (permanent) {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } else {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item: MediaItem = getReq.result;
          if (item) {
            item.isTrash = true;
            const putReq = store.put(item);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
          } else {
            resolve();
          }
        };
        getReq.onerror = () => reject(getReq.error);
      }
    });
  }

  async restoreMedia(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: MediaItem = getReq.result;
        if (item) {
          item.isTrash = false;
          const putReq = store.put(item);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async toggleFavorite(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: MediaItem = getReq.result;
        if (item) {
          item.isFavorite = !item.isFavorite;
          const putReq = store.put(item);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async moveMediaToAlbum(id: string, albumId: string | null): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: MediaItem = getReq.result;
        if (item) {
          item.albumId = albumId;
          const putReq = store.put(item);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async emptyTrash(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      const request = store.openCursor();

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (cursor.value.isTrash) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- ALBUMS ---
  async getAlbums(): Promise<Album[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addAlbum(name: string): Promise<Album> {
    const db = await this.openDB();
    const newAlbum: Album = {
      id: 'album_' + Date.now(),
      name,
      createdAt: Date.now(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      const request = store.add(newAlbum);

      request.onsuccess = () => resolve(newAlbum);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAlbum(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['albums', 'media'], 'readwrite');
      const albumStore = tx.objectStore('albums');
      const mediaStore = tx.objectStore('media');

      albumStore.delete(id);

      // Unassign album from media
      const mediaReq = mediaStore.openCursor();
      mediaReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (cursor.value.albumId === id) {
            const updated = { ...cursor.value, albumId: null };
            cursor.update(updated);
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['media', 'albums'], 'readwrite');
      tx.objectStore('media').clear();
      tx.objectStore('albums').clear();
      tx.oncomplete = () => {
        localStorage.removeItem('calc_vault_settings');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const vaultDB = new VaultDatabase();

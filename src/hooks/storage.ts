// storage.ts
interface IDatabase {
  openDB(storeName?: string): Promise<IDBDatabase>;
  addItem(storeName: string, item: any): Promise<void>;
  getItem(storeName: string, key: string): Promise<any>;
  getAllItems(storeName: string): Promise<any[]>;
  deleteItem(storeName: string, key: string): Promise<void>;
  updateItem(storeName: string, item: any): Promise<void>;
}

class IndexedDBService implements IDatabase {
  private dbName: string;
  private dbVersion: number;

  constructor(dbName: string, dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  openDB(storeName?: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (storeName && !db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addItem(storeName: string, item: any): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(storeName: string, key: string): Promise<any> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems(storeName: string): Promise<any[]> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(storeName: string, key: string): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(storeName: string, item: any): Promise<void> {
    const db = await this.openDB(storeName);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

}

export const dbService = new IndexedDBService('StarMarkGuide', 1);

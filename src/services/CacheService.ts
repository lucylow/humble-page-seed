// Cache Service for performance optimization
// Implements multi-layer caching: Memory → IndexedDB → Network

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private dbName = 'domaland-cache';
  private storeName = 'cache-store';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
    this.startCleanupInterval();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  // Memory cache operations
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
      return memEntry.data as T;
    }

    // Check IndexedDB
    const dbEntry = await this.getFromDB<T>(key);
    if (dbEntry && Date.now() - dbEntry.timestamp < dbEntry.ttl) {
      // Promote to memory cache
      this.memoryCache.set(key, dbEntry);
      return dbEntry.data;
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number = 30000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Set in memory
    this.memoryCache.set(key, entry);

    // Set in IndexedDB for persistence
    await this.setInDB(key, entry);
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.deleteFromDB(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate all keys matching pattern (e.g., 'domains:*')
    const keys = Array.from(this.memoryCache.keys()).filter(k => k.includes(pattern));
    await Promise.all(keys.map(k => this.invalidate(k)));
  }

  private async getFromDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async setInDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromDB(key: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.invalidate(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

// Cache TTL configurations
export const CACHE_TTL = {
  DOMAIN_LIST: 30 * 1000,        // 30 seconds
  DOMAIN_DETAIL: 60 * 1000,      // 1 minute
  ORDERBOOK: 10 * 1000,          // 10 seconds
  USER_PROFILE: 5 * 60 * 1000,   // 5 minutes
  ANALYTICS: 2 * 60 * 1000,      // 2 minutes
  STATIC_DATA: 60 * 60 * 1000    // 1 hour
} as const;

export const cacheService = new CacheService();

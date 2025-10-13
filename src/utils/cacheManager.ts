/**
 * キャッシュ管理ユーティリティ
 * ブラウザのキャッシュ機能を活用してパフォーマンスを向上
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  defaultTTL: number; // デフォルトの生存時間（ミリ秒）
  maxSize: number; // 最大キャッシュサイズ
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5分
      maxSize: 100,
      storageType: 'memory',
      ...config,
    };
  }

  /**
   * キャッシュにデータを保存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    };

    // メモリキャッシュの場合
    if (this.config.storageType === 'memory') {
      // サイズ制限チェック
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }
      this.cache.set(key, item);
      return;
    }

    // ブラウザストレージの場合
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(`cache_${key}`, JSON.stringify(item));
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error);
      // フォールバックとしてメモリキャッシュを使用
      this.cache.set(key, item);
    }
  }

  /**
   * キャッシュからデータを取得
   */
  get<T>(key: string): T | null {
    let item: CacheItem<T> | null = null;

    // メモリキャッシュから取得
    if (this.config.storageType === 'memory') {
      item = this.cache.get(key) || null;
    } else {
      // ブラウザストレージから取得
      try {
        const storage = this.getStorage();
        if (storage) {
          const stored = storage.getItem(`cache_${key}`);
          if (stored) {
            item = JSON.parse(stored);
          }
        }
      } catch (error) {
        console.warn('Failed to read from storage:', error);
        return null;
      }
    }

    if (!item) {
      return null;
    }

    // 有効期限チェック
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * キャッシュからデータを削除
   */
  delete(key: string): void {
    if (this.config.storageType === 'memory') {
      this.cache.delete(key);
    } else {
      try {
        const storage = this.getStorage();
        if (storage) {
          storage.removeItem(`cache_${key}`);
        }
      } catch (error) {
        console.warn('Failed to delete from storage:', error);
      }
    }
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    if (this.config.storageType === 'memory') {
      this.cache.clear();
    } else {
      try {
        const storage = this.getStorage();
        if (storage) {
          const keys = Object.keys(storage).filter(key =>
            key.startsWith('cache_')
          );
          keys.forEach(key => storage.removeItem(key));
        }
      } catch (error) {
        console.warn('Failed to clear storage:', error);
      }
    }
  }

  /**
   * キャッシュサイズを取得
   */
  size(): number {
    if (this.config.storageType === 'memory') {
      return this.cache.size;
    } else {
      try {
        const storage = this.getStorage();
        if (storage) {
          return Object.keys(storage).filter(key => key.startsWith('cache_'))
            .length;
        }
      } catch (error) {
        console.warn('Failed to get storage size:', error);
      }
    }
    return 0;
  }

  /**
   * 期限切れのキャッシュを削除
   */
  cleanup(): void {
    if (this.config.storageType === 'memory') {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    } else {
      try {
        const storage = this.getStorage();
        if (storage) {
          const keys = Object.keys(storage).filter(key =>
            key.startsWith('cache_')
          );
          const now = Date.now();

          keys.forEach(key => {
            try {
              const item = JSON.parse(storage.getItem(key) || '');
              if (now > item.expiry) {
                storage.removeItem(key);
              }
            } catch (error) {
              // 無効なデータは削除
              storage.removeItem(key);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to cleanup storage:', error);
      }
    }
  }

  /**
   * 最も古いキャッシュを削除（LRU）
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * ストレージオブジェクトを取得
   */
  private getStorage(): Storage | null {
    try {
      switch (this.config.storageType) {
        case 'localStorage':
          return localStorage;
        case 'sessionStorage':
          return sessionStorage;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }
}

// デフォルトのキャッシュマネージャーインスタンス
export const defaultCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5分
  maxSize: 50,
  storageType: 'memory',
});

// 画像キャッシュ用（長期間保存）
export const imageCache = new CacheManager({
  defaultTTL: 60 * 60 * 1000, // 1時間
  maxSize: 100,
  storageType: 'localStorage',
});

// API レスポンスキャッシュ用
export const apiCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10分
  maxSize: 30,
  storageType: 'sessionStorage',
});

export default CacheManager;

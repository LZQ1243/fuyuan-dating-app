/**
 * 请求缓存管理器
 * 智能缓存API请求,减少网络请求
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expireTime: number;
}

interface CacheOptions {
  ttl?: number; // 缓存时间(毫秒)
  maxSize?: number; // 最大缓存数量
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class RequestCacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private storageType: 'memory' | 'localStorage' | 'sessionStorage';
  private storagePrefix: string = 'cache_';

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.storageType = options.storage || 'memory';

    // 从存储加载缓存
    if (this.storageType !== 'memory') {
      this.loadFromStorage();
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expireTime) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expireTime: Date.now() + ttl
    };

    // 限制缓存大小
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);

    // 持久化到存储
    if (this.storageType !== 'memory') {
      this.saveToStorage(key, entry);
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.removeFromStorage(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.clearStorage();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 淘汰最旧的缓存
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removeFromStorage(oldestKey);
    }
  }

  /**
   * 保存到存储
   */
  private saveToStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(
          `${this.storagePrefix}${key}`,
          JSON.stringify(entry)
        );
      }
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * 从存储加载
   */
  private loadFromStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const cacheKey = key.slice(this.storagePrefix.length);
          const value = storage.getItem(key);
          if (value) {
            const entry = JSON.parse(value) as CacheEntry<any>;
            // 检查是否过期
            if (Date.now() <= entry.expireTime) {
              this.cache.set(cacheKey, entry);
            } else {
              storage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  /**
   * 从存储删除
   */
  private removeFromStorage(key: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(`${this.storagePrefix}${key}`);
      }
    } catch (error) {
      console.warn('Failed to remove cache from storage:', error);
    }
  }

  /**
   * 清空存储
   */
  private clearStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error);
    }
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage | null {
    try {
      return window[this.storageType];
    } catch {
      return null;
    }
  }
}

// 创建全局缓存实例
const requestCache = new RequestCacheManager({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  storage: 'localStorage'
});

/**
 * 缓存装饰器
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  return (async function (this: any, ...args: Parameters<T>) {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify({ fn: fn.name, args });

    // 尝试从缓存获取
    const cached = requestCache.get(key);
    if (cached) {
      console.log(`✅ Cache hit: ${key}`);
      return cached;
    }

    // 执行函数
    console.log(`⏳ Cache miss: ${key}`);
    const result = await fn.apply(this, args);

    // 缓存结果
    requestCache.set(key, result, ttl);

    return result;
  }) as T;
}

/**
 * 带缓存的fetch
 */
export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  ttl: number = 5 * 60 * 1000
): Promise<Response> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;

  // 尝试从缓存获取
  const cached = requestCache.get<Response>(cacheKey);
  if (cached) {
    return Promise.resolve(cached.clone());
  }

  // 执行请求
  const response = await fetch(url, options);

  // 只缓存成功的GET请求
  if (options.method === 'GET' || !options.method) {
    if (response.ok) {
      requestCache.set(cacheKey, response.clone(), ttl);
    }
  }

  return response;
}

/**
 * 批量请求缓存
 */
export async function batchCachedFetch<T>(
  urls: string[],
  options: RequestInit = {},
  ttl: number = 5 * 60 * 1000
): Promise<T[]> {
  const results = await Promise.all(
    urls.map(url => cachedFetch(url, options, ttl).then(res => res.json()))
  );

  return results;
}

/**
 * 清除缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
}

/**
 * 预加载数据
 */
export async function preloadData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<void> {
  try {
    const data = await fetcher();
    requestCache.set(key, data, ttl);
  } catch (error) {
    console.error('Failed to preload data:', error);
  }
}

/**
 * 缓存状态统计
 */
export function getCacheStats() {
  return {
    size: requestCache.size(),
    keys: Array.from((requestCache as any).cache.keys())
  };
}

// 导出缓存管理器
export { RequestCacheManager };
export default requestCache;

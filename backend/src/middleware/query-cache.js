/**
 * 查询缓存中间件
 * 基于Redis的查询结果缓存
 */

const redis = require('../config/redis');

class QueryCache {
  /**
   * 生成缓存键
   */
  static generateCacheKey(prefix, params) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * 获取缓存
   */
  static async get(key) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ 缓存命中: ${key}`);
        return JSON.parse(cached);
      }
      console.log(`❌ 缓存未命中: ${key}`);
      return null;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  static async set(key, value, ttl = 300) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
      console.log(`✅ 缓存已设置: ${key}, TTL: ${ttl}s`);
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  static async del(key) {
    try {
      await redis.del(key);
      console.log(`✅ 缓存已删除: ${key}`);
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  }

  /**
   * 删除匹配的缓存
   */
  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`✅ 已删除 ${keys.length} 个匹配的缓存: ${pattern}`);
      }
      return keys.length;
    } catch (error) {
      console.error('批量删除缓存失败:', error);
      return 0;
    }
  }

  /**
   * 清空所有缓存
   */
  static async flushAll() {
    try {
      await redis.flushdb();
      console.log('✅ 所有缓存已清空');
      return true;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  }

  /**
   * 缓存中间件
   */
  static middleware(options = {}) {
    const {
      prefix,
      ttl = 300,
      keyGenerator = null,
      enabled = true
    } = options;

    return async (req, res, next) => {
      if (!enabled) {
        return next();
      }

      try {
        // 生成缓存键
        const cacheKey = keyGenerator
          ? keyGenerator(req)
          : this.generateCacheKey(prefix, {
              method: req.method,
              path: req.path,
              query: JSON.stringify(req.query),
              body: JSON.stringify(req.body)
            });

        // 尝试从缓存获取
        const cached = await this.get(cacheKey);
        if (cached) {
          return res.json(cached);
        }

        // 保存原始的res.json方法
        const originalJson = res.json.bind(res);

        // 重写res.json方法以缓存响应
        res.json = function(data) {
          // 缓存成功的响应
          if (res.statusCode >= 200 && res.statusCode < 300) {
            QueryCache.set(cacheKey, data, ttl);
          }

          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('缓存中间件错误:', error);
        next();
      }
    };
  }

  /**
   * 缓存装饰器
   */
  static decorator(options = {}) {
    const { prefix, ttl = 300, keyGenerator = null } = options;

    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args) {
        try {
          // 生成缓存键
          const cacheKey = keyGenerator
            ? keyGenerator.apply(this, args)
            : QueryCache.generateCacheKey(prefix, { args: JSON.stringify(args) });

          // 尝试从缓存获取
          const cached = await QueryCache.get(cacheKey);
          if (cached) {
            return cached;
          }

          // 执行原始方法
          const result = await originalMethod.apply(this, args);

          // 缓存结果
          await QueryCache.set(cacheKey, result, ttl);

          return result;
        } catch (error) {
          console.error('缓存装饰器错误:', error);
          return originalMethod.apply(this, args);
        }
      };

      return descriptor;
    };
  }

  /**
   * 获取缓存统计
   */
  static async getStats() {
    try {
      const info = await redis.info('stats');
      const keyspace = await redis.info('keyspace');

      return {
        hits: parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || 0),
        misses: parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || 0),
        hitRate: this.calculateHitRate(info),
        totalKeys: this.extractTotalKeys(keyspace)
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return null;
    }
  }

  /**
   * 计算缓存命中率
   */
  static calculateHitRate(info) {
    const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || 0);
    const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || 0);
    const total = hits + misses;

    if (total === 0) return 0;
    return ((hits / total) * 100).toFixed(2);
  }

  /**
   * 提取总键数
   */
  static extractTotalKeys(keyspace) {
    const match = keyspace.match(/keys=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 预热缓存
   */
  static async warmUp(keysAndValues) {
    const results = {
      success: 0,
      failed: 0
    };

    for (const { key, value, ttl = 300 } of keysAndValues) {
      const success = await this.set(key, value, ttl);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    console.log(`缓存预热完成: 成功 ${results.success}, 失败 ${results.failed}`);
    return results;
  }

  /**
   * 缓存清理任务
   */
  static startCleanupTask(interval = 3600000) {
    setInterval(async () => {
      try {
        // 清理过期键(自动完成)
        console.log('定时缓存清理任务执行');
      } catch (error) {
        console.error('缓存清理任务错误:', error);
      }
    }, interval);

    console.log(`缓存清理任务已启动, 间隔: ${interval}ms`);
  }
}

module.exports = QueryCache;

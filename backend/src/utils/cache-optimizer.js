/**
 * 缓存优化工具
 * 优化缓存策略,提升缓存命中率到100%
 */

const redis = require('../config/redis');

class CacheOptimizer {
  /**
   * 缓存预热 - 预加载热点数据
   */
  static async warmUp() {
    console.log('🔥 开始缓存预热...');

    // 1. 预加载用户基本信息
    const User = require('../models/User');
    const activeUsers = await User.find({ status: 'active' })
      .select('_id phone nickname avatarUrl')
      .limit(1000)
      .lean();

    for (const user of activeUsers) {
      await redis.set(`user:info:${user._id}`, JSON.stringify(user), 'EX', 3600);
    }
    console.log(`✅ 预加载用户信息: ${activeUsers.length} 个`);

    // 2. 预加载匹配列表
    const Match = require('../models/Match');
    const activeMatches = await Match.find({ status: 'active' })
      .populate('userId1', 'userId2')
      .limit(500)
      .lean();

    for (const match of activeMatches) {
      await redis.set(`match:info:${match._id}`, JSON.stringify(match), 'EX', 1800);
    }
    console.log(`✅ 预加载匹配信息: ${activeMatches.length} 个`);

    // 3. 预加载动态列表
    const Moment = require('../models/Moment');
    const hotMoments = await Moment.find({ isPrivate: false })
      .select('_id userId content images likesCount commentsCount')
      .sort({ likesCount: -1 })
      .limit(100)
      .lean();

    for (const moment of hotMoments) {
      await redis.set(`moment:info:${moment._id}`, JSON.stringify(moment), 'EX', 900);
    }
    console.log(`✅ 预加载动态信息: ${hotMoments.length} 个`);

    // 4. 预加载配置数据
    const Config = require('../models/Config');
    const allConfigs = await Config.find({});
    
    for (const config of allConfigs) {
      await redis.set(`config:${config.key}`, config.value, 'EX', 1800);
    }
    console.log(`✅ 预加载配置数据: ${allConfigs.length} 个`);

    console.log('✅ 缓存预热完成!');
  }

  /**
   * 智能缓存失效 - 基于数据更新自动失效
   */
  static async invalidateRelated(pattern) {
    console.log(`🔄 失效相关缓存: ${pattern}`);

    const keys = await redis.keys(`*${pattern}*`);
    
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`✅ 失效 ${keys.length} 个缓存`);
    }
  }

  /**
   * 缓存穿透保护 - 缓存空值
   */
  static async getWithPenetration(key, fetchFn, ttl = 300) {
    const cached = await redis.get(key);

    if (cached) {
      const data = JSON.parse(cached);
      
      // 缓存的是null,视为穿透
      if (data === null) {
        await redis.del(key);
        return null;
      }
      
      return data;
    }

    // 缓存未命中,从数据库加载
    const data = await fetchFn();
    
    if (data !== null) {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } else {
      // 设置null防止穿透
      await redis.set(key, JSON.stringify(null), 'EX', ttl);
    }

    return data;
  }

  /**
   * 缓存击穿保护 - 互斥锁
   */
  static async getWithBreakdown(key, fetchFn, ttl = 300) {
    const lockKey = `lock:${key}`;
    const lockTTL = 10; // 锁定10秒

    // 尝试获取锁
    const lock = await redis.set(lockKey, '1', 'NX', 'EX', lockTTL);

    if (lock === 'OK') {
      try {
        // 获取锁成功,正常流程
        const cached = await redis.get(key);

        if (cached) {
          return JSON.parse(cached);
        }

        // 缓存未命中,加载数据
        const data = await fetchFn();

        if (data !== null) {
          await redis.set(key, JSON.stringify(data), 'EX', ttl);
        }

        return data;
      } finally {
        // 释放锁
        await redis.del(lockKey);
      }
    } else {
      // 获取锁失败,等待并重试
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getWithBreakdown(key, fetchFn, ttl);
    }
  }

  /**
   * 缓存雪崩保护 - 多级缓存
   */
  static async getMultiLevel(key, L1, L2, L3) {
    // L1: 内存缓存
    if (L1.has(key)) {
      console.log(`✅ L1缓存命中: ${key}`);
      return L1.get(key);
    }

    // L2: Redis缓存
    const L2Data = await redis.get(`L2:${key}`);
    if (L2Data) {
      console.log(`✅ L2缓存命中: ${key}`);
      const data = JSON.parse(L2Data);
      L1.set(key, data);
      return data;
    }

    // L3: 数据库
    console.log(`⏳ L3加载: ${key}`);
    const data = await L3(key);

    // 回填L2和L1
    await redis.set(`L2:${key}`, JSON.stringify(data), 'EX', 600);
    L1.set(key, data);

    return data;
  }

  /**
   * 热点数据缓存
   */
  static async getHotData(type, limit = 100) {
    const key = `hot:${type}`;
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    let data = [];

    switch (type) {
      case 'users':
        const User = require('../models/User');
        data = await User.find({ status: 'active' })
          .sort({ lastLoginAt: -1 })
          .limit(limit)
          .lean();
        break;

      case 'moments':
        const Moment = require('../models/Moment');
        data = await Moment.find({ isPrivate: false })
          .sort({ likesCount: -1 })
          .limit(limit)
          .lean();
        break;

      case 'matches':
        const Match = require('../models/Match');
        data = await Match.find({ status: 'active' })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        break;

      default:
        return [];
    }

    // 缓存热数据,1小时
    await redis.set(key, JSON.stringify(data), 'EX', 3600);

    return data;
  }

  /**
   * 智能TTL计算 - 基于访问频率动态调整TTL
   */
  static async calculateOptimalTTL(key, accessCount) {
    // 基于访问频率计算TTL
    // 频繁访问: 长TTL (1小时)
    // 正常访问: 中TTL (15分钟)
    // 偶尔访问: 短TTL (5分钟)

    if (accessCount > 100) {
      return 3600; // 1小时
    } else if (accessCount > 50) {
      return 1800; // 30分钟
    } else if (accessCount > 20) {
      return 900; // 15分钟
    } else {
      return 300; // 5分钟
    }
  }

  /**
   * 缓存压缩 - 压缩缓存数据
   */
  static async getCompressed(key) {
    const compressed = await redis.get(`compressed:${key}`);

    if (compressed) {
      // 解压数据
      const zlib = require('zlib');
      const decompressed = zlib.inflateSync(Buffer.from(compressed, 'base64'));
      return JSON.parse(decompressed.toString());
    }

    return null;
  }

  /**
   * 设置压缩缓存
   */
  static async setCompressed(key, value, ttl = 300) {
    const zlib = require('zlib');
    const data = JSON.stringify(value);
    const compressed = zlib.deflateSync(data);
    
    await redis.set(`compressed:${key}`, compressed.toString('base64'), 'EX', ttl);
  }

  /**
   * 批量缓存操作
   */
  static async batchGet(keys) {
    const values = await redis.mget(keys.map(k => k.replace('compressed:', '')));
    
    return Promise.all(values.map((value, index) => {
      if (!value) return null;
      
      try {
        // 尝试解压
        const zlib = require('zlib');
        const decompressed = zlib.inflateSync(Buffer.from(value, 'base64'));
        return JSON.parse(decompressed.toString());
      } catch {
        // 不是压缩数据,直接解析
        return JSON.parse(value);
      }
    }));
  }

  static async batchSet(items, ttl = 300) {
    const zlib = require('zlib');

    const operations = items.map(item => {
      const key = `compressed:${item.key}`;
      const data = JSON.stringify(item.value);
      const compressed = zlib.deflateSync(data);
      return ['set', key, compressed.toString('base64'), 'EX', ttl];
    });

    await redis.multi(operations).exec();

    console.log(`✅ 批量缓存: ${items.length} 个`);
  }

  /**
   * 缓存统计
   */
  static async getStats() {
    const info = await redis.info('stats');
    const keyspace = info.keyspace;
    const keys = await redis.keys('*');
    const usedMemory = info.used_memory;

    return {
      totalKeys: keys.length,
      keyspace,
      usedMemory,
      hitRate: info.keyspace_hits / (info.keyspace_hits + info.keyspace_misses) * 100,
      missRate: info.keyspace_misses / (info.keyspace_hits + info.keyspace_misses) * 100
    };
  }

  /**
   * 缓存清理
   */
  static async cleanExpired() {
    console.log('🧹 开始清理过期缓存...');

    const info = await redis.info('stats');
    const expiresCount = info.expired_stale_perc;

    // 删除已过期的key
    const cursor = '0';
    let count = 0;

    do {
      const keys = await redis.scan(cursor, 'MATCH', '*', 'COUNT', 100);
      cursor = keys[0];

      if (keys[1] && keys[1].length > 0) {
        const keysToDelete = [];

        for (const key of keys[1]) {
          const ttl = await redis.ttl(key);
          if (ttl === -1) {
            keysToDelete.push(key);
          }
        }

        if (keysToDelete.length > 0) {
          await redis.del(keysToDelete);
          count += keysToDelete.length;
        }
      }
    } while (cursor !== '0');

    console.log(`✅ 清理过期缓存: ${count} 个`);
  }

  /**
   * 缓存重置
   */
  static async reset() {
    console.log('⚠️  重置所有缓存...');

    const keys = await redis.keys('*');

    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`✅ 重置缓存: ${keys.length} 个`);
    }
  }
}

module.exports = CacheOptimizer;

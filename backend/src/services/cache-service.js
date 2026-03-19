/**
 * 缓存服务
 * 提供统一的缓存管理接口
 */

const redis = require('../config/redis');
const QueryCache = require('../middleware/query-cache');

class CacheService {
  /**
   * 缓存配置
   */
  static CONFIG = {
    // 用户相关
    USER_INFO: { prefix: 'user', ttl: 600 }, // 10分钟
    USER_PROFILE: { prefix: 'user:profile', ttl: 1800 }, // 30分钟
    USER_MATCHES: { prefix: 'user:matches', ttl: 900 }, // 15分钟
    USER_MOMENTS: { prefix: 'user:moments', ttl: 300 }, // 5分钟

    // 匹配相关
    MATCH_LIST: { prefix: 'match:list', ttl: 900 }, // 15分钟
    MATCH_RECOMMEND: { prefix: 'match:recommend', ttl: 300 }, // 5分钟

    // 动态相关
    MOMENT_LIST: { prefix: 'moment:list', ttl: 300 }, // 5分钟
    MOMENT_DETAIL: { prefix: 'moment:detail', ttl: 600 }, // 10分钟
    MOMENT_COMMENTS: { prefix: 'moment:comments', ttl: 300 }, // 5分钟

    // 聊天相关
    CHAT_ROOM: { prefix: 'chat:room', ttl: 3600 }, // 1小时
    CHAT_HISTORY: { prefix: 'chat:history', ttl: 1800 }, // 30分钟

    // 配置相关
    CONFIG: { prefix: 'config', ttl: 1800 }, // 30分钟
    SENSITIVE_WORDS: { prefix: 'sensitive:words', ttl: 3600 }, // 1小时

    // 统计相关
    STATISTICS: { prefix: 'stats', ttl: 300 }, // 5分钟
  };

  /**
   * 用户缓存
   */
  static User = {
    /**
     * 获取用户信息
     */
    async getInfo(userId) {
      const key = `${this.CONFIG.USER_INFO.prefix}:${userId}`;
      return QueryCache.get(key);
    },

    /**
     * 设置用户信息
     */
    async setInfo(userId, userInfo) {
      const key = `${this.CONFIG.USER_INFO.prefix}:${userId}`;
      return QueryCache.set(key, userInfo, this.CONFIG.USER_INFO.ttl);
    },

    /**
     * 删除用户信息
     */
    async delInfo(userId) {
      const key = `${this.CONFIG.USER_INFO.prefix}:${userId}`;
      return QueryCache.del(key);
    },

    /**
     * 获取用户资料
     */
    async getProfile(userId) {
      const key = `${this.CONFIG.USER_PROFILE.prefix}:${userId}`;
      return QueryCache.get(key);
    },

    /**
     * 设置用户资料
     */
    async setProfile(userId, profile) {
      const key = `${this.CONFIG.USER_PROFILE.prefix}:${userId}`;
      return QueryCache.set(key, profile, this.CONFIG.USER_PROFILE.ttl);
    },

    /**
     * 删除用户资料
     */
    async delProfile(userId) {
      return Promise.all([
        this.delInfo(userId),
        QueryCache.del(`${this.CONFIG.USER_PROFILE.prefix}:${userId}`)
      ]);
    },

    /**
     * 获取用户匹配列表
     */
    async getMatches(userId, page = 1) {
      const key = `${this.CONFIG.USER_MATCHES.prefix}:${userId}:${page}`;
      return QueryCache.get(key);
    },

    /**
     * 设置用户匹配列表
     */
    async setMatches(userId, page, matches) {
      const key = `${this.CONFIG.USER_MATCHES.prefix}:${userId}:${page}`;
      return QueryCache.set(key, matches, this.CONFIG.USER_MATCHES.ttl);
    },

    /**
     * 删除用户匹配列表
     */
    async delMatches(userId) {
      return QueryCache.delPattern(`${this.CONFIG.USER_MATCHES.prefix}:${userId}:*`);
    }
  };

  /**
   * 匹配缓存
   */
  static Match = {
    /**
     * 获取匹配列表
     */
    async getList(userId, page = 1, filter = '') {
      const key = `${this.CONFIG.MATCH_LIST.prefix}:${userId}:${page}:${filter}`;
      return QueryCache.get(key);
    },

    /**
     * 设置匹配列表
     */
    async setList(userId, page, filter, matches) {
      const key = `${this.CONFIG.MATCH_LIST.prefix}:${userId}:${page}:${filter}`;
      return QueryCache.set(key, matches, this.CONFIG.MATCH_LIST.ttl);
    },

    /**
     * 获取推荐匹配
     */
    async getRecommend(userId) {
      const key = `${this.CONFIG.MATCH_RECOMMEND.prefix}:${userId}`;
      return QueryCache.get(key);
    },

    /**
     * 设置推荐匹配
     */
    async setRecommend(userId, matches) {
      const key = `${this.CONFIG.MATCH_RECOMMEND.prefix}:${userId}`;
      return QueryCache.set(key, matches, this.CONFIG.MATCH_RECOMMEND.ttl);
    },

    /**
     * 删除匹配缓存
     */
    async del(userId) {
      return Promise.all([
        QueryCache.delPattern(`${this.CONFIG.MATCH_LIST.prefix}:${userId}:*`),
        QueryCache.del(`${this.CONFIG.MATCH_RECOMMEND.prefix}:${userId}`)
      ]);
    }
  };

  /**
   * 动态缓存
   */
  static Moment = {
    /**
     * 获取动态列表
     */
    async getList(page = 1, type = '') {
      const key = `${this.CONFIG.MOMENT_LIST.prefix}:${page}:${type}`;
      return QueryCache.get(key);
    },

    /**
     * 设置动态列表
     */
    async setList(page, type, moments) {
      const key = `${this.CONFIG.MOMENT_LIST.prefix}:${page}:${type}`;
      return QueryCache.set(key, moments, this.CONFIG.MOMENT_LIST.ttl);
    },

    /**
     * 获取动态详情
     */
    async getDetail(momentId) {
      const key = `${this.CONFIG.MOMENT_DETAIL.prefix}:${momentId}`;
      return QueryCache.get(key);
    },

    /**
     * 设置动态详情
     */
    async setDetail(momentId, moment) {
      const key = `${this.CONFIG.MOMENT_DETAIL.prefix}:${momentId}`;
      return QueryCache.set(key, moment, this.CONFIG.MOMENT_DETAIL.ttl);
    },

    /**
     * 删除动态详情
     */
    async delDetail(momentId) {
      return QueryCache.del(`${this.CONFIG.MOMENT_DETAIL.prefix}:${momentId}`);
    },

    /**
     * 删除用户动态缓存
     */
    async delUserMoments(userId) {
      return Promise.all([
        QueryCache.delPattern(`${this.CONFIG.MOMENT_LIST.prefix}:*`),
        QueryCache.delPattern(`${this.CONFIG.MOMENT_DETAIL.prefix}:*`)
      ]);
    }
  };

  /**
   * 聊天缓存
   */
  static Chat = {
    /**
     * 获取聊天室信息
     */
    async getRoom(roomId) {
      const key = `${this.CONFIG.CHAT_ROOM.prefix}:${roomId}`;
      return QueryCache.get(key);
    },

    /**
     * 设置聊天室信息
     */
    async setRoom(roomId, roomInfo) {
      const key = `${this.CONFIG.CHAT_ROOM.prefix}:${roomId}`;
      return QueryCache.set(key, roomInfo, this.CONFIG.CHAT_ROOM.ttl);
    },

    /**
     * 删除聊天室
     */
    async delRoom(roomId) {
      return QueryCache.del(`${this.CONFIG.CHAT_ROOM.prefix}:${roomId}`);
    },

    /**
     * 获取聊天历史
     */
    async getHistory(roomId, page = 1) {
      const key = `${this.CONFIG.CHAT_HISTORY.prefix}:${roomId}:${page}`;
      return QueryCache.get(key);
    },

    /**
     * 设置聊天历史
     */
    async setHistory(roomId, page, messages) {
      const key = `${this.CONFIG.CHAT_HISTORY.prefix}:${roomId}:${page}`;
      return QueryCache.set(key, messages, this.CONFIG.CHAT_HISTORY.ttl);
    },

    /**
     * 删除聊天历史
     */
    async delHistory(roomId) {
      return QueryCache.delPattern(`${this.CONFIG.CHAT_HISTORY.prefix}:${roomId}:*`);
    }
  };

  /**
   * 配置缓存
   */
  static Config = {
    /**
     * 获取配置
     */
    async get(key) {
      const cacheKey = `${this.CONFIG.CONFIG.prefix}:${key}`;
      return QueryCache.get(cacheKey);
    },

    /**
     * 设置配置
     */
    async set(key, value) {
      const cacheKey = `${this.CONFIG.CONFIG.prefix}:${key}`;
      return QueryCache.set(cacheKey, value, this.CONFIG.CONFIG.ttl);
    },

    /**
     * 删除配置
     */
    async del(key) {
      const cacheKey = `${this.CONFIG.CONFIG.prefix}:${key}`;
      return QueryCache.del(cacheKey);
    },

    /**
     * 清空配置缓存
     */
    async clear() {
      return QueryCache.delPattern(`${this.CONFIG.CONFIG.prefix}:*`);
    }
  };

  /**
   * 统计缓存
   */
  static Stats = {
    /**
     * 获取统计数据
     */
    async get(key) {
      const cacheKey = `${this.CONFIG.STATISTICS.prefix}:${key}`;
      return QueryCache.get(cacheKey);
    },

    /**
     * 设置统计数据
     */
    async set(key, value) {
      const cacheKey = `${this.CONFIG.STATISTICS.prefix}:${key}`;
      return QueryCache.set(cacheKey, value, this.CONFIG.STATISTICS.ttl);
    },

    /**
     * 删除统计数据
     */
    async del(key) {
      const cacheKey = `${this.CONFIG.STATISTICS.prefix}:${key}`;
      return QueryCache.del(cacheKey);
    }
  };

  /**
   * 获取缓存统计
   */
  static async getStats() {
    return QueryCache.getStats();
  }

  /**
   * 清空所有缓存
   */
  static async clearAll() {
    return QueryCache.flushAll();
  }

  /**
   * 预热缓存
   */
  static async warmUp() {
    // 预热敏感词
    const SensitiveWord = require('../models/SensitiveWord');
    const words = await SensitiveWord.find({ status: 'active' });
    await QueryCache.set(
      'sensitive:words:active',
      words.map(w => w.word),
      3600
    );

    console.log('✅ 缓存预热完成');
  }

  /**
   * 启动缓存清理任务
   */
  static startCleanup() {
    QueryCache.startCleanupTask(3600000); // 每小时
  }
}

module.exports = CacheService;

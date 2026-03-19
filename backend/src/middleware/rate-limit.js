/**
 * 频率限制中间件
 * 基于Redis的分布式频率限制
 */

const redis = require('../config/redis');
const config = require('../config/rate-limit');

class RateLimit {
  /**
   * 生成限流键
   */
  static generateKey(identifier, prefix) {
    return `ratelimit:${prefix}:${identifier}`;
  }

  /**
   * 检查频率限制
   */
  static async check(identifier, prefix, options) {
    const {
      windowMs = 60 * 1000,
      max = 100,
      skipSuccessfulRequests = false
    } = options;

    const key = this.generateKey(identifier, prefix);

    try {
      // 获取当前计数
      const current = await redis.get(key);

      if (!current) {
        // 首次请求,设置计数
        await redis.set(key, '1', 'PX', windowMs);
        return { allowed: true, remaining: max - 1, total: max };
      }

      // 检查是否超限
      const count = parseInt(current, 10);

      if (count >= max) {
        // 获取过期时间
        const ttl = await redis.pttl(key);

        return {
          allowed: false,
          remaining: 0,
          total: max,
          resetAt: Date.now() + ttl
        };
      }

      // 增加计数
      await redis.incr(key);

      return {
        allowed: true,
        remaining: max - count - 1,
        total: max
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Redis错误时允许通过
      return { allowed: true, remaining: max, total: max };
    }
  }

  /**
   * 频率限制中间件
   */
  static middleware(options = {}) {
    const {
      prefix = 'basic',
      keyGenerator = null,
      skipSuccessfulRequests = false,
      onLimitReached = null
    } = options;

    // 获取配置
    const limitConfig = config[prefix] || config.basic;
    const { windowMs, max, message } = limitConfig;

    return async (req, res, next) => {
      try {
        // 生成标识符
        const identifier = keyGenerator
          ? keyGenerator(req)
          : req.ip || req.socket.remoteAddress;

        // 检查频率限制
        const result = await this.check(identifier, prefix, {
          windowMs,
          max,
          skipSuccessfulRequests
        });

        // 添加响应头
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', result.remaining);

        if (!result.allowed) {
          res.setHeader('X-RateLimit-Reset', result.resetAt);

          // 调用限流回调
          if (onLimitReached) {
            onLimitReached(req, result);
          }

          // 重置成功请求计数
          if (skipSuccessfulRequests) {
            const key = this.generateKey(identifier, prefix);
            await redis.del(key);
          }

          return res.status(429).json(message || {
            success: false,
            error: {
              message: 'Too many requests',
              code: 'RATE_LIMIT_EXCEEDED'
            }
          });
        }

        // 允许通过
        next();
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        next(); // 出错时允许通过
      }
    };
  }

  /**
   * 基础API限流
   */
  static basicMiddleware() {
    return this.middleware({ prefix: 'basic' });
  }

  /**
   * 认证API限流
   */
  static authMiddleware() {
    return this.middleware({
      prefix: 'auth',
      keyGenerator: (req) => {
        // 使用IP + 用户ID的组合
        const userId = req.user?.id || 'anonymous';
        return `${req.ip}:${userId}`;
      }
    });
  }

  /**
   * 敏感API限流
   */
  static sensitiveMiddleware() {
    return this.middleware({
      prefix: 'sensitive',
      keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        return `${req.ip}:${userId}`;
      }
    });
  }

  /**
   * 基于用户类型的限流
   */
  static byUserTypeMiddleware() {
    return this.middleware({
      prefix: 'basic',
      keyGenerator: (req) => {
        const userType = req.user?.userType || 'normal';
        const userId = req.user?.id || 'anonymous';
        return `${userType}:${userId}`;
      },
      onLimitReached: (req, result) => {
        console.log(`Rate limit reached for user ${req.user?.id}:`, result);
      }
    });
  }

  /**
   * 清除限流计数
   */
  static async clear(identifier, prefix) {
    const key = this.generateKey(identifier, prefix);
    return redis.del(key);
  }

  /**
   * 获取限流统计
   */
  static async getStats(identifier, prefix) {
    const key = this.generateKey(identifier, prefix);
    const current = await redis.get(key);
    const ttl = await redis.pttl(key);

    return {
      current: parseInt(current || '0', 10),
      ttl
    };
  }
}

module.exports = RateLimit;

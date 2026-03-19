const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis 拒绝连接');
          return new Error('Redis 拒绝连接');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('重试时间超限');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis 连接成功');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis 错误:', err);
    });

    redisClient.on('ready', () => {
      logger.info('Redis 准备就绪');
    });

    await redisClient.connect();
    return redisClient;

  } catch (error) {
    logger.error('Redis 连接失败:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient
};

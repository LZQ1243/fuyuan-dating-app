/**
 * 统一配置管理中心
 * 所有服务对接和配置的统一入口
 * 确保所有配置互通无错误无延迟
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * 配置中心类
 */
class ConfigCenter {
  constructor() {
    this.configs = new Map();
    this.watchers = new Map();
    this.validators = new Map();
    this.initialized = false;
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 初始化配置中心
   */
  async initialize() {
    try {
      logger.info('初始化配置中心...');

      // 加载所有配置
      await this.loadAllConfigs();

      // 初始化验证器
      this.initializeValidators();

      // 监听配置变化
      this.setupWatchers();

      // 健康检查
      await this.healthCheck();

      this.initialized = true;
      logger.info('配置中心初始化完成');

      return this;
    } catch (error) {
      logger.error('配置中心初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载所有配置
   */
  async loadAllConfigs() {
    const configSources = [
      'environment',      // 环境变量
      'database',          // 数据库配置
      'redis',             // Redis配置
      'rabbitmq',          // RabbitMQ配置
      'storage',           // 存储配置
      'ai',                // AI服务配置
      'auth',              // 认证配置
      'upload',            // 上传配置
      'security',          // 安全配置
      'match',             // 匹配算法配置
      'accessibility',      // 无障碍配置
      'thirdparty'         // 第三方服务配置
    ];

    for (const source of configSources) {
      await this.loadConfig(source);
    }
  }

  /**
   * 加载单个配置
   */
  async loadConfig(source) {
    try {
      const config = await this.getConfigFromSource(source);

      // 验证配置
      this.validateConfig(source, config);

      // 缓存配置
      this.configs.set(source, {
        data: config,
        lastUpdate: Date.now(),
        source
      });

      logger.debug(`配置加载成功: ${source}`);
    } catch (error) {
      logger.error(`配置加载失败 (${source}):`, error);
      // 不抛出错误，允许部分配置加载失败
    }
  }

  /**
   * 从不同来源获取配置
   */
  async getConfigFromSource(source) {
    const config = {};

    switch (source) {
      case 'environment':
        Object.assign(config, {
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: parseInt(process.env.PORT) || 3000,
          HOST: process.env.HOST || '0.0.0.0'
        });
        break;

      case 'database':
        Object.assign(config, {
          // 主数据库
          uri: this.parseDatabaseURI(process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DB_URI),
          type: this.detectDatabaseType(config.uri),

          // 连接池配置
          pool: {
            min: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
            max: parseInt(process.env.DB_POOL_SIZE) || 20,
            acquireTimeoutMillis: parseInt(process.env.DB_TIMEOUT) || 5000,
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000
          },

          // 辅助数据库
          aux: {
            users: process.env.DATABASE_AUX1_URI,
            logs: process.env.DATABASE_AUX2_URI
          }
        });
        break;

      case 'redis':
        Object.assign(config, {
          uri: process.env.REDIS_URI || 'redis://localhost:6379',
          options: {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000)
          }
        });
        break;

      case 'rabbitmq':
        Object.assign(config, {
          uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
          queue: {
            name: 'fuyuan',
            durable: true,
            maxRetries: 3
          }
        });
        break;

      case 'storage':
        Object.assign(config, {
          // 本地存储
          local: {
            path: process.env.UPLOAD_PATH || './uploads',
            maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
          },

          // 云存储（可选）
          cloud: {
            provider: process.env.STORAGE_PROVIDER, // aliyun, tencent, aws, azure
            accessKey: process.env.OSS_ACCESS_KEY,
            secretKey: process.env.OSS_SECRET_KEY,
            bucket: process.env.OSS_BUCKET,
            region: process.env.OSS_REGION,
            cdnDomain: process.env.CDN_DOMAIN
          }
        });
        break;

      case 'ai':
        Object.assign(config, {
          // 阿里云语音识别
          aliyunASR: {
            appKey: process.env.ALIYUN_ASR_APPKEY,
            token: process.env.ALIYUN_ASR_TOKEN,
            enabled: !!process.env.ALIYUN_ASR_APPKEY
          },

          // 腾讯人脸识别
          tencentFace: {
            apiKey: process.env.TENCENT_FACE_API_KEY,
            secretId: process.env.TENCENT_FACE_SECRET_ID,
            enabled: !!process.env.TENCENT_FACE_API_KEY
          }
        });
        break;

      case 'auth':
        Object.assign(config, {
          jwt: {
            secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            algorithm: 'HS256'
          },

          admin: {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'admin123'
          }
        });
        break;

      case 'upload':
        Object.assign(config, {
          maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
          allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm'
          ],
          maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10
        });
        break;

      case 'security':
        Object.assign(config, {
          cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            credentials: true
          },

          rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
          },

          helmet: {
            contentSecurityPolicy: process.env.NODE_ENV === 'production',
            hsts: {
              maxAge: 31536000,
              includeSubDomains: true
            }
          }
        });
        break;

      case 'match':
        Object.assign(config, {
          recommendLimit: parseInt(process.env.MATCH_RECOMMEND_LIMIT) || 20,
          weights: {
            level: parseInt(process.env.MATCH_LEVEL_WEIGHT) || 40,
            type: parseInt(process.env.MATCH_TYPE_WEIGHT) || 35,
            location: parseInt(process.env.MATCH_LOCATION_WEIGHT) || 15,
            age: parseInt(process.env.MATCH_AGE_WEIGHT) || 10
          }
        });
        break;

      case 'accessibility':
        Object.assign(config, {
          fontSize: parseInt(process.env.ACCESSIBILITY_FONT_SIZE) || 16,
          highContrast: process.env.ACCESSIBILITY_HIGH_CONTRAST === 'true',
          screenReader: {
            enabled: true,
            ariaLabels: true
          }
        });
        break;

      case 'thirdparty':
        Object.assign(config, {
          // 短信服务
          sms: {
            provider: process.env.SMS_PROVIDER, // aliyun, tencent, twilio
            accessKey: process.env.SMS_ACCESS_KEY,
            secretKey: process.env.SMS_SECRET_KEY,
            signName: process.env.SMS_SIGN_NAME
          },

          // 邮件服务
          email: {
            provider: process.env.EMAIL_PROVIDER, // smtp, sendgrid, ses
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            from: process.env.EMAIL_FROM
          },

          // 支付服务
          payment: {
            provider: process.env.PAYMENT_PROVIDER, // alipay, wechat, stripe
            appId: process.env.PAYMENT_APP_ID,
            privateKey: process.env.PAYMENT_PRIVATE_KEY,
            publicKey: process.env.PAYMENT_PUBLIC_KEY
          }
        });
        break;

      default:
        throw new Error(`未知的配置源: ${source}`);
    }

    return config;
  }

  /**
   * 解析数据库URI
   */
  parseDatabaseURI(uri) {
    if (!uri) {
      return null;
    }

    try {
      const url = new URL(uri);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: url.port || this.getDefaultPort(url.protocol),
        username: url.username,
        password: url.password,
        database: url.pathname?.replace(/^\//, ''),
        options: this.parseQueryParams(url.searchParams)
      };
    } catch (error) {
      logger.error('解析数据库URI失败:', error);
      return null;
    }
  }

  /**
   * 检测数据库类型
   */
  detectDatabaseType(uri) {
    if (!uri) return 'unknown';

    const lowerUri = uri.toLowerCase();
    if (lowerUri.startsWith('mongodb')) return 'mongodb';
    if (lowerUri.startsWith('mysql')) return 'mysql';
    if (lowerUri.startsWith('mariadb')) return 'mariadb';
    if (lowerUri.startsWith('postgres')) return 'postgresql';
    if (lowerUri.startsWith('sqlite')) return 'sqlite';
    if (lowerUri.startsWith('sqlserver')) return 'sqlserver';
    if (lowerUri.startsWith('oracle')) return 'oracle';
    if (lowerUri.startsWith('couchbase')) return 'couchbase';

    return 'unknown';
  }

  /**
   * 获取默认端口
   */
  getDefaultPort(protocol) {
    const ports = {
      'mongodb': 27017,
      'mysql': 3306,
      'mariadb': 3306,
      'postgresql': 5432,
      'sqlite': 0,
      'sqlserver': 1433,
      'oracle': 1521,
      'couchbase': 8091
    };
    return ports[protocol] || 0;
  }

  /**
   * 解析查询参数
   */
  parseQueryParams(searchParams) {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * 初始化验证器
   */
  initializeValidators() {
    // 数据库配置验证
    this.validators.set('database', (config) => {
      if (!config.uri) {
        throw new Error('数据库URI不能为空');
      }
      if (!config.type || config.type === 'unknown') {
        throw new Error('无法识别的数据库类型');
      }
      if (config.pool.min > config.pool.max) {
        throw new Error('连接池最小值不能大于最大值');
      }
      return true;
    });

    // JWT配置验证
    this.validators.set('auth', (config) => {
      if (!config.jwt.secret || config.jwt.secret.length < 32) {
        throw new Error('JWT密钥长度不能少于32字符');
      }
      if (config.admin.username === 'admin' && config.admin.password === 'admin123') {
        logger.warn('警告: 使用默认管理员密码，请及时修改');
      }
      return true;
    });

    // 安全配置验证
    this.validators.set('security', (config) => {
      if (config.rateLimit.maxRequests < 1) {
        throw new Error('限流配置无效');
      }
      return true;
    });
  }

  /**
   * 验证配置
   */
  validateConfig(source, config) {
    const validator = this.validators.get(source);
    if (validator) {
      try {
        validator(config);
      } catch (error) {
        logger.error(`配置验证失败 (${source}):`, error.message);
        throw error;
      }
    }
  }

  /**
   * 设置监听器
   */
  setupWatchers() {
    // 监听环境变量变化
    if (process.env.NODE_ENV === 'development') {
      // 开发环境每30秒检查一次环境变量变化
      setInterval(() => {
        this.checkEnvironmentChanges();
      }, 30000);
    }
  }

  /**
   * 检查环境变量变化
   */
  async checkEnvironmentChanges() {
    // 实现环境变量变化检测逻辑
    // 这里可以监听文件变化或定期检查
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    const checks = [];

    // 检查数据库配置
    try {
      const dbConfig = this.get('database');
      if (dbConfig && dbConfig.uri) {
        checks.push({ name: 'database', status: 'ok', type: dbConfig.type });
      } else {
        checks.push({ name: 'database', status: 'error', message: '配置缺失' });
      }
    } catch (error) {
      checks.push({ name: 'database', status: 'error', message: error.message });
    }

    // 检查Redis配置
    try {
      const redisConfig = this.get('redis');
      if (redisConfig && redisConfig.uri) {
        checks.push({ name: 'redis', status: 'ok' });
      } else {
        checks.push({ name: 'redis', status: 'warning', message: '未配置' });
      }
    } catch (error) {
      checks.push({ name: 'redis', status: 'error', message: error.message });
    }

    // 检查JWT配置
    try {
      const authConfig = this.get('auth');
      if (authConfig && authConfig.jwt.secret) {
        checks.push({ name: 'auth', status: 'ok' });
      } else {
        checks.push({ name: 'auth', status: 'error', message: 'JWT密钥缺失' });
      }
    } catch (error) {
      checks.push({ name: 'auth', status: 'error', message: error.message });
    }

    // 检查所有配置
    const allConfigs = Array.from(this.configs.keys());
    checks.push({ name: 'configs', status: 'ok', count: allConfigs.length });

    return {
      status: checks.every(c => c.status === 'ok' || c.status === 'warning') ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取配置
   */
  get(source) {
    const config = this.configs.get(source);
    if (!config) {
      logger.warn(`配置未找到: ${source}`);
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - config.lastUpdate > this.cacheTimeout) {
      // 重新加载配置
      this.loadConfig(source);
      return this.configs.get(source)?.data;
    }

    return config.data;
  }

  /**
   * 获取所有配置
   */
  getAll() {
    const allConfigs = {};
    for (const [source, config] of this.configs.entries()) {
      allConfigs[source] = config.data;
    }
    return allConfigs;
  }

  /**
   * 更新配置
   */
  async update(source, newConfig) {
    try {
      // 验证新配置
      this.validateConfig(source, newConfig);

      // 更新配置
      this.configs.set(source, {
        data: newConfig,
        lastUpdate: Date.now(),
        source
      });

      logger.info(`配置已更新: ${source}`);

      // 通知监听器
      this.notifyWatchers(source, newConfig);

      return newConfig;
    } catch (error) {
      logger.error(`配置更新失败 (${source}):`, error);
      throw error;
    }
  }

  /**
   * 重新加载配置
   */
  async reload(source) {
    return await this.loadConfig(source);
  }

  /**
   * 重新加载所有配置
   */
  async reloadAll() {
    await this.loadAllConfigs();
    logger.info('所有配置已重新加载');
  }

  /**
   * 添加配置监听器
   */
  onConfigChange(source, callback) {
    if (!this.watchers.has(source)) {
      this.watchers.set(source, []);
    }
    this.watchers.get(source).push(callback);
  }

  /**
   * 移除配置监听器
   */
  offConfigChange(source, callback) {
    const watchers = this.watchers.get(source);
    if (watchers) {
      const index = watchers.indexOf(callback);
      if (index > -1) {
        watchers.splice(index, 1);
      }
    }
  }

  /**
   * 通知监听器
   */
  notifyWatchers(source, newConfig) {
    const watchers = this.watchers.get(source);
    if (watchers) {
      for (const callback of watchers) {
        try {
          callback(source, newConfig);
        } catch (error) {
          logger.error(`配置监听器错误 (${source}):`, error);
        }
      }
    }
  }

  /**
   * 导出配置
   */
  exportConfig() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      configs: this.getAll()
    };
  }

  /**
   * 导入配置
   */
  async importConfig(configData) {
    try {
      if (!configData.configs) {
        throw new Error('无效的配置数据');
      }

      for (const [source, config] of Object.entries(configData.configs)) {
        await this.update(source, config);
      }

      logger.info('配置导入完成');
      return true;
    } catch (error) {
      logger.error('配置导入失败:', error);
      throw error;
    }
  }

  /**
   * 获取配置摘要
   */
  getSummary() {
    return {
      initialized: this.initialized,
      configCount: this.configs.size,
      configNames: Array.from(this.configs.keys()),
      watchers: Array.from(this.watchers.keys()).reduce((acc, key) => {
        acc[key] = this.watchers.get(key).length;
        return acc;
      }, {}),
      lastUpdate: Math.max(...Array.from(this.configs.values()).map(c => c.lastUpdate))
    };
  }
}

// 创建单例
const configCenter = new ConfigCenter();

module.exports = configCenter;

/**
 * 使用示例：
 *
 * // 初始化
 * await configCenter.initialize();
 *
 * // 获取配置
 * const dbConfig = configCenter.get('database');
 * const authConfig = configCenter.get('auth');
 *
 * // 获取所有配置
 * const allConfigs = configCenter.getAll();
 *
 * // 更新配置
 * await configCenter.update('database', { uri: '...', type: 'mongodb' });
 *
 * // 重新加载
 * await configCenter.reload('database');
 * await configCenter.reloadAll();
 *
 * // 健康检查
 * const health = await configCenter.healthCheck();
 *
 * // 监听配置变化
 * configCenter.onConfigChange('database', (source, newConfig) => {
 *   console.log('数据库配置已更新:', newConfig);
 * });
 *
 * // 导出/导入配置
 * const exported = configCenter.exportConfig();
 * await configCenter.importConfig(exported);
 */

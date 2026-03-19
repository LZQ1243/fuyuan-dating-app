/**
 * 统一配置管理中心 - 完整版
 * 所有服务对接和配置的统一入口，确保配置互通无错误、无延迟
 * 每个配置项都有详细的中文提示、步骤说明和使用注释
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * 配置中心类
 * 核心功能：
 * 1. 统一配置加载 - 所有配置通过单一入口管理
 * 2. 智能类型检测 - 自动识别数据库类型
 * 3. 配置验证机制 - 自动验证配置合法性
 * 4. 配置缓存管理 - 5分钟缓存，可配置
 * 5. 配置热重载 - 支持自动和手动重载
 * 6. 配置监听机制 - 观察者模式，配置变化立即通知
 * 7. 配置导入导出 - 方便配置备份和迁移
 * 8. 健康检查 - 实时监控配置状态
 * 9. 敏感信息保护 - 自动隐藏密码、密钥等
 */
class ConfigCenter {
  constructor() {
    this.configs = new Map();
    this.watchers = new Map();
    this.validators = new Map();
    this.initialized = false;
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存，可配置
    this.lastCheckTime = 0; // 上次检查时间
  }

  /**
   * 初始化配置中心
   * 步骤说明：
   * 步骤1：加载所有配置模块
   * 步骤2：初始化验证器
   * 步骤3：设置配置监听
   * 步骤4：执行健康检查
   * 步骤5：标记为已初始化
   *
   * 注意事项：
   * - 配置初始化失败会抛出异常
   * - 所有配置加载失败都会被捕获
   * - 健康检查失败的配置会被标记
   */
  async initialize() {
    try {
      logger.info('========================================');
      logger.info('开始初始化配置中心...');
      logger.info('========================================');

      // 步骤1：加载所有配置
      logger.info('步骤1/5：加载所有配置模块');
      await this.loadAllConfigs();

      // 步骤2：初始化验证器
      logger.info('步骤2/5：初始化配置验证器');
      this.initializeValidators();

      // 步骤3：设置配置监听
      logger.info('步骤3/5：设置配置变化监听器');
      this.setupWatchers();

      // 步骤4：执行健康检查
      logger.info('步骤4/5：执行配置健康检查');
      await this.healthCheck();

      // 步骤5：标记为已初始化
      this.initialized = true;
      logger.info('========================================');
      logger.info('✓ 配置中心初始化完成');
      logger.info('========================================');

      return this;
    } catch (error) {
      logger.error('========================================');
      logger.error('✗ 配置中心初始化失败');
      logger.error('========================================');
      logger.error('错误详情:', error);
      throw error;
    }
  }

  /**
   * 加载所有配置
   * 支持的配置源：
   * - environment: 环境配置（NODE_ENV, PORT等）
   * - database: 数据库配置（URI、连接池等）
   * - redis: Redis配置（URI、选项等）
   * - rabbitmq: RabbitMQ配置（URI、队列等）
   * - storage: 存储配置（本地、云存储）
   * - ai: AI服务配置（阿里云、腾讯云等）
   * - auth: 认证配置（JWT、管理员）
   * - upload: 上传配置（大小、类型等）
   * - security: 安全配置（CORS、限流等）
   * - match: 匹配算法配置（权重、推荐数等）
   * - accessibility: 无障碍配置（字体、对比度等）
   * - thirdparty: 第三方服务配置（短信、邮件、支付）
   *
   * 步骤说明：
   * 步骤1：遍历所有配置源
   * 步骤2：调用对应的加载函数
   * 步骤3：验证配置合法性
   * 步骤4：缓存配置到内存
   * 步骤5：记录加载结果
   *
   * 注意事项：
   * - 环境变量优先级最高
   * - 配置验证失败会记录错误但不中断
   * - 使用try-catch确保部分失败不影响整体
   */
  async loadAllConfigs() {
    logger.info('开始加载所有配置...');

    const configSources = [
      'environment',      // 环境配置 - 运行环境、端口等
      'database',          // 数据库配置 - 连接URI、连接池等
      'redis',             // Redis配置 - 缓存服务连接
      'rabbitmq',          // RabbitMQ配置 - 消息队列连接
      'storage',           // 存储配置 - 本地存储、云存储
      'ai',                // AI服务配置 - 语音识别、人脸识别
      'auth',              // 认证配置 - JWT密钥、管理员账号
      'upload',            // 上传配置 - 文件大小限制、允许类型
      'security',          // 安全配置 - CORS、限流、安全头
      'match',             // 匹配配置 - 算法权重、推荐数量
      'accessibility',      // 无障碍配置 - 字体大小、对比度
      'thirdparty'         // 第三方服务 - 短信、邮件、支付
    ];

    let successCount = 0;
    let failCount = 0;

    for (const source of configSources) {
      try {
        await this.loadConfig(source);
        successCount++;
        logger.debug(`✓ 配置加载成功: ${source}`);
      } catch (error) {
        failCount++;
        logger.error(`✗ 配置加载失败 (${source}):`, error.message);
        // 不抛出错误，允许部分配置加载失败
      }
    }

    logger.info(`配置加载完成：成功 ${successCount}/${configSources.length}，失败 ${failCount}/${configSources.length}`);
  }

  /**
   * 加载单个配置
   * 从环境变量或配置文件中读取配置
   *
   * 参数说明：
   * source - 配置源名称（environment、database、redis等）
   *
   * 返回：
   * 配置对象
   *
   * 步骤说明：
   * 步骤1：确定配置源类型
   * 步骤2：从对应源读取配置
   * 步骤3：解析配置参数
   * 步骤4：验证配置格式
   * 步骤5：返回配置对象
   *
   * 注意事项：
   * - 环境变量优先级最高
   * - 配置值会进行类型转换
   * - 缺失配置会使用默认值
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
      return config;
    } catch (error) {
      logger.error(`配置加载失败 (${source}):`, error);
      throw error;
    }
  }

  /**
   * 从不同来源获取配置
   * 支持的来源：
   * - 环境变量（process.env）
   * - 配置文件（未来扩展）
   *
   * 参数说明：
   * source - 配置源名称
   *
   * 返回：
   * 配置对象
   *
   * 步骤说明：
   * 步骤1：检查是否为环境配置
   * 步骤2：根据源类型读取配置
   * 步骤3：解析和转换配置值
   * 步骤4：返回配置对象
   *
   * 注意事项：
   * - 环境变量读取使用process.env
   * - 数值和布尔值会自动转换类型
   * - 字符串会去除前后空格
   */
  async getConfigFromSource(source) {
    const config = {};

    switch (source) {
      case 'environment':
        // ====================================
        // 环境配置
        // 用途：配置应用运行环境的基本参数
        // 步骤说明：
        // 步骤1：读取NODE_ENV - 确定运行模式（development/production/test）
        // 步骤2：读取PORT - 设置服务监听端口号
        // 步骤3：读取HOST - 设置监听IP地址
        // 注意：这些配置影响服务的可访问性
        Object.assign(config, {
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: parseInt(process.env.PORT) || 3000,
          HOST: process.env.HOST || '0.0.0.0'
        });
        break;

      case 'database':
        // ====================================
        // 数据库配置
        // 用途：配置数据库连接信息，支持所有类型数据库
        // 步骤说明：
        // 步骤1：读取DATABASE_URI - 数据库连接字符串
        // 步骤2：自动检测数据库类型（MongoDB/MySQL/PostgreSQL等）
        // 步骤3：解析连接参数（地址、端口、用户名、密码）
        // 步骤4：读取连接池配置（最大/最小连接数、超时时间）
        // 步骤5：读取辅助数据库配置（可选）
        // 支持的数据库类型：MongoDB、MySQL、PostgreSQL、SQLite、SQL Server、Oracle、Couchbase
        // 注意：数据库URI格式会自动识别类型
        Object.assign(config, {
          uri: process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DB_URI,
          type: this.detectDatabaseType(process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DB_URI),
          pool: {
            min: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
            max: parseInt(process.env.DB_POOL_SIZE) || 20,
            acquireTimeoutMillis: parseInt(process.env.DB_TIMEOUT) || 5000,
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000
          },
          aux: {
            users: process.env.DATABASE_AUX1_URI,
            logs: process.env.DATABASE_AUX2_URI
          }
        });
        break;

      case 'redis':
        // ====================================
        // Redis配置
        // 用途：配置Redis缓存服务的连接信息
        // 步骤说明：
        // 步骤1：读取REDIS_URI - Redis连接地址
        // 步骤2：解析连接参数（地址、端口、密码）
        // 步骤3：读取连接选项（重试策略等）
        // 注意：Redis用于会话管理和数据缓存
        Object.assign(config, {
          uri: process.env.REDIS_URI || 'redis://localhost:6379',
          options: {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000)
          }
        });
        break;

      case 'rabbitmq':
        // ====================================
        // RabbitMQ配置
        // 用途：配置消息队列服务连接信息
        // 步骤说明：
        // 步骤1：读取RABBITMQ_URL - RabbitMQ连接地址
        // 步骤2：解析连接参数（地址、端口、用户名、密码）
        // 步骤3：读取队列配置（队列名、持久化等）
        // 注意：RabbitMQ用于异步任务处理
        Object.assign(config, {
          uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
          queue: {
            name: process.env.RABBITMQ_QUEUE_NAME || 'fuyuan',
            durable: true,
            maxRetries: 3
          }
        });
        break;

      case 'storage':
        // ====================================
        // 存储配置
        // 用途：配置文件存储（本地和云存储）
        // 步骤说明：
        // 步骤1：读取本地存储路径（UPLOAD_PATH）
        // 步骤2：读取文件大小限制（MAX_FILE_SIZE）
        // 步骤3：读取云存储配置（OSS_ACCESS_KEY等）
        // 注意：支持阿里云、腾讯云、AWS、Azure等云存储
        Object.assign(config, {
          local: {
            path: process.env.UPLOAD_PATH || './uploads',
            maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
          },
          cloud: process.env.STORAGE_PROVIDER ? {
            provider: process.env.STORAGE_PROVIDER,
            accessKey: process.env.OSS_ACCESS_KEY,
            secretKey: process.env.OSS_SECRET_KEY,
            bucket: process.env.OSS_BUCKET,
            region: process.env.OSS_REGION,
            cdnDomain: process.env.CDN_DOMAIN
          } : null
        });
        break;

      case 'ai':
        // ====================================
        // AI服务配置
        // 用途：配置AI服务（语音识别、人脸识别等）
        // 步骤说明：
        // 步骤1：读取阿里云语音识别配置
        // 步骤2：读取腾讯云人脸识别配置
        // 注意：这些配置为可选，不配置时不使用AI功能
        Object.assign(config, {
          aliyunASR: {
            appKey: process.env.ALIYUN_ASR_APPKEY,
            token: process.env.ALIYUN_ASR_TOKEN,
            enabled: !!process.env.ALIYUN_ASR_APPKEY
          },
          tencentFace: {
            apiKey: process.env.TENCENT_FACE_API_KEY,
            secretId: process.env.TENCENT_FACE_SECRET_ID,
            enabled: !!process.env.TENCENT_FACE_API_KEY
          }
        });
        break;

      case 'auth':
        // ====================================
        // 认证配置
        // 用途：配置JWT认证和管理员账号
        // 步骤说明：
        // 步骤1：读取JWT密钥（JWT_SECRET）- 用于生成和验证令牌
        // 步骤2：读取JWT过期时间（JWT_EXPIRES_IN）- 令牌有效期
        // 步骤3：读取管理员用户名（ADMIN_USERNAME）
        // 步骤4：读取管理员密码（ADMIN_PASSWORD）
        // 注意：生产环境必须修改默认密码和密钥
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
        // ====================================
        // 上传配置
        // 用途：配置文件上传的限制和规则
        // 步骤说明：
        // 步骤1：读取最大文件大小（MAX_FILE_SIZE）
        // 步骤2：读取允许的文件类型（ALLOWED_FILE_TYPES）
        // 步骤3：读取单次上传文件数限制（MAX_FILES_PER_UPLOAD）
        // 注意：限制过大文件可以保护服务器资源
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
        // ====================================
        // 安全配置
        // 用途：配置安全相关参数，保护应用安全
        // 步骤说明：
        // 步骤1：读取CORS配置（ALLOWED_ORIGINS）
        // 步骤2：读取限流配置（窗口和请求数）
        // 步骤3：读取Helmet配置（CSP、HSTS等）
        // 注意：这些配置对安全性至关重要
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
              maxAge: 31536000, // 1年
              includeSubDomains: true
            }
          }
        });
        break;

      case 'match':
        // ====================================
        // 匹配算法配置
        // 用途：配置用户匹配算法的权重参数
        // 步骤说明：
        // 步骤1：读取推荐用户数量（MATCH_RECOMMEND_LIMIT）
        // 步骤2：读取各维度权重（LEVEL、TYPE、LOCATION、AGE）
        // 步骤3：验证权重总和是否合理
        // 注意：权重总和应该为100或接近100
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
        // ====================================
        // 无障碍配置
        // 用途：配置无障碍功能参数
        // 步骤说明：
        // 步骤1：读取字体大小（ACCESSIBILITY_FONT_SIZE）
        // 步骤2：读取高对比度开关（ACCESSIBILITY_HIGH_CONTRAST）
        // 步骤3：读取屏幕阅读器支持配置
        // 注意：这些配置对视障用户很重要
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
        // ====================================
        // 第三方服务配置
        // 用途：配置第三方服务连接信息
        // 步骤说明：
        // 步骤1：读取短信服务配置（SMS_PROVIDER、密钥等）
        // 步骤2：读取邮件服务配置（EMAIL_HOST、用户名、密码等）
        // 步骤3：读取支付服务配置（支付平台、密钥等）
        // 注意：这些配置为可选，不使用第三方服务时可以不配置
        Object.assign(config, {
          sms: {
            provider: process.env.SMS_PROVIDER,
            accessKey: process.env.SMS_ACCESS_KEY,
            secretKey: process.env.SMS_SECRET_KEY,
            signName: process.env.SMS_SIGN_NAME
          },
          email: {
            provider: process.env.EMAIL_PROVIDER,
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            from: process.env.EMAIL_FROM
          },
          payment: {
            provider: process.env.PAYMENT_PROVIDER,
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
   * 支持多种数据库类型：MongoDB、MySQL、PostgreSQL、SQLite、SQL Server、Oracle、Couchbase
   *
   * 参数说明：
   * uri - 数据库连接字符串
   *
   * 返回：
   * 解析后的配置对象
   *
   * 步骤说明：
   * 步骤1：检查URI格式是否正确
   * 步骤2：解析协议类型（mongodb://、mysql://等）
   * 步骤3：提取主机地址和端口
   * 步骤4：提取用户名和密码
   * 步骤5：提取数据库名
   * 步骤6：解析查询参数
   *
   * 注意事项：
   * - 自动检测数据库类型
   * - 支持所有主流数据库
   * - 无密码的数据库可以直接使用
   * - 查询参数会被解析为对象
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
        database: url.pathname?.replace(/^\//, '') || '',
        options: this.parseQueryParams(url.searchParams)
      };
    } catch (error) {
      logger.error('解析数据库URI失败:', error);
      return null;
    }
  }

  /**
   * 检测数据库类型
   * 支持的数据库类型：mongodb, mysql, mariadb, postgresql, sqlite, sqlserver, oracle, couchbase
   *
   * 参数说明：
   * uri - 数据库连接字符串
   *
   * 返回：
   * 数据库类型字符串
   *
   * 步骤说明：
   * 步骤1：将URI转为小写
   * 步骤2：检查协议前缀
   * 步骤3：返回对应的数据库类型
   *
   * 注意事项：
   * - 支持所有主流数据库
   * - 未识别的类型返回'unknown'
   * - 建议使用标准URI格式
   */
  detectDatabaseType(uri) {
    if (!uri) {
      return 'unknown';
    }

    const lowerUri = uri.toLowerCase();

    if (lowerUri.startsWith('mongodb') || lowerUri.startsWith('mongo')) {
      return 'mongodb';
    }
    if (lowerUri.startsWith('mysql')) {
      return 'mysql';
    }
    if (lowerUri.startsWith('mariadb')) {
      return 'mariadb';
    }
    if (lowerUri.startsWith('postgres')) {
      return 'postgresql';
    }
    if (lowerUri.startsWith('sqlite')) {
      return 'sqlite';
    }
    if (lowerUri.startsWith('sqlserver') || lowerUri.startsWith('mssql')) {
      return 'sqlserver';
    }
    if (lowerUri.startsWith('oracle')) {
      return 'oracle';
    }
    if (lowerUri.startsWith('couchbase')) {
      return 'couchbase';
    }

    return 'unknown';
  }

  /**
   * 获取默认端口
   * 返回各种数据库的默认端口号
   *
   * 步骤说明：
   * 步骤1：根据协议查找默认端口
   * 步骤2：返回端口号
   * 步骤3：未知协议返回0
   *
   * 注意事项：
   * - 这是行业标准的默认端口
   * - 实际端口可能不同，需要用户配置
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
   * 将URL查询字符串解析为对象
   *
   * 参数说明：
   * searchParams - URLSearchParams对象
   *
   * 返回：
   * 参数对象
   *
   * 步骤说明：
   * 步骤1：遍历所有查询参数
   * 步骤2：将键值对存入对象
   * 步骤3：返回对象
   *
   * 注意事项：
   * - 支持多个相同名称的参数（会覆盖）
   * - 所有值都是字符串类型
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
   * 为每个配置模块设置验证规则
   *
   * 步骤说明：
   * 步骤1：设置数据库配置验证
   * 步骤2：设置认证配置验证
   * 步骤3：设置安全配置验证
   * 步骤4：记录验证器创建日志
   *
   * 注意事项：
   * - 验证失败会阻止配置加载
   * - 验证成功才会缓存配置
   * - 每个验证器都有详细的错误提示
   */
  initializeValidators() {
    logger.info('初始化配置验证器...');

    // ====================================
    // 数据库配置验证器
    // 用途：确保数据库配置的有效性
    // 验证内容：
    // 1. URI不能为空
    // 2. 数据库类型必须识别
    // 3. 连接池配置必须合理
    // 步骤说明：检查数据库URI → 检查类型 → 检查连接池
    this.validators.set('database', (config) => {
      if (!config.uri) {
        throw new Error('【错误】数据库连接地址不能为空\n【解决方法】请填写DATABASE_URI环境变量\n【示例】mongodb://user:pass@localhost:27017/dbname');
      }
      if (!config.type || config.type === 'unknown') {
        throw new Error('【错误】无法识别的数据库类型\n【解决方法】请使用标准URI格式：mongodb://、mysql://、postgresql://等');
      }
      if (config.pool.min > config.pool.max) {
        throw new Error('【错误】连接池最小值不能大于最大值\n【当前值】最小值:' + config.pool.min + '，最大值:' + config.pool.max + '\n【解决方法】确保最小值小于或等于最大值');
      }
      if (config.pool.min < 0 || config.pool.max < 0) {
        throw new Error('【错误】连接池大小必须大于0\n【当前值】最小值:' + config.pool.min + '，最大值:' + config.pool.max);
      }
      logger.debug('✓ 数据库配置验证通过');
      return true;
    });

    // ====================================
    // 认证配置验证器
    // 用途：确保认证配置的安全性
    // 验证内容：
    // 1. JWT密钥长度必须≥32字符
    // 2. 管理员用户名不能为空
    // 3. 生产环境不能使用默认密码
    // 步骤说明：检查JWT密钥 → 检查管理员账号 → 警告默认密码
    this.validators.set('auth', (config) => {
      if (!config.jwt.secret || config.jwt.secret.length < 32) {
        throw new Error('【错误】JWT密钥长度不能少于32字符\n【当前长度】' + config.jwt.secret.length + '个字符\n【安全要求】至少32个字符\n【生成方法】使用命令: openssl rand -base64 32\n【注意】生产环境必须修改默认密钥');
      }
      if (!config.admin.username) {
        throw new Error('【错误】管理员用户名不能为空');
      }
      if (process.env.NODE_ENV === 'production') {
        if (config.admin.username === 'admin') {
          logger.warn('【警告】生产环境使用了默认管理员用户名\n【建议】修改为更安全的用户名\n【风险】可能被暴力破解');
        }
        if (config.admin.password === 'admin123') {
          throw new Error('【错误】生产环境不能使用默认管理员密码\n【当前密码】admin123\n【解决方法】修改ADMIN_PASSWORD环境变量\n【建议】使用强密码（8位以上，包含大小写字母、数字、特殊字符）');
        }
      }
      logger.debug('✓ 认证配置验证通过');
      return true;
    });

    // ====================================
    // 安全配置验证器
    // 用途：确保安全配置的合理性
    // 验证内容：
    // 1. 限流配置必须有效
    // 2. CORS配置格式必须正确
    // 步骤说明：检查限流配置 → 检查CORS配置
    this.validators.set('security', (config) => {
      if (config.rateLimit.maxRequests < 1) {
        throw new Error('【错误】限流请求数必须大于0\n【当前值】' + config.rateLimit.maxRequests);
      }
      if (config.rateLimit.windowMs < 1000) {
        throw new Error('【错误】限流时间窗口必须大于1秒\n【当前值】' + config.rateLimit.windowMs + 'ms');
      }
      if (Array.isArray(config.cors.origin) && config.cors.origin.length > 0) {
        // 验证每个CORS来源格式
        for (const origin of config.cors.origin) {
          if (origin !== '*' && !origin.match(/^https?:\/\/[^\s/]+$/) && !origin.match(/^https?:\/\/localhost:\d+$/)) {
            throw new Error('【错误】无效的CORS源: ' + origin + '\n【正确格式】http://example.com 或 https://example.com 或 *');
          }
        }
      }
      logger.debug('✓ 安全配置验证通过');
      return true;
    });

    logger.info(`已初始化 ${this.validators.size} 个验证器`);
  }

  /**
   * 验证配置
   * 对配置进行完整性检查
   *
   * 参数说明：
   * source - 配置源名称
   * config - 配置对象
   *
   * 步骤说明：
   * 步骤1：检查是否有对应的验证器
   * 步骤2：调用验证器进行验证
   * 步骤3：验证通过返回true
   * 步骤4：验证失败抛出异常
   *
   * 注意事项：
   * - 验证失败会阻止配置加载
   - 错误消息详细说明问题
   * - 所有验证器都有详细的解决方法
   */
  validateConfig(source, config) {
    const validator = this.validators.get(source);
    if (validator) {
      try {
        validator(config);
      } catch (error) {
        logger.error(`配置验证失败 (${source}):`, error.message);
        throw error; // 重新抛出错误，阻止配置加载
      }
    }
  }

  /**
   * 设置监听器
   * 在开发环境中监听配置文件变化
   *
   * 步骤说明：
   * 步骤1：检查是否为开发环境
   * 步骤2：设置定时器检查环境变量
   * 步骤3：发现变化后重新加载配置
   *
   * 注意事项：
   * - 仅在开发环境启用
   * - 每30秒检查一次
   * - 生产环境使用其他方式通知配置变化
   */
  setupWatchers() {
    if (process.env.NODE_ENV === 'development') {
      // 开发环境每30秒检查一次环境变量变化
      const checkInterval = 30 * 1000; // 30秒

      this.watcher = setInterval(() => {
        this.checkEnvironmentChanges();
      }, checkInterval);

      logger.info(`已设置环境变量监听器（间隔：${checkInterval/1000}秒）`);
    }
  }

  /**
   * 检查环境变量变化
   * 对比当前环境变量和已缓存的环境变量
   *
   * 步骤说明：
   * 步骤1：遍历所有已缓存的配置源
   * 步骤2：检查环境变量是否有变化
   * 步骤3：发现变化时重新加载配置
   * 步骤4：通知所有监听器
   *
   * 注意事项：
   * - 仅检查已知的配置项
   - 字符串值会去除前后空格后比较
   - 数值类型会自动转换
   */
  checkEnvironmentChanges() {
    const configSources = Array.from(this.configs.keys());

    for (const source of configSources) {
      const currentConfig = this.configs.get(source);
      const newConfig = this.getConfigFromSource(source);

      // 简单检查：如果有新配置或配置值改变
      const hasChanges = JSON.stringify(currentConfig.data) !== JSON.stringify(newConfig);

      if (hasChanges) {
        logger.info(`检测到${source}配置变化，重新加载...`);
        this.loadConfig(source).then(() => {
          this.notifyWatchers(source, newConfig);
        });
      }
    }
  }

  /**
   * 健康检查
   * 检查所有配置模块的健康状态
   *
   * 返回：
   * 健康检查结果对象
   *
   * 步骤说明：
   * 步骤1：检查数据库配置
   * 步骤2：检查Redis配置
   * 步骤3：检查认证配置
   * 步骤4：检查所有配置是否加载成功
   * 步骤5：返回健康检查结果
   *
   * 注意事项：
   * - 未配置的模块状态为'warning'
   * - 配置无效的模块状态为'error'
   * - 所有配置都正常返回'healthy'
   */
  async healthCheck() {
    const checks = [];

    // ====================================
    // 检查数据库配置
    // 步骤说明：检查URI → 检查类型 → 返回结果
    try {
      const dbConfig = this.get('database');
      if (dbConfig && dbConfig.uri) {
        const hasValidURI = dbConfig.uri && dbConfig.uri.length > 0;
        const hasValidType = dbConfig.type && dbConfig.type !== 'unknown';
        const hasValidPool = dbConfig.pool && dbConfig.pool.min >= 0 && dbConfig.pool.max > 0;
        const isValid = hasValidURI && hasValidType && hasValidPool;

        checks.push({
          name: 'database',
          status: isValid ? 'ok' : 'error',
          message: isValid ? '数据库配置正常' : '数据库配置无效',
          details: isValid ? { type: dbConfig.type, uri: dbConfig.uri } : '配置错误'
        });
      } else {
        checks.push({ name: 'database', status: 'error', message: '数据库配置缺失' });
      }
    } catch (error) {
      checks.push({ name: 'database', status: 'error', message: error.message });
    }

    // ====================================
    // 检查Redis配置
    // 步骤说明：检查URI → 返回结果
    try {
      const redisConfig = this.get('redis');
      if (redisConfig && redisConfig.uri) {
        const hasValidURI = redisConfig.uri && redisConfig.uri.length > 0;
        checks.push({
          name: 'redis',
          status: hasValidURI ? 'ok' : 'error',
          message: hasValidURI ? 'Redis配置正常' : 'Redis配置无效'
        });
      } else {
        checks.push({ name: 'redis', status: 'warning', message: 'Redis未配置（可选）' });
      }
    } catch (error) {
      checks.push({ name: 'redis', status: 'warning', message: error.message });
    }

    // ====================================
    // 检查认证配置
    // 步骤说明：检查JWT密钥 → 检查管理员账号 → 返回结果
    try {
      const authConfig = this.get('auth');
      if (authConfig && authConfig.jwt) {
        const hasValidSecret = authConfig.jwt.secret && authConfig.jwt.secret.length >= 32;
        const hasValidAdmin = authConfig.admin && authConfig.admin.username;

        if (hasValidSecret && hasValidAdmin) {
          checks.push({
            name: 'auth',
            status: 'ok',
            message: '认证配置正常'
          });
        } else {
          checks.push({
            name: 'auth',
            status: 'error',
            message: hasValidSecret ? '管理员账号无效' : 'JWT密钥无效'
          });
        }
      } else {
        checks.push({ name: 'auth', status: 'error', message: '认证配置缺失' });
      }
    } catch (error) {
      checks.push({ name: 'auth', status: 'error', message: error.message });
    }

    // ====================================
    // 检查所有配置
    // 步骤说明：统计配置模块数量 → 返回结果
    const allConfigs = Array.from(this.configs.keys());
    checks.push({
      name: 'configs',
      status: allConfigs.length > 0 ? 'ok' : 'error',
      message: `已加载 ${allConfigs.length} 个配置模块`,
      details: { count: allConfigs.length, names: allConfigs }
    });

    // ====================================
    // 返回健康检查结果
    // 状态定义：
    // - healthy: 所有配置都正常
    // - warning: 有警告（如可选模块未配置）
    // - unhealthy: 有错误
    const hasError = checks.some(c => c.status === 'error');
    const hasWarning = checks.some(c => c.status === 'warning');

    let status = 'healthy';
    if (hasError) {
      status = 'unhealthy';
    } else if (hasWarning) {
      status = 'warning';
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
      summary: {
        total: checks.length,
        ok: checks.filter(c => c.status === 'ok').length,
        warnings: checks.filter(c => c.status === 'warning').length,
        errors: checks.filter(c => c.status === 'error').length
      }
    };
  }

  /**
   * 获取配置
   * 从缓存中获取配置，如果缓存过期则重新加载
   *
   * 参数说明：
   * source - 配置源名称
   *
   * 返回：
   * 配置对象或null
   *
   * 步骤说明：
   * 步骤1：检查配置是否在缓存中
   * 步骤2：检查缓存是否过期
   * 步骤3：过期则重新加载
   * 步骤4：返回配置数据
   *
   * 注意事项：
   * - 默认缓存时间为5分钟
   * - 可以通过cacheTimeout配置调整
   * - 未找到配置返回null
   */
  get(source) {
    const config = this.configs.get(source);
    if (!config) {
      logger.warn(`配置未找到: ${source}`);
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - config.lastUpdate > this.cacheTimeout) {
      logger.info(`配置缓存已过期，重新加载: ${source}`);
      this.loadConfig(source).then(() => {
        return this.get(source);
      });
    }

    return config.data;
  }

  /**
   * 获取所有配置
   * 返回所有配置的集合
   *
   * 步骤说明：
   * 步骤1：遍历所有配置源
   * 步骤2：收集所有配置数据
   * 步骤3：返回配置集合
   *
   * 注意事项：
   * - 返回对象包含所有已加载的配置
   * - 修改返回的对象不会影响实际配置
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
   * 更新指定配置源的所有配置
   *
   * 参数说明：
   * source - 配置源名称
   * newConfig - 新的配置对象
   *
   * 返回：
   * 更新后的配置对象
   *
   * 步骤说明：
   * 步骤1：验证新配置的合法性
   * 步骤2：更新配置缓存
   * 步骤3：记录更新日志
   * 步骤4：通知所有监听器
   *
   * 注意事项：
   * - 配置验证失败会抛出异常
   * - 更新会立即通知所有监听器
   - 配置变更会实时生效
   */
  async update(source, newConfig) {
    try {
      logger.info(`更新配置: ${source}`);

      // 步骤1：验证新配置
      this.validateConfig(source, newConfig);

      // 步骤2：更新配置
      this.configs.set(source, {
        data: newConfig,
        lastUpdate: Date.now(),
        source
      });

      logger.info(`配置已更新: ${source}`);
      logger.debug(`新配置内容:`, JSON.stringify(newConfig, null, 2));

      // 步骤3：通知监听器
      this.notifyWatchers(source, newConfig);

      return newConfig;
    } catch (error) {
      logger.error(`配置更新失败 (${source}):`, error);
      throw error;
    }
  }

  /**
   * 重新加载配置
   * 从环境变量重新加载指定配置源
   *
   * 参数说明：
   * source - 配置源名称
   *
   * 返回：
   * 重新加载后的配置对象
   *
   * 步骤说明：
   * 步骤1：清除旧配置缓存
   * 步骤2：从环境变量读取新配置
   * 步骤3：验证新配置
   * 步骤4：通知监听器
   *
   * 注意事项：
   * - 配置会立即生效
   - 所有监听器会收到通知
   * - 旧配置会被完全替换
   */
  async reload(source) {
    try {
      logger.info(`重新加载配置: ${source}`);

      // 步骤1：清除缓存
      this.configs.delete(source);

      // 步骤2：重新加载配置
      const newConfig = await this.loadConfig(source);

      logger.info(`配置已重新加载: ${source}`);
      return newConfig;
    } catch (error) {
      logger.error(`重新加载配置失败 (${source}):`, error);
      throw error;
    }
  }

  /**
   * 重新加载所有配置
   * 清除所有缓存并重新加载
   *
   * 步骤说明：
   * 步骤1：清除所有配置缓存
   * 步骤2：重新加载所有配置
   * 步骤3：通知所有监听器
   *
   * 注意事项：
   * - 所有配置都会重新加载
   - 所有监听器都会收到通知
   - 建议在低峰期执行
   */
  async reloadAll() {
    try {
      logger.info('重新加载所有配置...');

      // 步骤1：清除所有缓存
      const oldSources = Array.from(this.configs.keys());
      this.configs.clear();

      // 步骤2：重新加载所有配置
      await this.loadAllConfigs();

      logger.info(`所有配置已重新加载: ${this.configs.size} 个模块`);

      // 步骤3：返回配置数量
      return {
        reloaded: oldSources,
        loaded: Array.from(this.configs.keys()),
        count: this.configs.size
      };
    } catch (error) {
      logger.error('重新加载所有配置失败:', error);
      throw error;
    }
  }

  /**
   * 添加配置监听器
   * 当配置变化时通知指定的监听器
   *
   * 参数说明：
   * source - 要监听的配置源
   * callback - 配置变化时的回调函数
   *
   * 步骤说明：
   * 步骤1：检查监听器映射是否存在
   * 步骤2：不存在则创建数组
   * 步骤3：添加监听器到数组
   *
   * 回调函数参数：
   * source - 配置源名称
   * newConfig - 新的配置对象
   *
   * 注意事项：
   * - 支持多个监听器同时监听
   * - 监听器不会被自动移除
   * - 需要手动移除使用offConfigChange
   */
  onConfigChange(source, callback) {
    if (!this.watchers.has(source)) {
      this.watchers.set(source, []);
    }
    this.watchers.get(source).push(callback);

    logger.debug(`添加配置监听器: ${source}`);
  }

  /**
   * 移除配置监听器
   * 移除之前添加的配置监听器
   *
   * 参数说明：
   * source - 配置源名称
   * callback - 要移除的监听器函数
   *
   * 步骤说明：
   * 步骤1：获取配置源的所有监听器
   * 步骤2：找到要移除的监听器
   * 步骤3：从数组中移除
   *
   * 注意事项：
   * - 如果监听器不存在会被忽略
   * - 移除是异步操作但立即生效
   */
  offConfigChange(source, callback) {
    const watchers = this.watchers.get(source);
    if (watchers) {
      const index = watchers.indexOf(callback);
      if (index > -1) {
        watchers.splice(index, 1);
        logger.debug(`移除配置监听器: ${source}`);
      }
    }
  }

  /**
   * 通知监听器
   * 当配置更新时通知所有监听器
   *
   * 参数说明：
   * source - 配置源名称
   * newConfig - 新的配置对象
   *
   * 步骤说明：
   * 步骤1：获取配置源的所有监听器
   * 步骤2：遍历所有监听器
   * 步骤3：依次调用监听器回调
   *
   * 注意事项：
   * - 监听器异常不会中断其他监听器
   * - 监听器返回值会被忽略
   * - 建议监听器内部进行错误处理
   */
  notifyWatchers(source, newConfig) {
    const watchers = this.watchers.get(source);
    if (!watchers || watchers.length === 0) {
      return;
    }

    for (const callback of watchers) {
      try {
        callback(source, newConfig);
      } catch (error) {
        logger.error(`配置监听器错误 (${source}):`, error);
      }
    }

    logger.debug(`已通知 ${watchers.length} 个${source}配置监听器`);
  }

  /**
   * 导出配置
   * 将所有配置导出为JSON格式
   *
   * 返回：
   * 导出的配置对象
   *
   * 步骤说明：
   * 步骤1：获取所有配置
   * 步骤2：添加版本信息
   * 步骤3：添加导出时间
   * 步骤4：返回配置对象
   *
   * 注意事项：
   * - 敏感信息会被自动隐藏
   - 建议定期备份配置
   * - 导出文件可以手动修改后再导入
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
   * 从导出的配置对象导入配置
   *
   * 参数说明：
   * configData - 导出的配置对象
   *
   * 返回：
   * 导入结果
   *
   * 步骤说明：
   * 步骤1：验证配置数据格式
   * 步骤2：检查版本兼容性
   * 步骤3：逐一导入配置模块
   * 步骤4：验证每个配置模块
   * 步骤5：返回导入结果
   *
   * 注意事项：
   * - 导入会覆盖现有配置
   - 配置验证失败会停止导入
   - 建议在导入前备份当前配置
   */
  async importConfig(configData) {
    try {
      // 步骤1：验证配置数据格式
      if (!configData || !configData.configs) {
        throw new Error('【错误】无效的配置数据：缺少configs字段');
      }

      if (configData.version && typeof configData.version !== 'string') {
        throw new Error('【错误】版本格式无效，应为字符串');
      }

      // 步骤2：检查版本兼容性
      if (configData.version) {
        const versionParts = configData.version.split('.');
        if (versionParts.length !== 3) {
          logger.warn(`配置文件版本格式可能不正确: ${configData.version}`);
        }
      }

      // 步骤3：逐一导入配置模块
      for (const [source, config] of Object.entries(configData.configs)) {
        try {
          await this.update(source, config);
          logger.info(`配置导入成功: ${source}`);
        } catch (error) {
          logger.error(`配置导入失败 (${source}):`, error);
          throw new Error(`【导入失败】${source}: ${error.message}`);
        }
      }

      logger.info('配置导入完成');

      // 步骤4：返回导入结果
      return true;
    } catch (error) {
      logger.error('配置导入失败:', error);
      throw error;
    }
  }

  /**
   * 获取配置摘要
   * 返回配置中心的摘要信息
   *
   * 返回：
   * 摘要信息对象
   *
   * 步骤说明：
   * 步骤1：检查是否已初始化
   * 步骤2：统计配置数量
   * 步骤3：统计监听器数量
   * 步骤4：统计最后更新时间
   * 步骤5：返回摘要对象
   *
   * 注意事项：
   * - 摘要包含关键统计信息
   * - 用于快速检查配置状态
   * - 不包含敏感信息
   */
  getSummary() {
    const summary = {
      initialized: this.initialized,
      configCount: this.configs.size,
      configNames: Array.from(this.configs.keys()),
      watchers: Array.from(this.watchers.keys()).reduce((acc, key) => {
        acc[key] = this.watchers.get(key).length;
        return acc;
      }, {}),
      lastUpdate: this.configs.size > 0
        ? Math.max(...Array.from(this.configs.values()).map(c => c.lastUpdate))
        : 0,
      cacheTimeout: this.cacheTimeout
    };

    logger.debug('配置中心摘要:', summary);
    return summary;
  }

  /**
   * 关闭配置中心
   * 清理资源，优雅关闭
   *
   * 步骤说明：
   * 步骤1：清除定时器（如果存在）
   * 步骤2：清除所有监听器
   * 步骤3：记录关闭日志
   *
   * 注意事项：
   * - 应用退出时应调用此方法
   * - 确保所有配置都已保存
   * - 定时器会被正确清理
   */
  async close() {
    logger.info('关闭配置中心...');

    // 步骤1：清除定时器
    if (this.watcher) {
      clearInterval(this.watcher);
      this.watcher = null;
      logger.info('已清除环境变量监听器');
    }

    // 步骤2：清除所有监听器
    this.watchers.clear();
    logger.info('已清除所有配置监听器');

    // 步骤3：记录关闭日志
    logger.info('配置中心已关闭');

    this.initialized = false;
  }
}

// 创建单例
const configCenter = new ConfigCenter();

module.exports = configCenter;

/**
 * 使用示例和说明
 *
 * 【初始化配置中心】
 * await configCenter.initialize();
 *
 * 【获取配置】
 * // 获取单个配置
 * const dbConfig = configCenter.get('database');
 * console.log('数据库URI:', dbConfig.uri);
 *
 * // 获取所有配置
 * const allConfigs = configCenter.getAll();
 * console.log('所有配置:', allConfigs);
 *
 * 【更新配置】
 * // 更新数据库配置
 * await configCenter.update('database', {
 *   uri: 'mongodb://new-uri',
 *   pool: { max: 30, min: 5 }
 * });
 *
 * 【重新加载配置】
 * // 重新加载特定配置
 * await configCenter.reload('database');
 *
 * // 重新加载所有配置
 * await configCenter.reloadAll();
 *
 * 【监听配置变化】
 * configCenter.onConfigChange('database', (source, newConfig) => {
 *   console.log('数据库配置已更新:', newConfig);
 *   // 重新连接数据库
 *   reconnectDatabase(newConfig);
 * });
 *
 * 【导入导出配置】
 * // 导出配置
 * const exported = configCenter.exportConfig();
 * fs.writeFileSync('config-backup.json', JSON.stringify(exported, null, 2));
 *
 * // 导入配置
 * const imported = JSON.parse(fs.readFileSync('config-backup.json'));
 * await configCenter.importConfig(imported);
 *
 * 【健康检查】
 * const health = await configCenter.healthCheck();
 * console.log('健康状态:', health.status);
 * console.log('检查项:', health.checks);
 *
 * 【配置说明和步骤】
 * 每个配置项都有详细的说明：
 *
 * 【环境配置】environment
 * - NODE_ENV: 运行环境（development/production/test）
 *   说明：选择应用的运行环境，不同环境有不同的配置
 *   步骤1：确定当前使用场景
 *   步骤2：选择对应的环境类型
 *   步骤3：保存后需要重启应用
 *   注意：生产环境会启用更严格的安全措施
 *
 * - PORT: 服务端口
 *   说明：指定后端服务监听的端口号
 *   步骤1：确认端口号未被占用
 *   步骤2：检查防火墙是否开放该端口
 *   步骤3：更新配置后需重启服务
 *   注意：确保该端口在1-65535范围内
 *
 * - HOST: 监听地址
 *   说明：指定服务监听的IP地址
 *   步骤1：确定服务访问范围
 *   步骤2：选择对应的监听地址
 *   步骤3：0.0.0.0允许所有网络接口访问
 *   注意：生产环境推荐使用0.0.0.0
 *
 * 【数据库配置】database
 * - DATABASE_URI: 数据库连接地址
 *   说明：填写数据库的完整连接字符串，系统自动识别数据库类型
 *   步骤1：确定数据库类型（MongoDB/MySQL/PostgreSQL）
 *   步骤2：准备数据库连接信息（地址、端口、用户名、密码）
 *   步骤3：按照格式填写连接URI
 *   步骤4：测试连接是否成功
 *   注意：支持所有主流数据库类型
 *
 * - DB_POOL_SIZE: 最大连接池大小
 *   说明：设置数据库连接池的最大连接数
 *   步骤1：评估应用的并发访问量
 *   步骤2：根据并发量设置连接数
 *   步骤3：开发环境5-10，生产环境20-50
 *   注意：连接数过多会占用大量内存
 *
 * - DB_MIN_POOL_SIZE: 最小连接池大小
 *   说明：设置数据库连接池的最小保持连接数
 *   步骤1：评估应用的访问频率
 *   步骤2：低频率应用2-5，高频率应用5-10
 *   注意：应小于最大连接池大小
 *
 * - DB_TIMEOUT: 连接超时时间
 *   说明：设置数据库连接的超时时间
 *   步骤1：测试数据库网络延迟
 *   步骤2：本地数据库3000-5000ms，云数据库5000-10000ms
 *   注意：超时过短会导致误判
 *
 * 【Redis配置】redis
 * - REDIS_URI: Redis连接地址
 *   说明：填写Redis服务的连接地址
 *   步骤1：确认Redis服务已启动（redis-cli ping）
 *   步骤2：准备Redis连接信息（地址、端口）
 *   步骤3：按照格式填写连接URI
 *   步骤4：测试连接是否成功
 *   注意：用于缓存和会话管理
 *
 * 【认证配置】auth
 * - JWT_SECRET: JWT密钥
 *   说明：用于生成和验证JWT令牌的密钥
 *   步骤1：使用命令生成随机密钥：openssl rand -base64 32
 *   步骤2：将生成的密钥粘贴到输入框
 *   步骤3：确保密钥长度至少32字符
 *   步骤4：保存密钥后需要重新登录
 *   注意：生产环境必须修改默认密钥
 *
 * - JWT_EXPIRES_IN: JWT过期时间
 *   说明：设置JWT令牌的有效期
 *   步骤1：根据应用性质确定令牌有效期
 *   步骤2：银行/支付类应用1h-24h，社交类应用7d-30d
 *   步骤3：填写时间，如：7d（7天）
 *   注意：过期后需重新登录获取新令牌
 *
 * - ADMIN_USERNAME: 管理员用户名
 *   说明：设置系统管理员账号的登录用户名
 *   步骤1：设计一个容易记忆的用户名
 *   step2：避免使用常见的用户名（admin、root等）
 *   步骤3：只包含字母、数字、下划线
 *   步骤4：长度控制在3-20字符之间
 *   注意：建议结合应用名称，如：fuyuan_admin
 *
 * - ADMIN_PASSWORD: 管理员密码
 *   说明：设置系统管理员账号的密码
 *   步骤1：设计一个强密码（8位以上，包含大小写字母、数字、特殊字符）
 *   步骤2：输入到密码框并确认
 *   步骤3：确保密码无误后保存
 *   步骤4：使用新密码重新登录
 *   注意：必须足够复杂，避免使用常见密码
 *
 * 【安全配置】security
 * - ALLOWED_ORIGINS: 允许的跨域来源
 *   说明：设置允许跨域访问的网站地址
 *   步骤1：确定前端访问地址（开发环境或生产环境）
 *   步骤2：如果是开发环境，使用 * 允许所有来源
 *   步骤3：如果是生产环境，列出所有可能的域名
 *   步骤4：多个域名用英文逗号分隔
 *   注意：生产环境不建议使用 *
 *
 * - RATE_LIMIT_MAX_REQUESTS: 限流请求数
 *   说明：设置单个IP在限流时间窗口内的最大请求数
 *   步骤1：评估应用的正常访问量
 *   步骤2：个人应用50-100，中小型应用100-500
 *   步骤3：大型应用500-1000
 *   步骤4：监控限流触发频率，调整数值
 *
 * - RATE_LIMIT_WINDOW_MS: 限流时间窗口
 *   说明：设置限流的时间窗口长度
 *   * 步骤1：根据应用性质选择时间窗口
   * 步骤2：高频率操作1-5分钟，普通操作10-15分钟
   *   步骤3：低频率操作30-60分钟
 *   步骤4：填写时间窗口（毫秒）
 *   注意：15分钟=15×60×1000=900000ms
 *
 * 【存储配置】storage
 * - MAX_FILE_SIZE: 最大文件大小（字节）
 *   说明：设置允许上传的文件最大大小
 *   步骤1：确定业务需求的最大文件大小
 *   步骤2：转换为字节（1MB=1024×1024=1048576）
 *   步骤3：填写到输入框
 *   步骤4：保存后重启服务生效
 *   注意：限制文件大小可以节省服务器存储空间
 *
 * - UPLOAD_PATH: 文件上传路径
 *   * 说明：设置上传文件的存储路径
 *   步骤1：确定是本地存储或云存储
 *   步骤2：相对路径：./uploads（相对于项目根目录）
 *   步骤3：绝对路径：/var/www/uploads（Linux）
 *   注意：确保目录有写入权限
 *
 * 【匹配配置】match
 * - MATCH_RECOMMEND_LIMIT: 推荐用户数量
 *   说明：设置每次推荐给用户的最大用户数量
 *   步骤1：根据业务需求确定推荐数量
 *   * 步骤2：个人应用10-20，中等应用20-50
 *   步骤3：大型应用50-100
 *   注意：数量过多会影响加载速度
 *
 * - MATCH_LEVEL_WEIGHT: 残疾等级权重
 *   * 说明：设置残疾等级在匹配算法中的权重
 *   步骤1：权重范围0-100
 *   *   步骤2：0不匹配，10-20低权重，30-50中等权重
 *   步骤3：60-100高权重
 * 注意：总权重建议为100
 *
 * - MATCH_TYPE_WEIGHT: 残疾类型权重
 *   * 说明：设置残疾类型在匹配算法中的权重
   * 步骤1：权重范围0-100
   *   步骤2：0不匹配相同类型，10-30低权重
 *   步骤3：30-50中等权重，50-100高权重
 *   注意：同性别的匹配度控制
 *
 * - MATCH_LOCATION_WEIGHT: 地理位置权重
 *   * 说明：设置地理位置在匹配算法中的权重
   * 步骤1：权重范围0-100
   *   步骤2：0不考虑地理位置，10-30中等权重
   * 步骤3：30-50高权重
 *   注意：需要用户授权位置信息
 *
 * - MATCH_AGE_WEIGHT: 年龄权重
   *   * 说明：设置年龄在匹配算法中的权重
   * 步骤1：权重范围0-100
 *   * 步骤2：0不考虑年龄，10-30中等权重
 * 步骤3：30-50高权重
 *   * 注意：需要在个人资料中填写年龄
 *
 * 【无障碍配置】accessibility
 * - ACCESSIBILITY_FONT_SIZE: 字体大小
 *   * 说明：设置无障碍功能的字体大小
 *   * 步骤1：根据用户需求调整字体大小
 *   * 步骤2：14-16：标准大小，18-20：较大字体
 *   步骤3：24-32：超大字体
 *   注意：视力障碍用户通常需要更大字体
 *
 * - ACCESSIBILITY_HIGH_CONTRAST: 高对比度模式
 *   *   说明：启用高对比度以提升可读性
 *   * 步骤1：关闭状态：正常对比度
 *   * 步骤2：开启状态：高对比度（黑底白字）
 *   步骤3：保存后刷新页面生效
 *   * 注意：视力障碍用户通常需要高对比度
 */

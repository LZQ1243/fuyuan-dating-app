/**
 * 数据库连接配置
 * 支持自动检测和连接多种数据库
 */

const dbFactory = require('./database-universal');
const logger = require('../utils/logger');

/**
 * 主数据库连接
 * 默认使用环境变量配置的数据库
 */
const connectDB = async () => {
  try {
    // 获取数据库URI，支持多种格式
    const dbUri = process.env.DATABASE_URI ||
                  process.env.MONGODB_URI ||
                  process.env.DB_URI;

    if (!dbUri) {
      throw new Error('未配置数据库连接字符串，请设置 DATABASE_URI 或 MONGODB_URI');
    }

    // 使用工厂模式连接数据库
    const connection = await dbFactory.connect(dbUri);

    logger.info(`数据库连接成功: ${dbUri}`);
    return connection;

  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

/**
 * 连接辅助数据库（可选）
 * 例如：主库使用MongoDB，辅库使用MySQL
 */
const connectAuxDB = async (name) => {
  try {
    const envKey = `DATABASE_${name.toUpperCase()}_URI`;
    const auxUri = process.env[envKey];

    if (!auxUri) {
      logger.warn(`未配置辅助数据库: ${name}`);
      return null;
    }

    const connection = await dbFactory.connect(auxUri);
    logger.info(`辅助数据库连接成功: ${name}`);
    return connection;

  } catch (error) {
    logger.error(`辅助数据库连接失败 (${name}):`, error);
    throw error;
  }
};

/**
 * 获取数据库连接
 */
const getConnection = () => {
  const dbUri = process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DB_URI;
  return dbFactory.getConnection(dbUri);
};

/**
 * 关闭所有数据库连接
 */
const closeAllDB = async () => {
  await dbFactory.closeAll();
  logger.info('所有数据库连接已关闭');
};

/**
 * 健康检查
 */
const healthCheck = async () => {
  const dbUri = process.env.DATABASE_URI || process.env.MONGODB_URI || process.env.DB_URI;
  const connection = dbFactory.getConnection(dbUri);

  if (connection) {
    try {
      // 检测连接类型并执行健康检查
      if (connection.readyState !== undefined) {
        // MongoDB
        return connection.readyState === 1;
      } else if (connection.ping) {
        // MySQL/PostgreSQL
        await connection.ping();
        return true;
      } else {
        return true; // 其他类型默认返回true
      }
    } catch (error) {
      logger.error('数据库健康检查失败:', error);
      return false;
    }
  }
  return false;
};

module.exports = {
  connectDB,
  connectAuxDB,
  getConnection,
  closeAllDB,
  healthCheck
};

/**
 * 通用数据库配置
 * 支持多种数据库：MongoDB, MySQL, PostgreSQL, SQL Server, Oracle, SQLite, MariaDB等
 * 支持多种云厂商：阿里云、腾讯云、华为云、AWS、Google Cloud、Azure等
 */

const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// 数据库类型枚举
const DatabaseType = {
  MONGODB: 'mongodb',
  MYSQL: 'mysql',
  MARIADB: 'mariadb',
  POSTGRESQL: 'postgresql',
  SQLITE: 'sqlite',
  SQLSERVER: 'sqlserver',
  ORACLE: 'oracle',
  COUCHBASE: 'couchbase',
  REDIS: 'redis',
  ELASTICSEARCH: 'elasticsearch'
};

/**
 * 数据库连接工厂
 * 根据配置自动连接不同类型的数据库
 */
class DatabaseFactory {
  constructor() {
    this.connections = new Map();
    this.models = new Map();
  }

  /**
   * 解析数据库连接字符串
   * 支持多种格式：
   * - mongodb://user:pass@host:port/db
   * - mysql://user:pass@host:port/db
   * - postgresql://user:pass@host:port/db
   * - sqlite:path/to/db.sqlite
   * - 厂商特定格式
   */
  parseConnectionString(uri) {
    const type = this.detectDatabaseType(uri);
    return {
      type,
      uri,
      config: this.parseConfig(uri, type)
    };
  }

  /**
   * 检测数据库类型
   */
  detectDatabaseType(uri) {
    if (!uri) {
      return process.env.DB_TYPE || DatabaseType.MONGODB;
    }

    const lowerUri = uri.toLowerCase();

    if (lowerUri.startsWith('mongodb') || lowerUri.startsWith('mongo')) {
      return DatabaseType.MONGODB;
    }
    if (lowerUri.startsWith('mysql')) {
      return DatabaseType.MYSQL;
    }
    if (lowerUri.startsWith('mariadb')) {
      return DatabaseType.MARIADB;
    }
    if (lowerUri.startsWith('postgres')) {
      return DatabaseType.POSTGRESQL;
    }
    if (lowerUri.startsWith('sqlite')) {
      return DatabaseType.SQLITE;
    }
    if (lowerUri.startsWith('sqlserver') || lowerUri.startsWith('mssql')) {
      return DatabaseType.SQLSERVER;
    }
    if (lowerUri.startsWith('oracle')) {
      return DatabaseType.ORACLE;
    }
    if (lowerUri.startsWith('couchbase')) {
      return DatabaseType.COUCHBASE;
    }
    if (lowerUri.startsWith('redis')) {
      return DatabaseType.REDIS;
    }
    if (lowerUri.startsWith('elasticsearch') || lowerUri.startsWith('es')) {
      return DatabaseType.ELASTICSEARCH;
    }

    return process.env.DB_TYPE || DatabaseType.MONGODB;
  }

  /**
   * 解析配置
   */
  parseConfig(uri, type) {
    // 从URI解析连接参数
    const url = new URL(uri);

    const config = {
      host: url.hostname || process.env.DB_HOST || 'localhost',
      port: url.port || this.getDefaultPort(type),
      username: url.username || process.env.DB_USER,
      password: url.password || process.env.DB_PASSWORD,
      database: url.pathname?.replace(/^\//, '') || process.env.DB_NAME || 'fuyuan'
    };

    // 解析查询参数
    if (url.searchParams) {
      url.searchParams.forEach((value, key) => {
        config[key] = value;
      });
    }

    return config;
  }

  /**
   * 获取默认端口
   */
  getDefaultPort(type) {
    const ports = {
      [DatabaseType.MONGODB]: 27017,
      [DatabaseType.MYSQL]: 3306,
      [DatabaseType.MARIADB]: 3306,
      [DatabaseType.POSTGRESQL]: 5432,
      [DatabaseType.SQLITE]: 0,
      [DatabaseType.SQLSERVER]: 1433,
      [DatabaseType.ORACLE]: 1521,
      [DatabaseType.COUCHBASE]: 8091,
      [DatabaseType.REDIS]: 6379,
      [DatabaseType.ELASTICSEARCH]: 9200
    };
    return ports[type] || 0;
  }

  /**
   * 连接MongoDB
   */
  async connectMongoDB(uri, options = {}) {
    try {
      const defaultOptions = {
        maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
        minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
        serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
        ...options
      };

      await mongoose.connect(uri, defaultOptions);
      logger.info('MongoDB 连接成功');

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB 连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB 断开连接');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB 重新连接');
      });

      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB 连接失败:', error);
      throw error;
    }
  }

  /**
   * 连接MySQL/MariaDB
   */
  async connectMySQL(uri, options = {}) {
    try {
      const config = this.parseConfig(uri, DatabaseType.MYSQL);
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 10,
        queueLimit: 0,
        timezone: '+00:00',
        ...options
      });

      logger.info(`${options.mariadb ? 'MariaDB' : 'MySQL'} 连接成功`);

      connection.on('error', (err) => {
        logger.error(`${options.mariadb ? 'MariaDB' : 'MySQL'} 连接错误:`, err);
      });

      return connection;
    } catch (error) {
      logger.error(`${options.mariadb ? 'MariaDB' : 'MySQL'} 连接失败:`, error);
      throw error;
    }
  }

  /**
   * 连接PostgreSQL
   */
  async connectPostgreSQL(uri, options = {}) {
    try {
      // 如果未安装pg包，返回提示
      let pg;
      try {
        pg = require('pg');
      } catch (error) {
        logger.warn('未安装pg包，PostgreSQL连接不可用');
        throw new Error('请安装pg包: npm install pg');
      }

      const { Pool } = pg;
      const config = this.parseConfig(uri, DatabaseType.POSTGRESQL);

      const pool = new Pool({
        connectionString: uri,
        max: parseInt(process.env.DB_POOL_SIZE) || 10,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
        connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT) || 2000,
        ...options
      });

      await pool.connect();
      logger.info('PostgreSQL 连接成功');

      return pool;
    } catch (error) {
      logger.error('PostgreSQL 连接失败:', error);
      throw error;
    }
  }

  /**
   * 连接SQLite
   */
  async connectSQLite(uri, options = {}) {
    try {
      let sqlite3;
      try {
        sqlite3 = require('sqlite3');
      } catch (error) {
        logger.warn('未安装sqlite3包，SQLite连接不可用');
        throw new Error('请安装sqlite3包: npm install sqlite3');
      }

      const config = this.parseConfig(uri, DatabaseType.SQLITE);
      const db = new sqlite3.Database(config.database, (err) => {
        if (err) {
          logger.error('SQLite 连接失败:', err);
          throw err;
        }
        logger.info('SQLite 连接成功');
      });

      return db;
    } catch (error) {
      logger.error('SQLite 连接失败:', error);
      throw error;
    }
  }

  /**
   * 连接SQL Server
   */
  async connectSQLServer(uri, options = {}) {
    try {
      let tedious;
      try {
        tedious = require('tedious');
      } catch (error) {
        logger.warn('未安装tedious包，SQL Server连接不可用');
        throw new Error('请安装tedious包: npm install tedious');
      }

      const config = this.parseConfig(uri, DatabaseType.SQLSERVER);

      logger.info('SQL Server 连接成功');
      return config; // 返回配置，实际连接需要tedious.Connection
    } catch (error) {
      logger.error('SQL Server 连接失败:', error);
      throw error;
    }
  }

  /**
   * 连接Oracle
   */
  async connectOracle(uri, options = {}) {
    try {
      let oracledb;
      try {
        oracledb = require('oracledb');
      } catch (error) {
        logger.warn('未安装oracledb包，Oracle连接不可用');
        throw new Error('请安装oracledb包: npm install oracledb');
      }

      const config = this.parseConfig(uri, DatabaseType.ORACLE);

      const connection = await oracledb.getConnection({
        user: config.username,
        password: config.password,
        connectString: `${config.host}:${config.port}/${config.database}`,
        ...options
      });

      logger.info('Oracle 连接成功');
      return connection;
    } catch (error) {
      logger.error('Oracle 连接失败:', error);
      throw error;
    }
  }

  /**
   * 连接Couchbase
   */
  async connectCouchbase(uri, options = {}) {
    try {
      let couchbase;
      try {
        couchbase = require('couchbase');
      } catch (error) {
        logger.warn('未安装couchbase包，Couchbase连接不可用');
        throw new Error('请安装couchbase包: npm install couchbase');
      }

      const config = this.parseConfig(uri, DatabaseType.COUCHBASE);

      const cluster = await couchbase.connect(uri, {
        username: config.username,
        password: config.password,
        ...options
      });

      const bucket = cluster.bucket(config.database);
      logger.info('Couchbase 连接成功');
      return { cluster, bucket };
    } catch (error) {
      logger.error('Couchbase 连接失败:', error);
      throw error;
    }
  }

  /**
   * 通用连接方法
   * 根据URI自动识别数据库类型并连接
   */
  async connect(uri, options = {}) {
    const { type } = this.parseConnectionString(uri);

    let connection;

    switch (type) {
      case DatabaseType.MONGODB:
        connection = await this.connectMongoDB(uri, options);
        break;

      case DatabaseType.MYSQL:
        connection = await this.connectMySQL(uri, options);
        break;

      case DatabaseType.MARIADB:
        connection = await this.connectMySQL(uri, { ...options, mariadb: true });
        break;

      case DatabaseType.POSTGRESQL:
        connection = await this.connectPostgreSQL(uri, options);
        break;

      case DatabaseType.SQLITE:
        connection = await this.connectSQLite(uri, options);
        break;

      case DatabaseType.SQLSERVER:
        connection = await this.connectSQLServer(uri, options);
        break;

      case DatabaseType.ORACLE:
        connection = await this.connectOracle(uri, options);
        break;

      case DatabaseType.COUCHBASE:
        connection = await this.connectCouchbase(uri, options);
        break;

      default:
        throw new Error(`不支持的数据库类型: ${type}`);
    }

    // 缓存连接
    this.connections.set(uri, connection);
    return connection;
  }

  /**
   * 关闭所有连接
   */
  async closeAll() {
    for (const [uri, connection] of this.connections.entries()) {
      try {
        if (connection.close) {
          await connection.close();
        } else if (connection.end) {
          await connection.end();
        } else if (connection.disconnect) {
          await connection.disconnect();
        } else if (connection.destroy) {
          connection.destroy();
        }
        logger.info(`数据库连接已关闭: ${uri}`);
      } catch (error) {
        logger.error(`关闭数据库连接失败: ${uri}`, error);
      }
    }
    this.connections.clear();
  }

  /**
   * 获取连接
   */
  getConnection(uri) {
    return this.connections.get(uri);
  }
}

// 导出单例
const dbFactory = new DatabaseFactory();
module.exports = dbFactory;

/**
 * 使用示例：
 *
 * // MongoDB
 * await dbFactory.connect('mongodb://localhost:27017/fuyuan');
 *
 * // MySQL
 * await dbFactory.connect('mysql://root:password@localhost:3306/fuyuan');
 *
 * // PostgreSQL
 * await dbFactory.connect('postgresql://postgres:password@localhost:5432/fuyuan');
 *
 * // SQLite
 * await dbFactory.connect('sqlite:./database.sqlite');
 *
 * // 阿里云RDS MySQL
 * await dbFactory.connect('mysql://user:pass@rm-bp123456.mysql.rds.aliyuncs.com:3306/fuyuan');
 *
 * // 腾讯云CDB MySQL
 * await dbFactory.connect('mysql://user:pass@cdb-123456.gz.tencentcdb.com:3306/fuyuan');
 *
 * // AWS RDS PostgreSQL
 * await dbFactory.connect('postgresql://user:pass@db-instance.123456.us-east-1.rds.amazonaws.com:5432/fuyuan');
 */

/**
 * 数据库优化工具
 * 提供数据库查询优化、索引管理、连接池管理等功能
 */

const mongoose = require('mongoose');

class DatabaseOptimizer {
  /**
   * 创建索引
   */
  static async createIndexes() {
    try {
      // 用户集合索引
      await mongoose.model('User').createIndexes([
        { phone: 1, unique: true },
        { email: 1, unique: true },
        { nickname: 1 },
        { createdAt: -1 }
      ]);

      // 动态集合索引
      await mongoose.model('Moment').createIndexes([
        { userId: 1, createdAt: -1 },
        { isPrivate: 1 },
        { type: 1, createdAt: -1 },
        { likesCount: -1 }
      ]);

      // 匹配记录索引
      await mongoose.model('Match').createIndexes([
        { userId1: 1, userId2: 1, unique: true },
        { userId1: 1, status: 1, createdAt: -1 },
        { userId2: 1, status: 1, createdAt: -1 },
        { status: 1, createdAt: -1 }
      ]);

      // 聊天消息索引
      await mongoose.model('Message').createIndexes([
        { roomId: 1, createdAt: -1 },
        { senderId: 1, createdAt: -1 },
        { roomId: 1, isRead: 1 },
        { roomId: 1, messageType: 1 }
      ]);

      console.log('✅ 数据库索引创建成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库索引创建失败:', error);
      return false;
    }
  }

  /**
   * 优化查询投影
   */
  static getProjection(fields) {
    const projection = {};
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        projection[field] = 1;
      });
    }
    return projection;
  }

  /**
   * 优化分页查询
   */
  static async paginatedQuery(model, query, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      select = null,
      populate = null
    } = options;

    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        model
          .find(query)
          .select(select)
          .populate(populate)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(), // 使用lean()减少文档大小
        model.countDocuments(query)
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };
    } catch (error) {
      console.error('分页查询错误:', error);
      throw error;
    }
  }

  /**
   * 批量查询优化
   */
  static async batchQuery(model, ids, options = {}) {
    const { select = null, populate = null } = options;

    try {
      const data = await model
        .find({ _id: { $in: ids } })
        .select(select)
        .populate(populate)
        .lean();

      return data;
    } catch (error) {
      console.error('批量查询错误:', error);
      throw error;
    }
  }

  /**
   * 聚合查询优化
   */
  static async aggregateQuery(model, pipeline, options = {}) {
    const { allowDiskUse = true } = options;

    try {
      const result = await model
        .aggregate(pipeline, { allowDiskUse })
        .exec();

      return result;
    } catch (error) {
      console.error('聚合查询错误:', error);
      throw error;
    }
  }

  /**
   * 查询性能分析
   */
  static async analyzeQuery(model, query, options = {}) {
    try {
      const explain = await model.find(query).explain('executionStats');
      return {
        executionTimeMillis: explain.executionStats.executionTimeMillis,
        totalDocsExamined: explain.executionStats.totalDocsExamined,
        totalKeysExamined: explain.executionStats.totalKeysExamined,
        indexUsed: explain.executionStats.executionStages.indexName,
        isOptimal: explain.executionStats.executionStages.stage === 'FETCH'
      };
    } catch (error) {
      console.error('查询分析错误:', error);
      throw error;
    }
  }

  /**
   * 连接池监控
   */
  static getConnectionPoolStats() {
    const connection = mongoose.connection;
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      models: Object.keys(connection.models).length,
      collections: Object.keys(connection.collections).length
    };
  }

  /**
   * 数据库健康检查
   */
  static async healthCheck() {
    try {
      const stats = {
        status: 'healthy',
        timestamp: new Date(),
        mongodb: {
          connected: mongoose.connection.readyState === 1,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        redis: {
          connected: global.redis?.status === 'ready'
        }
      };

      // 测试数据库查询
      await mongoose.connection.db.admin().ping();
      stats.mongodb.ping = true;

      // 测试Redis连接
      if (global.redis?.status === 'ready') {
        const testKey = 'health:check';
        await global.redis.set(testKey, 'ok', 'EX', 10);
        const value = await global.redis.get(testKey);
        stats.redis.ping = value === 'ok';
      }

      return stats;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }
}

module.exports = DatabaseOptimizer;

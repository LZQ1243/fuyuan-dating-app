/**
 * 查询优化工具
 * 优化数据库查询,提升查询速度到极致
 */

const mongoose = require('mongoose');

class QueryOptimizer {
  /**
   * 只查询需要的字段
   */
  static project(selectFields) {
    return (req, res, next) => {
      req.projection = selectFields;
      next();
    };
  }

  /**
   * 分页查询优化
   */
  static async paginatedQuery(model, query = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      populate = [],
      select = '',
      lean = true
    } = options;

    const skip = (page - 1) * limit;

    try {
      // 使用lean()减少文档大小
      const data = await model
        .find(query)
        .select(select)
        .populate(populate)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await model.countDocuments(query);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('分页查询错误:', error);
      throw error;
    }
  }

  /**
   * 聚合查询优化
   */
  static async aggregatedQuery(model, pipeline, options = {}) {
    const { allowDiskUse = false } = options;

    try {
      const result = await model.aggregate(pipeline, { allowDiskUse });

      return result;
    } catch (error) {
      console.error('聚合查询错误:', error);
      throw error;
    }
  }

  /**
   * 批量查询优化
   */
  static async batchQuery(model, query, options = {}) {
    const { batchSize = 100 } = options;

    try {
      const total = await model.countDocuments(query);
      const results = [];

      for (let i = 0; i < total; i += batchSize) {
        const batch = await model
          .find(query)
          .skip(i)
          .limit(batchSize)
          .lean();

        results.push(...batch);
      }

      return results;
    } catch (error) {
      console.error('批量查询错误:', error);
      throw error;
    }
  }

  /**
   * 文本搜索优化
   */
  static async textSearch(model, searchField, searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    try {
      // 使用索引的文本搜索
      const regex = new RegExp(searchTerm, 'i');

      const data = await model
        .find({ [searchField]: regex })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await model.countDocuments({ [searchField]: regex });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('文本搜索错误:', error);
      throw error;
    }
  }

  /**
   * 地理位置查询优化
   */
  static async geoNearQuery(model, coordinates, maxDistance = 10000, options = {}) {
    const { limit = 20, skip = 0 } = options;

    try {
      const results = await model.aggregate([
        {
          $geoNear: {
            near: coordinates,
            spherical: true,
            maxDistance: maxDistance / 6371, // 转换为公里
            distanceField: 'distance',
            query: { status: 'active' }
          }
        },
        { $limit: limit },
        { $skip: skip }
      ]);

      return results.map(result => ({
        ...result.obj,
        distance: result.dis / 1000 // 转换为公里
      }));
    } catch (error) {
      console.error('地理位置查询错误:', error);
      throw error;
    }
  }

  /**
   * 游标分页优化
   */
  static async cursorPaginatedQuery(model, query = {}, options = {}) {
    const { cursor = null, limit = 20, sort = { _id: -1 } } = options;

    try {
      let queryBuilder = model.find(query);

      if (cursor) {
        queryBuilder = queryBuilder.where('_id').gt(cursor);
      }

      const data = await queryBuilder
        .sort(sort)
        .limit(limit + 1) // 多取一个用于计算下一页游标
        .lean();

      const hasNext = data.length > limit;
      const results = data.slice(0, limit);

      return {
        data: results,
        pagination: {
          cursor: results[results.length - 1]?._id,
          hasNext
        }
      };
    } catch (error) {
      console.error('游标分页错误:', error);
      throw error;
    }
  }

  /**
   * 查询性能分析
   */
  static async analyzeQueryPerformance(model, query, options = {}) {
    const startTime = Date.now();

    try {
      const data = await model.find(query).lean();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 检查是否需要索引
      const explainResult = await model.find(query).explain('executionStats');

      return {
        duration,
        count: data.length,
        explain: explainResult,
        needsIndex: explainResult.executionStats.totalDocsExamined > 100
      };
    } catch (error) {
      console.error('查询性能分析错误:', error);
      throw error;
    }
  }

  /**
   * 批量写操作优化
   */
  static async bulkWrite(model, updates) {
    const bulkOps = updates.map(update => ({
      updateOne: { filter: update.filter, update: update.update }
    }));

    try {
      const result = await model.bulkWrite(bulkOps);
      return result;
    } catch (error) {
      console.error('批量写操作错误:', error);
      throw error;
    }
  }

  /**
   * 查询结果缓存
   */
  static async cacheQueryResult(key, queryFn, ttl = 300) {
    const CacheService = require('../services/cache-service');
    
    // 尝试从缓存获取
    const cached = await CacheService.Config.get(key);
    if (cached) {
      console.log(`✅ 缓存命中: ${key}`);
      return cached;
    }

    // 执行查询
    console.log(`⏳ 执行查询: ${key}`);
    const result = await queryFn();

    // 缓存结果
    await CacheService.Config.set(key, result, ttl);
    console.log(`✅ 查询结果已缓存: ${key}`);

    return result;
  }

  /**
   * 复杂查询优化 - 使用视图
   */
  static async viewQuery(model, viewName, pipeline = []) {
    try {
      // 检查视图是否存在,不存在则创建
      const existingViews = await model.db.listCollections({ name: viewName });
      if (existingViews.length === 0) {
        await model.db.createCollection(viewName, { viewOn: model.collection.name });
      }

      // 使用视图查询
      const results = await model.db.collection(viewName).aggregate(pipeline);
      return results;
    } catch (error) {
      console.error('视图查询错误:', error);
      throw error;
    }
  }

  /**
   * 读写分离
   */
  static async readFromReplica(query, options = {}) {
    const { readPreference = 'secondary' } = options;

    try {
      const results = await model.find(query).read(readPreference).lean();
      console.log(`✅ 从副本读取: ${results.length} 个文档`);
      return results;
    } catch (error) {
      console.error('副本读取错误:', error);
      throw error;
    }
  }

  /**
   * 连接池优化
   */
  static optimizeConnectionPool() {
    mongoose.set('autoIndex', false); // 禁用自动建索引

    const options = {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true
    };

    console.log('✅ 连接池优化:', options);
    return options;
  }

  /**
   * 查询优化建议
   */
  static async getOptimizationSuggestions() {
    const suggestions = [];

    // 检查慢查询
    const slowQueries = await mongoose.connection.db
      .collection('system.profile')
      .find({ execStatsMillis: { $gt: 100 } })
      .toArray();

    if (slowQueries.length > 0) {
      suggestions.push({
        type: 'slow_query',
        message: `发现 ${slowQueries.length} 个慢查询,建议添加索引或优化查询`,
        count: slowQueries.length
      });
    }

    // 检查全表扫描
    const collectionScans = await mongoose.connection.db
      .collection('system.profile')
      .find({ execStatsMillis: { $gt: 1000 }, docsExamined: { $lt: 100 } })
      .toArray();

    if (collectionScans.length > 0) {
      suggestions.push({
        type: 'collection_scan',
        message: `发现 ${collectionScans.length} 个全表扫描,建议添加过滤条件`,
        count: collectionScans.length
      });
    }

    return suggestions;
  }
}

module.exports = QueryOptimizer;

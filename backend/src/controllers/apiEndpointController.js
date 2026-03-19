/**
 * API端点管理控制器
 * 提供API接口的增删改查功能
 */

const APIEndpoint = require('../models/APIEndpoint');
const logger = require('../utils/logger');

/**
 * 获取所有API端点
 */
async function getAllEndpoints(req, res) {
  try {
    const { module, enabled, method, page = 1, limit = 20, search } = req.query;

    // 构建查询条件
    const query = {};

    if (module) query.module = module;
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (method) query.method = method;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } }
      ];
    }

    // 分页
    const skip = (page - 1) * limit;

    const [endpoints, total] = await Promise.all([
      APIEndpoint.find(query)
        .sort({ module: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      APIEndpoint.countDocuments(query)
    ]);

    res.json({
      code: 200,
      message: '获取API端点列表成功',
      data: {
        list: endpoints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('获取API端点列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取API端点列表失败',
      error: error.message
    });
  }
}

/**
 * 获取单个API端点
 */
async function getEndpoint(req, res) {
  try {
    const { id } = req.params;

    const endpoint = await APIEndpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({
        code: 404,
        message: 'API端点不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取API端点成功',
      data: endpoint
    });
  } catch (error) {
    logger.error('获取API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取API端点失败',
      error: error.message
    });
  }
}

/**
 * 创建API端点
 */
async function createEndpoint(req, res) {
  try {
    const endpointData = req.body;

    // 检查是否已存在
    const exists = await APIEndpoint.findOne({
      method: endpointData.method,
      path: endpointData.path
    });

    if (exists) {
      return res.status(400).json({
        code: 400,
        message: '该API端点已存在'
      });
    }

    // 创建端点
    const endpoint = await APIEndpoint.create({
      ...endpointData,
      createdBy: req.user?.id || 'admin'
    });

    res.status(201).json({
      code: 201,
      message: '创建API端点成功',
      data: endpoint
    });
  } catch (error) {
    logger.error('创建API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建API端点失败',
      error: error.message
    });
  }
}

/**
 * 更新API端点
 */
async function updateEndpoint(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const endpoint = await APIEndpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({
        code: 404,
        message: 'API端点不存在'
      });
    }

    // 检查路径和方法是否与其他端点冲突
    const conflict = await APIEndpoint.findOne({
      method: updateData.method || endpoint.method,
      path: updateData.path || endpoint.path,
      _id: { $ne: id }
    });

    if (conflict) {
      return res.status(400).json({
        code: 400,
        message: '该API端点已存在'
      });
    }

    // 更新端点
    const updated = await APIEndpoint.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: req.user?.id || 'admin',
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      code: 200,
      message: '更新API端点成功',
      data: updated
    });
  } catch (error) {
    logger.error('更新API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新API端点失败',
      error: error.message
    });
  }
}

/**
 * 删除API端点
 */
async function deleteEndpoint(req, res) {
  try {
    const { id } = req.params;

    const endpoint = await APIEndpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({
        code: 404,
        message: 'API端点不存在'
      });
    }

    await APIEndpoint.findByIdAndDelete(id);

    res.json({
      code: 200,
      message: '删除API端点成功'
    });
  } catch (error) {
    logger.error('删除API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除API端点失败',
      error: error.message
    });
  }
}

/**
 * 批量删除API端点
 */
async function batchDeleteEndpoints(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的端点'
      });
    }

    const result = await APIEndpoint.deleteMany({ _id: { $in: ids } });

    res.json({
      code: 200,
      message: `成功删除${result.deletedCount}个API端点`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    logger.error('批量删除API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除API端点失败',
      error: error.message
    });
  }
}

/**
 * 批量启用/禁用API端点
 */
async function batchToggleEndpoints(req, res) {
  try {
    const { ids, enabled } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要操作的端点'
      });
    }

    if (enabled === undefined) {
      return res.status(400).json({
        code: 400,
        message: '请指定启用或禁用状态'
      });
    }

    const result = await APIEndpoint.updateMany(
      { _id: { $in: ids } },
      { enabled, updatedBy: req.user?.id || 'admin', updatedAt: Date.now() }
    );

    res.json({
      code: 200,
      message: `成功${enabled ? '启用' : '禁用'}${result.modifiedCount}个API端点`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    logger.error('批量操作API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量操作API端点失败',
      error: error.message
    });
  }
}

/**
 * 测试API端点
 */
async function testEndpoint(req, res) {
  try {
    const { id } = req.params;
    const axios = require('axios');

    const endpoint = await APIEndpoint.findById(id);

    if (!endpoint) {
      return res.status(404).json({
        code: 404,
        message: 'API端点不存在'
      });
    }

    // 构建测试URL
    const testUrl = endpoint.testEndpoint || `${req.protocol}://${req.get('host')}/api${endpoint.path}`;
    const startTime = Date.now();

    let response;
    try {
      response = await axios({
        method: endpoint.method,
        url: testUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // 更新测试结果
      await APIEndpoint.findByIdAndUpdate(id, {
        'testResult.status': 'failed',
        'testResult.statusCode': error.response?.status,
        'testResult.responseTime': responseTime,
        'testResult.errorMessage': error.message,
        lastTestedAt: Date.now()
      });

      return res.json({
        code: 400,
        message: 'API测试失败',
        data: {
          status: 'failed',
          error: error.message,
          responseTime
        }
      });
    }

    const responseTime = Date.now() - startTime;

    // 更新测试结果
    await APIEndpoint.findByIdAndUpdate(id, {
      'testResult.status': 'success',
      'testResult.statusCode': response.status,
      'testResult.responseTime': responseTime,
      'testResult.errorMessage': null,
      lastTestedAt: Date.now()
    });

    res.json({
      code: 200,
      message: 'API测试成功',
      data: {
        status: 'success',
        statusCode: response.status,
        responseTime,
        data: response.data
      }
    });
  } catch (error) {
    logger.error('测试API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '测试API端点失败',
      error: error.message
    });
  }
}

/**
 * 批量测试API端点
 */
async function batchTestEndpoints(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要测试的端点'
      });
    }

    const axios = require('axios');
    const results = [];

    for (const id of ids) {
      const endpoint = await APIEndpoint.findById(id);
      if (!endpoint) continue;

      try {
        const testUrl = endpoint.testEndpoint || `${req.protocol}://${req.get('host')}/api${endpoint.path}`;
        const startTime = Date.now();

        const response = await axios({
          method: endpoint.method,
          url: testUrl,
          timeout: 5000
        });

        const responseTime = Date.now() - startTime;

        await APIEndpoint.findByIdAndUpdate(id, {
          'testResult.status': 'success',
          'testResult.statusCode': response.status,
          'testResult.responseTime': responseTime,
          lastTestedAt: Date.now()
        });

        results.push({
          id: endpoint._id,
          name: endpoint.name,
          status: 'success',
          statusCode: response.status,
          responseTime
        });
      } catch (error) {
        await APIEndpoint.findByIdAndUpdate(id, {
          'testResult.status': 'failed',
          'testResult.statusCode': error.response?.status,
          'testResult.errorMessage': error.message,
          lastTestedAt: Date.now()
        });

        results.push({
          id: endpoint._id,
          name: endpoint.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      code: 200,
      message: '批量测试完成',
      data: {
        results,
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });
  } catch (error) {
    logger.error('批量测试API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量测试API端点失败',
      error: error.message
    });
  }
}

/**
 * 导出API端点
 */
async function exportEndpoints(req, res) {
  try {
    const { module } = req.query;

    const query = {};
    if (module) query.module = module;

    const endpoints = await APIEndpoint.find(query).sort({ module: 1, createdAt: -1 });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: endpoints.length,
      endpoints
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=api-endpoints-${Date.now()}.json`);

    res.json(exportData);
  } catch (error) {
    logger.error('导出API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '导出API端点失败',
      error: error.message
    });
  }
}

/**
 * 导入API端点
 */
async function importEndpoints(req, res) {
  try {
    const { endpoints } = req.body;

    if (!endpoints || !Array.isArray(endpoints)) {
      return res.status(400).json({
        code: 400,
        message: '无效的导入数据'
      });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const endpointData of endpoints) {
      // 检查是否已存在
      const exists = await APIEndpoint.findOne({
        method: endpointData.method,
        path: endpointData.path
      });

      if (exists) {
        // 更新
        await APIEndpoint.findByIdAndUpdate(exists._id, {
          ...endpointData,
          updatedBy: req.user?.id || 'admin',
          updatedAt: Date.now()
        });
        updated++;
      } else {
        // 创建
        await APIEndpoint.create({
          ...endpointData,
          createdBy: req.user?.id || 'admin'
        });
        created++;
      }
    }

    res.json({
      code: 200,
      message: '导入API端点成功',
      data: { created, updated, skipped, total: endpoints.length }
    });
  } catch (error) {
    logger.error('导入API端点失败:', error);
    res.status(500).json({
      code: 500,
      message: '导入API端点失败',
      error: error.message
    });
  }
}

/**
 * 获取API统计
 */
async function getAPIStats(req, res) {
  try {
    const stats = await Promise.all([
      APIEndpoint.countDocuments(),
      APIEndpoint.countDocuments({ enabled: true }),
      APIEndpoint.countDocuments({ enabled: false }),
      APIEndpoint.countDocuments({ 'testResult.status': 'success' }),
      APIEndpoint.countDocuments({ 'testResult.status': 'failed' }),
      APIEndpoint.countDocuments({ 'testResult.status': 'untested' })
    ]);

    // 按模块统计
    const moduleStats = await APIEndpoint.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 按方法统计
    const methodStats = await APIEndpoint.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      code: 200,
      message: '获取API统计成功',
      data: {
        total: stats[0],
        enabled: stats[1],
        disabled: stats[2],
        testSuccess: stats[3],
        testFailed: stats[4],
        untested: stats[5],
        byModule: moduleStats,
        byMethod: methodStats
      }
    });
  } catch (error) {
    logger.error('获取API统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取API统计失败',
      error: error.message
    });
  }
}

module.exports = {
  getAllEndpoints,
  getEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  batchDeleteEndpoints,
  batchToggleEndpoints,
  testEndpoint,
  batchTestEndpoints,
  exportEndpoints,
  importEndpoints,
  getAPIStats
};

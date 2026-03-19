/**
 * 配置管理控制器
 * 提供配置的查看、更新、导入导出等功能
 */

const config = require('../config');
const { getConfigMeta, getConfigItemMeta } = require('../config/config-meta');
const logger = require('../utils/logger');
const ConfigHistory = require('../models/ConfigHistory');
const ConfigSnapshot = require('../models/ConfigSnapshot');

/**
 * 获取所有配置
 */
async function getAllConfigs(req, res) {
  try {
    const allConfigs = config.getAllConfigs();

    // 隐藏敏感信息
    const safeConfigs = sanitizeConfigs(allConfigs);

    res.json({
      code: 200,
      message: '获取配置成功',
      data: safeConfigs
    });
  } catch (error) {
    logger.error('获取配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置失败',
      error: error.message
    });
  }
}

/**
 * 获取特定配置
 */
async function getConfig(req, res) {
  try {
    const { source } = req.params;

    if (!source) {
      return res.status(400).json({
        code: 400,
        message: '配置源不能为空'
      });
    }

    const configData = config.get(source);

    if (!configData) {
      return res.status(404).json({
        code: 404,
        message: '配置不存在'
      });
    }

    // 隐藏敏感信息
    const safeConfig = sanitizeConfig(configData, source);

    res.json({
      code: 200,
      message: '获取配置成功',
      data: safeConfig
    });
  } catch (error) {
    logger.error('获取配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置失败',
      error: error.message
    });
  }
}

/**
 * 更新配置
 */
async function updateConfig(req, res) {
  try {
    const { source } = req.params;
    const newConfig = req.body;

    if (!source) {
      return res.status(400).json({
        code: 400,
        message: '配置源不能为空'
      });
    }

    if (!newConfig || Object.keys(newConfig).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '配置数据不能为空'
      });
    }

    // 更新配置
    const updatedConfig = await config.updateConfig(source, newConfig);

    res.json({
      code: 200,
      message: '配置更新成功',
      data: sanitizeConfig(updatedConfig, source)
    });
  } catch (error) {
    logger.error('更新配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新配置失败',
      error: error.message
    });
  }
}

/**
 * 重新加载配置
 */
async function reloadConfig(req, res) {
  try {
    const { source } = req.params;

    if (!source) {
      return res.status(400).json({
        code: 400,
        message: '配置源不能为空'
      });
    }

    await config.reloadConfig(source);

    const configData = config.get(source);

    res.json({
      code: 200,
      message: '配置重新加载成功',
      data: sanitizeConfig(configData, source)
    });
  } catch (error) {
    logger.error('重新加载配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '重新加载配置失败',
      error: error.message
    });
  }
}

/**
 * 重新加载所有配置
 */
async function reloadAllConfigs(req, res) {
  try {
    await config.reloadAllConfigs();

    res.json({
      code: 200,
      message: '所有配置重新加载成功'
    });
  } catch (error) {
    logger.error('重新加载所有配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '重新加载所有配置失败',
      error: error.message
    });
  }
}

/**
 * 配置健康检查
 */
async function healthCheck(req, res) {
  try {
    const health = await config.healthCheck();

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      code: statusCode,
      message: health.status === 'healthy' ? '配置健康' : '配置异常',
      data: health
    });
  } catch (error) {
    logger.error('配置健康检查失败:', error);
    res.status(500).json({
      code: 500,
      message: '配置健康检查失败',
      error: error.message
    });
  }
}

/**
 * 导出配置
 */
async function exportConfigs(req, res) {
  try {
    const exportedConfig = config.exportConfig();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=config-${Date.now()}.json`);

    res.json(exportedConfig);
  } catch (error) {
    logger.error('导出配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '导出配置失败',
      error: error.message
    });
  }
}

/**
 * 导入配置
 */
async function importConfigs(req, res) {
  try {
    const configData = req.body;

    if (!configData || !configData.configs) {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      });
    }

    await config.importConfig(configData);

    res.json({
      code: 200,
      message: '配置导入成功'
    });
  } catch (error) {
    logger.error('导入配置失败:', error);
    res.status(500).json({
      code: 500,
      message: '导入配置失败',
      error: error.message
    });
  }
}

/**
 * 获取配置摘要
 */
async function getConfigSummary(req, res) {
  try {
    const summary = config.getConfigSummary();

    res.json({
      code: 200,
      message: '获取配置摘要成功',
      data: summary
    });
  } catch (error) {
    logger.error('获取配置摘要失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置摘要失败',
      error: error.message
    });
  }
}

/**
 * 获取配置元数据
 */
async function getConfigMetadata(req, res) {
  try {
    const { groupId, itemKey } = req.query;

    if (groupId && itemKey) {
      // 获取单个配置项的元数据
      const meta = getConfigItemMeta(groupId, itemKey);
      if (!meta) {
        return res.status(404).json({
          code: 404,
          message: '配置项不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取配置项元数据成功',
        data: meta
      });
    } else if (groupId) {
      // 获取配置组的元数据
      const meta = getConfigMeta(groupId);
      if (!meta) {
        return res.status(404).json({
          code: 404,
          message: '配置组不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取配置组元数据成功',
        data: meta
      });
    } else {
      // 获取所有配置元数据
      const { getAllConfigGroups } = require('../config/config-meta');
      const allGroups = getAllConfigGroups();

      res.json({
        code: 200,
        message: '获取配置元数据成功',
        data: allGroups
      });
    }
  } catch (error) {
    logger.error('获取配置元数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取配置元数据失败',
      error: error.message
    });
  }
}

/**
 * 清理配置（移除敏感信息）
 */
function sanitizeConfigs(configs) {
  const sanitized = {};

  for (const [source, config] of Object.entries(configs)) {
    sanitized[source] = sanitizeConfig(config, source);
  }

  return sanitized;
}

/**
 * 清理单个配置
 */
function sanitizeConfig(config, source) {
  const sanitized = { ...config };

  // 需要隐藏的敏感字段
  const sensitiveFields = {
    database: ['password', 'secretKey', 'accessToken'],
    redis: ['password'],
    auth: ['secret', 'password'],
    storage: ['secretKey', 'accessKey'],
    ai: ['appKey', 'token', 'apiKey', 'secretId'],
    thirdparty: ['accessKey', 'secretKey', 'password', 'apiKey', 'privateKey']
  };

  const fieldsToHide = sensitiveFields[source] || [];

  // 递归隐藏敏感字段
  function hideSensitiveFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in result) {
      if (fields.includes(key)) {
        result[key] = '***';
      } else if (typeof result[key] === 'object') {
        result[key] = hideSensitiveFields(result[key], fields);
      }
    }

    return result;
  }

  return hideSensitiveFields(sanitized, fieldsToHide);
}

module.exports = {
  getAllConfigs,
  getConfig,
  updateConfig,
  reloadConfig,
  reloadAllConfigs,
  healthCheck,
  exportConfigs,
  importConfigs,
  getConfigSummary,
  getConfigMetadata,
  /**
   * 获取配置历史
   */
  getConfigHistory: async (source, limit = 20) => {
    try {
      const history = await ConfigHistory.find({ source })
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();

      return history;
    } catch (error) {
      logger.error('获取配置历史失败:', error);
      throw error;
    }
  },

  /**
   * 回滚配置
   */
  rollbackConfig: async (source, historyId) => {
    try {
      const historyRecord = await ConfigHistory.findOne({
        source,
        _id: historyId
      });

      if (!historyRecord) {
        throw new Error('历史记录不存在');
      }

      // 恢复到旧值
      await config.update(source, historyRecord.old_value);

      return {
        success: true,
        message: '回滚成功',
        rollback_to: historyRecord.old_value
      };
    } catch (error) {
      logger.error('回滚配置失败:', error);
      throw error;
    }
  },

  /**
   * 创建配置快照
   */
  createSnapshot: async (name, description) => {
    try {
      const allConfigs = config.getAllConfigs();

      const snapshot = await ConfigSnapshot.create({
        snapshot_id: `snapshot_${Date.now()}`,
        name,
        description,
        configs: allConfigs
      });

      return {
        success: true,
        data: snapshot
      };
    } catch (error) {
      logger.error('创建快照失败:', error);
      throw error;
    }
  },

  /**
   * 恢复配置快照
   */
  restoreSnapshot: async (snapshotId) => {
    try {
      const snapshot = await ConfigSnapshot.findOne({
        snapshot_id: snapshotId
      });

      if (!snapshot) {
        throw new Error('快照不存在');
      }

      // 恢复所有配置
      for (const [source, configs] of Object.entries(snapshot.configs)) {
        await config.update(source, configs);
      }

      return {
        success: true,
        message: '恢复快照成功',
        restored_from: snapshot.name
      };
    } catch (error) {
      logger.error('恢复快照失败:', error);
      throw error;
    }
  },

  /**
   * 获取快照列表
   */
  getSnapshots: async (limit = 10) => {
    try {
      const snapshots = await ConfigSnapshot.find()
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();

      return snapshots;
    } catch (error) {
      logger.error('获取快照列表失败:', error);
      throw error;
    }
  },

  /**
   * 配置对比
   */
  compareConfigs: async (config1, config2) => {
    try {
      const diff = {};

      for (const key of Object.keys({ ...config1, ...config2 })) {
        const val1 = config1[key];
        const val2 = config2[key];

        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          diff[key] = {
            old: val1,
            new: val2,
            changed: true
          };
        }
      }

      return diff;
    } catch (error) {
      logger.error('对比配置失败:', error);
      throw error;
    }
  },

  /**
   * 批量验证配置
   */
  validateConfigsBatch: async (configs) => {
    try {
      const results = {};

      for (const [source, configData] of Object.entries(configs)) {
        try {
          // 基本验证
          const meta = getConfigItemMeta(source);
          const isValid = await config.validateItem(source, meta);

          results[source] = {
            valid: isValid,
            errors: isValid ? [] : ['配置值不符合规则']
          };
        } catch (error) {
          results[source] = {
            valid: false,
            errors: [error.message]
          };
        }
      }

      return results;
    } catch (error) {
      logger.error('批量验证配置失败:', error);
      throw error;
    }
  },

  /**
   * 获取配置使用统计
   */
  getConfigUsageStats: async () => {
    try {
      const historyCount = await ConfigHistory.countDocuments({});
      const snapshotCount = await ConfigSnapshot.countDocuments({});

      // 最近7天的变更次数
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentChanges = await ConfigHistory.countDocuments({
        created_at: { $gte: sevenDaysAgo }
      });

      return {
        total_history: historyCount,
        total_snapshots: snapshotCount,
        recent_changes: recentChanges,
        average_daily_changes: Math.round(recentChanges / 7)
      };
    } catch (error) {
      logger.error('获取配置统计失败:', error);
      throw error;
    }
  }
};

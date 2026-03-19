const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

/**
 * 配置管理路由
 * 提供配置的统一管理接口
 */

// 获取配置摘要
router.get('/summary', configController.getConfigSummary);

// 健康检查
router.get('/health', configController.healthCheck);

// 获取所有配置
router.get('/', configController.getAllConfigs);

// 获取特定配置
router.get('/:source', configController.getConfig);

// 更新配置
router.put('/:source', configController.updateConfig);

// 重新加载配置
router.post('/:source/reload', configController.reloadConfig);

// 重新加载所有配置
router.post('/reload/all', configController.reloadAllConfigs);

// 导出配置
router.get('/export/all', configController.exportConfigs);

// 导入配置
router.post('/import/all', configController.importConfigs);

// 获取配置元数据
router.get('/meta', configController.getConfigMetadata);

module.exports = router;

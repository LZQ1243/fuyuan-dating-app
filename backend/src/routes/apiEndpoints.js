const express = require('express');
const router = express.Router();
const apiEndpointController = require('../controllers/apiEndpointController');
const authMiddleware = require('../middleware/auth');

/**
 * API端点管理路由
 * 用于管理系统所有的API接口
 */

// 获取API统计
router.get('/stats', authMiddleware, apiEndpointController.getAPIStats);

// 获取所有API端点
router.get('/', authMiddleware, apiEndpointController.getAllEndpoints);

// 获取单个API端点
router.get('/:id', authMiddleware, apiEndpointController.getEndpoint);

// 创建API端点
router.post('/', authMiddleware, apiEndpointController.createEndpoint);

// 更新API端点
router.put('/:id', authMiddleware, apiEndpointController.updateEndpoint);

// 删除API端点
router.delete('/:id', authMiddleware, apiEndpointController.deleteEndpoint);

// 批量删除API端点
router.delete('/batch', authMiddleware, apiEndpointController.batchDeleteEndpoints);

// 批量启用/禁用API端点
router.put('/batch/toggle', authMiddleware, apiEndpointController.batchToggleEndpoints);

// 测试API端点
router.post('/:id/test', authMiddleware, apiEndpointController.testEndpoint);

// 批量测试API端点
router.post('/batch/test', authMiddleware, apiEndpointController.batchTestEndpoints);

// 导出API端点
router.get('/export/all', authMiddleware, apiEndpointController.exportEndpoints);

// 导入API端点
router.post('/import/all', authMiddleware, apiEndpointController.importEndpoints);

module.exports = router;

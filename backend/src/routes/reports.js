const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');

/**
 * 举报路由 - 处理内容举报和用户举报
 */

// 公开路由（需要用户登录）
router.use(auth);

/**
 * POST /api/reports
 * 创建举报
 */
router.post('/', reportController.createReport);

/**
 * GET /api/reports
 * 获取举报列表（用户自己的举报）
 */
router.get('/', reportController.getReports);

/**
 * GET /api/reports/:id
 * 获取举报详情
 */
router.get('/:id', reportController.getReportDetail);

/**
 * POST /api/reports/:id/process
 * 处理举报（管理员）
 */
router.post('/:id/process', adminAuth, reportController.processReport);

/**
 * GET /api/reports/admin/all
 * 获取所有举报（管理员）
 */
router.get('/admin/all', adminAuth, reportController.getReports);

module.exports = router;

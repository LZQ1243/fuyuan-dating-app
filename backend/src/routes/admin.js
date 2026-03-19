const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// 所有管理员路由都需要管理员权限
router.use(authMiddleware);
router.use(isAdmin);

// 用户管理
router.get('/users', adminController.getUsers);
router.get('/users/:user_id', adminController.getUserDetail);
router.put('/users/:user_id/ban', adminController.banUser);
router.put('/users/:user_id/unban', adminController.unbanUser);

// 认证审核
router.get('/certifications/pending', adminController.getPendingCertifications);
router.put('/certifications/:user_id/approve', adminController.approveCertification);
router.put('/certifications/:user_id/reject', adminController.rejectCertification);

// 敏感词管理
router.get('/sensitive-words', adminController.getSensitiveWords);
router.post('/sensitive-words', adminController.addSensitiveWord);
router.delete('/sensitive-words/:word', adminController.deleteSensitiveWord);

// 数据统计
router.get('/statistics', adminController.getStatistics);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 提交认证
router.post('/certification', authMiddleware, authController.submitCertification);

// 获取当前用户信息
router.get('/me', authMiddleware, authController.getCurrentUser);

// 更新用户信息
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;

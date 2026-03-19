const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authMiddleware } = require('../middleware/auth');

// 注册流程相关接口
router.post('/basic-info', authMiddleware, registrationController.submitBasicInfo);
router.post('/id-verification', authMiddleware, registrationController.submitIdVerification);
router.post('/disability-cert', authMiddleware, registrationController.submitDisabilityCert);
router.post('/marriage-cert', authMiddleware, registrationController.submitMarriageCert);
router.get('/step', authMiddleware, registrationController.getRegistrationStep);

// 强制流程引导中间件
router.use(registrationController.registrationGuard);

module.exports = router;

const express = require('express');
const router = express.Router();
const accessibilityController = require('../controllers/accessibilityController');
const { authMiddleware } = require('../middleware/auth');

// 无障碍辅助功能接口
router.post('/voice-guide', authMiddleware, accessibilityController.playVoiceGuide);
router.post('/speech-to-text', authMiddleware, accessibilityController.speechToText);
router.post('/check-sensitive', authMiddleware, accessibilityController.checkSensitiveContent);

module.exports = router;

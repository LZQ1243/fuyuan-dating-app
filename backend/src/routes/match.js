const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

// 获取推荐用户
router.get('/recommend', authMiddleware, matchController.getRecommendUsers);

module.exports = router;

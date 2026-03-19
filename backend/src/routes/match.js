const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

// 获取推荐用户
router.get('/recommend', authMiddleware, matchController.getRecommendUsers);

// 获取匹配历史
router.get('/history', authMiddleware, matchController.getMatchHistory);

// 收藏用户
router.post('/favorite', authMiddleware, matchController.favoriteUser);

// 取消收藏
router.delete('/favorite/:userId', authMiddleware, matchController.unfavoriteUser);

// 获取收藏列表
router.get('/favorites', authMiddleware, matchController.getFavorites);

// 添加到黑名单
router.post('/blacklist', authMiddleware, matchController.addToBlacklist);

// 从黑名单移除
router.delete('/blacklist/:userId', authMiddleware, matchController.removeFromBlacklist);

// 获取黑名单列表
router.get('/blacklist', authMiddleware, matchController.getBlacklist);

// 检查用户是否被屏蔽
router.get('/blacklist/check/:userId', authMiddleware, matchController.isBlocked);

// 获取匹配统计
router.get('/stats', authMiddleware, matchController.getMatchStats);

// 更新匹配偏好
router.put('/preferences', authMiddleware, matchController.updateMatchPreferences);

module.exports = router;

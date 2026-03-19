const express = require('express');
const router = express.Router();
const shortVideoController = require('../controllers/shortVideoController');
const { authMiddleware } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// 所有短视频路由都需要认证
router.use(authMiddleware);

/**
 * @route   GET /api/short-video/packages
 * @desc    获取套餐列表
 * @access  Private
 */
router.get('/packages', shortVideoController.getPackages);

/**
 * @route   POST /api/short-video/buy
 * @desc    购买套餐
 * @access  Private
 */
router.post('/buy', shortVideoController.buyPackage);

/**
 * @route   POST /api/short-video/upload
 * @desc    上传短视频
 * @access  Private
 */
router.post('/upload', uploadSingle('video'), shortVideoController.uploadVideo);

/**
 * @route   GET /api/short-video/recommended
 * @desc    获取推荐视频
 * @access  Private
 */
router.get('/recommended', shortVideoController.getRecommended);

/**
 * @route   GET /api/short-video/my
 * @desc    获取我的视频列表
 * @access  Private
 */
router.get('/my', shortVideoController.getMyVideos);

/**
 * @route   GET /api/short-video/my/stats
 * @desc    获取我的视频统计
 * @access  Private
 */
router.get('/my/stats', shortVideoController.getMyStats);

/**
 * @route   GET /api/short-video/my/packages
 * @desc    获取我的套餐
 * @access  Private
 */
router.get('/my/packages', shortVideoController.getMyPackages);

/**
 * @route   DELETE /api/short-video/video/:video_id
 * @desc    删除视频
 * @access  Private
 */
router.delete('/video/:video_id', shortVideoController.deleteVideo);

module.exports = router;

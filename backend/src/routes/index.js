const express = require('express');
const router = express.Router();

// 配置中心路由（必须在其他路由之前）
const configRoutes = require('./config');
router.use('/config', configRoutes);

// 认证路由
const authRoutes = require('./auth');
router.use('/auth', authRoutes);

// 用户路由
const userRoutes = require('./user');
router.use('/user', userRoutes);

// 匹配路由
const matchRoutes = require('./match');
router.use('/match', matchRoutes);

// 聊天路由
const chatRoutes = require('./chat');
router.use('/chat', chatRoutes);

// 动态路由
const postRoutes = require('./post');
router.use('/posts', postRoutes);

// 上传路由
const uploadRoutes = require('./upload');
router.use('/upload', uploadRoutes);

// 管理员路由
const adminRoutes = require('./admin');
router.use('/admin', adminRoutes);

// 新增：注册流程路由
const registrationRoutes = require('./registration');
router.use('/registration', registrationRoutes);

// 新增：短视频路由
const shortVideoRoutes = require('./shortVideo');
router.use('/short-video', shortVideoRoutes);

// 新增：无障碍功能路由
const accessibilityRoutes = require('./accessibility');
router.use('/accessibility', accessibilityRoutes);

// 新增：敏感词管理路由
const sensitiveWordsRoutes = require('./sensitiveWords');
router.use('/sensitive-words', sensitiveWordsRoutes);

// 新增：API端点管理路由
const apiEndpointsRoutes = require('./apiEndpoints');
router.use('/api-endpoints', apiEndpointsRoutes);

// 新增：朋友圈路由
const momentsRoutes = require('./moments');
router.use('/moments', momentsRoutes);

// 新增：短视频路由（完整版）
const shortVideosRoutes = require('./shortVideos');
router.use('/short-videos', shortVideosRoutes);

// 新增：直播间路由
const liveRoomRoutes = require('./liveRooms');
router.use('/live-rooms', liveRoomRoutes);

// 新增：举报路由
const reportRoutes = require('./reports');
router.use('/reports', reportRoutes);

// 新增：语音消息路由
const voiceRoutes = require('./voice');
router.use('/voice', voiceRoutes);

module.exports = router;

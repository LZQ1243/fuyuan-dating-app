const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

// 获取聊天列表
router.get('/list', authMiddleware, chatController.getChatList);

// 获取聊天记录
router.get('/history/:target_user_id', authMiddleware, chatController.getChatHistory);

// 发送消息
router.post('/send', authMiddleware, chatController.sendMessage);

// 标记消息已读
router.put('/read/:target_user_id', authMiddleware, chatController.markAsRead);
router.put('/read/:target_user_id/:message_id', authMiddleware, chatController.markAsRead);

// 撤回消息
router.put('/revoke/:message_id', authMiddleware, chatController.revokeMessage);

// 获取消息阅读状态
router.get('/read-status/:message_id', authMiddleware, chatController.getMessageReadStatus);

// 批量获取消息阅读状态
router.post('/read-status/batch', authMiddleware, chatController.getBatchMessageReadStatus);

module.exports = router;

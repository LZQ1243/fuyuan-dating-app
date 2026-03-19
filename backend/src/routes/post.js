const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

// 获取动态列表
router.get('/', optionalAuth, postController.getPosts);

// 发布动态
router.post('/', authMiddleware, postController.createPost);

// 点赞动态
router.post('/:post_id/like', authMiddleware, postController.likePost);

// 评论动态
router.post('/:post_id/comment', authMiddleware, postController.commentPost);

// 删除动态
router.delete('/:post_id', authMiddleware, postController.deletePost);

// 获取评论列表
router.get('/:post_id/comments', optionalAuth, postController.getComments);

module.exports = router;

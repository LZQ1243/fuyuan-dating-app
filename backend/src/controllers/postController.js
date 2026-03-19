const Post = require('../models/Post');
const User = require('../models/User');
const { detectViolation } = require('../utils/sensitiveFilter');
const { uploadMultiple } = require('../middleware/upload');
const logger = require('../utils/logger');

// 获取动态列表
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user_id = req.query.user_id;

    const query = {
      is_deleted: false
    };

    // 如果指定用户，只查看该用户的动态
    if (user_id) {
      query.user_id = user_id;
    }

    const options = {
      page,
      limit,
      sort: { created_at: -1 },
      populate: [
        {
          path: 'user_id',
          select: 'user_id nickname avatar disability_type disability_level'
        },
        {
          path: 'comments.user_id',
          select: 'user_id nickname avatar'
        }
      ]
    };

    const result = await Post.paginate(query, options);

    // 格式化返回数据
    const posts = result.docs.map(post => ({
      post_id: post.post_id,
      user: post.user_id,
      content: post.content,
      media_urls: post.media_urls,
      type: post.type,
      likes_count: post.likes.length,
      is_liked: req.user && post.likes.includes(req.user.user_id),
      comments: post.comments.map(comment => ({
        comment_id: comment.comment_id,
        user: comment.user_id,
        content: comment.content,
        created_at: comment.created_at
      })),
      comments_count: post.comments.length,
      created_at: post.created_at
    }));

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          total_pages: result.totalPages
        }
      }
    });

  } catch (error) {
    logger.error('获取动态列表失败:', error);
    next(error);
  }
};

// 发布动态
exports.createPost = [
  uploadMultiple('media', 9),

  async (req, res, next) => {
    try {
      const user = req.user;
      let { content, type = 'text', is_private = false } = req.body;

      // 验证内容
      if (!content || content.trim() === '') {
        return res.status(400).json({
          code: 400,
          message: '动态内容不能为空'
        });
      }

      // 敏感词检测
      const violation = detectViolation(content);
      if (violation.isViolation) {
        return res.status(400).json({
          code: 400,
          message: '动态包含违规内容',
          reason: violation.reason
        });
      }

      // 处理媒体文件
      const media_urls = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          media_urls.push(`/uploads/${file.filename}`);
        });

        // 根据文件类型判断动态类型
        if (media_urls.length > 0) {
          const isVideo = req.files.some(f => f.mimetype.startsWith('video/'));
          type = isVideo ? 'video' : 'image';
        }
      }

      // 创建动态
      const post = new Post({
        user_id: user.user_id,
        content: violation.filteredContent,
        media_urls,
        type,
        is_private
      });

      await post.save();

      logger.info(`用户 ${user.phone} 发布动态`);

      res.status(201).json({
        code: 200,
        message: '发布成功',
        data: {
          post_id: post.post_id,
          content: post.content,
          media_urls: post.media_urls,
          type: post.type,
          created_at: post.created_at
        }
      });

    } catch (error) {
      logger.error('发布动态失败:', error);
      next(error);
    }
  }
];

// 点赞动态
exports.likePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { post_id } = req.params;

    const post = await Post.findOne({ post_id, is_deleted: false });

    if (!post) {
      return res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    }

    const isLiked = post.likes.includes(user.user_id);

    if (isLiked) {
      // 取消点赞
      post.likes = post.likes.filter(id => id !== user.user_id);
    } else {
      // 点赞
      post.likes.push(user.user_id);
    }

    await post.save();

    logger.info(`用户 ${user.phone} ${isLiked ? '取消' : ''}点赞动态 ${post_id}`);

    res.json({
      code: 200,
      message: isLiked ? '取消点赞成功' : '点赞成功',
      data: {
        is_liked: !isLiked,
        likes_count: post.likes.length
      }
    });

  } catch (error) {
    logger.error('点赞动态失败:', error);
    next(error);
  }
};

// 评论动态
exports.commentPost = async (req, res, next) => {
  try {
    const user = req.user;
    const { post_id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '评论内容不能为空'
      });
    }

    // 敏感词检测
    const violation = detectViolation(content);
    if (violation.isViolation) {
      return res.status(400).json({
        code: 400,
        message: '评论包含违规内容',
        reason: violation.reason
      });
    }

    const post = await Post.findOne({ post_id, is_deleted: false });

    if (!post) {
      return res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    }

    // 添加评论
    post.comments.push({
      comment_id: new Date().getTime().toString(),
      user_id: user.user_id,
      content: violation.filteredContent
    });

    await post.save();

    logger.info(`用户 ${user.phone} 评论动态 ${post_id}`);

    res.status(201).json({
      code: 200,
      message: '评论成功',
      data: {
        comments_count: post.comments.length
      }
    });

  } catch (error) {
    logger.error('评论动态失败:', error);
    next(error);
  }
};

// 删除动态
exports.deletePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { post_id } = req.params;

    const post = await Post.findOne({ post_id });

    if (!post) {
      return res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    }

    // 只有发布者可以删除
    if (post.user_id.toString() !== user.user_id) {
      return res.status(403).json({
        code: 403,
        message: '无权删除此动态'
      });
    }

    post.is_deleted = true;
    await post.save();

    logger.info(`用户 ${user.phone} 删除动态 ${post_id}`);

    res.json({
      code: 200,
      message: '删除成功'
    });

  } catch (error) {
    logger.error('删除动态失败:', error);
    next(error);
  }
};

// 获取评论列表
exports.getComments = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const post = await Post.findOne({ post_id, is_deleted: false })
      .populate('comments.user_id', 'user_id nickname avatar');

    if (!post) {
      return res.status(404).json({
        code: 404,
        message: '动态不存在'
      });
    }

    const allComments = post.comments.sort((a, b) => b.created_at - a.created_at);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = allComments.slice(startIndex, endIndex);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        comments: paginatedComments,
        pagination: {
          page,
          limit,
          total: allComments.length,
          total_pages: Math.ceil(allComments.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('获取评论列表失败:', error);
    next(error);
  }
};

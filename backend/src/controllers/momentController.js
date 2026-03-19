const Moment = require('../models/Moment');
const MomentLike = require('../models/MomentLike');
const MomentComment = require('../models/MomentComment');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// 发布朋友圈
exports.createMoment = async (req, res) => {
  try {
    const { content, images, video_url, location, visibility } = req.body;
    const user_id = req.user.id;

    // 验证必填字段
    if (!content && (!images || images.length === 0) && !video_url) {
      return res.status(400).json({
        success: false,
        message: '请输入内容或上传图片/视频'
      });
    }

    const moment = new Moment({
      user_id,
      content: content || '',
      images: images || [],
      video_url: video_url || '',
      location: location || '',
      visibility: visibility || 'public'
    });

    await moment.save();

    // 查询用户信息
    const user = await User.findById(user_id).select('username avatar');

    res.status(201).json({
      success: true,
      message: '发布成功',
      data: {
        ...moment.toObject(),
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('发布朋友圈失败:', error);
    res.status(500).json({
      success: false,
      message: '发布失败，请稍后重试'
    });
  }
};

// 获取朋友圈列表
exports.getMoments = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id } = req.query;
    const current_user_id = req.user.id;

    const query = { is_deleted: false };
    if (user_id) {
      query.user_id = user_id;
    }

    const moments = await Moment.find(query)
      .populate('user_id', 'username avatar gender age')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 检查当前用户是否点赞
    const momentIds = moments.map(m => m._id);
    const likes = await MomentLike.find({
      moment_id: { $in: momentIds },
      user_id: current_user_id
    });
    const likedMomentIds = new Set(likes.map(l => l.moment_id.toString()));

    const total = await Moment.countDocuments(query);

    res.json({
      success: true,
      data: {
        moments: moments.map(moment => ({
          ...moment.toObject(),
          is_liked: likedMomentIds.has(moment._id.toString())
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取朋友圈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 获取我的朋友圈
exports.getMyMoments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    const query = { user_id, is_deleted: false };

    const moments = await Moment.find(query)
      .populate('user_id', 'username avatar gender age')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Moment.countDocuments(query);

    res.json({
      success: true,
      data: {
        moments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取我的朋友圈失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 删除朋友圈
exports.deleteMoment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const moment = await Moment.findOne({ _id: id, user_id });
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在或无权删除'
      });
    }

    moment.is_deleted = true;
    await moment.save();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除朋友圈失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试'
    });
  }
};

// 点赞朋友圈
exports.likeMoment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const moment = await Moment.findById(id);
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在'
      });
    }

    // 检查是否已点赞
    const existingLike = await MomentLike.findOne({ moment_id: id, user_id });
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: '已经点赞过了'
      });
    }

    // 创建点赞记录
    const like = new MomentLike({ moment_id: id, user_id });
    await like.save();

    // 更新点赞数
    moment.likes_count += 1;
    await moment.save();

    res.json({
      success: true,
      message: '点赞成功',
      data: { likes_count: moment.likes_count }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 取消点赞
exports.unlikeMoment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const like = await MomentLike.findOneAndDelete({ moment_id: id, user_id });
    if (!like) {
      return res.status(404).json({
        success: false,
        message: '点赞记录不存在'
      });
    }

    // 更新点赞数
    const moment = await Moment.findById(id);
    if (moment && moment.likes_count > 0) {
      moment.likes_count -= 1;
      await moment.save();
    }

    res.json({
      success: true,
      message: '取消点赞成功',
      data: { likes_count: moment ? moment.likes_count : 0 }
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 获取评论列表
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await MomentComment.find({ moment_id: id, is_deleted: false })
      .populate('user_id', 'username avatar')
      .populate('reply_to_user_id', 'username avatar')
      .populate('parent_id', 'user_id')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MomentComment.countDocuments({ moment_id: id, is_deleted: false });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 发表评论
exports.createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_id, reply_to_user_id } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '请输入评论内容'
      });
    }

    const comment = new MomentComment({
      moment_id: id,
      user_id,
      content,
      parent_id: parent_id || null,
      reply_to_user_id: reply_to_user_id || null
    });

    await comment.save();

    // 更新评论数
    const moment = await Moment.findById(id);
    if (moment) {
      moment.comments_count += 1;
      await moment.save();
    }

    // 查询用户信息
    const user = await User.findById(user_id).select('username avatar');
    const replyToUser = reply_to_user_id ? await User.findById(reply_to_user_id).select('username avatar') : null;

    res.status(201).json({
      success: true,
      message: '评论成功',
      data: {
        ...comment.toObject(),
        user: {
          id: user._id,
          username: user.username,
          avatar: user.avatar
        },
        reply_to_user: replyToUser ? {
          id: replyToUser._id,
          username: replyToUser.username,
          avatar: replyToUser.avatar
        } : null
      }
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    res.status(500).json({
      success: false,
      message: '评论失败，请稍后重试'
    });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    const comment = await MomentComment.findOne({ _id: comment_id, user_id });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在或无权删除'
      });
    }

    comment.is_deleted = true;
    await comment.save();

    // 更新评论数
    const moment = await Moment.findById(comment.moment_id);
    if (moment && moment.comments_count > 0) {
      moment.comments_count -= 1;
      await moment.save();
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试'
    });
  }
};

// 上传朋友圈图片
exports.uploadMomentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const image_url = `/uploads/moments/${req.file.filename}`;

    res.json({
      success: true,
      message: '上传成功',
      data: { image_url }
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

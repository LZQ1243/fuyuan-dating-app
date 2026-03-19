const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// 获取用户列表
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { keyword, certification_status, is_banned } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { phone: { $regex: keyword, $options: 'i' } },
        { nickname: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (certification_status !== undefined) {
      query.certification_status = parseInt(certification_status);
    }

    if (is_banned !== undefined) {
      query.is_banned = is_banned === 'true';
    }

    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    logger.info(`管理员获取用户列表，共 ${total} 条`);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('获取用户列表失败:', error);
    next(error);
  }
};

// 获取用户详情
exports.getUserDetail = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: user
    });

  } catch (error) {
    logger.error('获取用户详情失败:', error);
    next(error);
  }
};

// 封禁用户
exports.banUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    user.is_banned = true;
    user.ban_reason = reason || '违反平台规定';
    await user.save();

    logger.info(`管理员封禁用户: ${user.phone}, 原因: ${user.ban_reason}`);

    res.json({
      code: 200,
      message: '封禁成功'
    });

  } catch (error) {
    logger.error('封禁用户失败:', error);
    next(error);
  }
};

// 解封用户
exports.unbanUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    user.is_banned = false;
    user.ban_reason = '';
    await user.save();

    logger.info(`管理员解封用户: ${user.phone}`);

    res.json({
      code: 200,
      message: '解封成功'
    });

  } catch (error) {
    logger.error('解封用户失败:', error);
    next(error);
  }
};

// 获取待审核认证
exports.getPendingCertifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.find({ certification_status: 1 })
      .sort({ updated_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ certification_status: 1 });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('获取待审核认证失败:', error);
    next(error);
  }
};

// 通过认证
exports.approveCertification = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    user.certification_status = 2; // 已通过
    await user.save();

    logger.info(`管理员通过用户认证: ${user.phone}`);

    res.json({
      code: 200,
      message: '认证已通过'
    });

  } catch (error) {
    logger.error('通过认证失败:', error);
    next(error);
  }
};

// 拒绝认证
exports.rejectCertification = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { reason } = req.body;

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    user.certification_status = 3; // 已拒绝
    await user.save();

    logger.info(`管理员拒绝用户认证: ${user.phone}, 原因: ${reason}`);

    res.json({
      code: 200,
      message: '认证已拒绝'
    });

  } catch (error) {
    logger.error('拒绝认证失败:', error);
    next(error);
  }
};

// 获取敏感词列表
exports.getSensitiveWords = async (req, res, next) => {
  try {
    const filePath = process.env.SENSITIVE_WORDS_PATH || path.join(__dirname, '../../config/sensitive-words.txt');

    if (!fs.existsSync(filePath)) {
      return res.json({
        code: 200,
        message: '获取成功',
        data: { words: [] }
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const words = content.split('\n').filter(word => word.trim() !== '');

    res.json({
      code: 200,
      message: '获取成功',
      data: { words }
    });

  } catch (error) {
    logger.error('获取敏感词列表失败:', error);
    next(error);
  }
};

// 添加敏感词
exports.addSensitiveWord = async (req, res, next) => {
  try {
    const { word } = req.body;

    if (!word || word.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '敏感词不能为空'
      });
    }

    const filePath = process.env.SENSITIVE_WORDS_PATH || path.join(__dirname, '../../config/sensitive-words.txt');

    let content = '';
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    }

    const words = content.split('\n').filter(w => w.trim() !== '');

    if (words.includes(word.trim())) {
      return res.status(400).json({
        code: 400,
        message: '该敏感词已存在'
      });
    }

    words.push(word.trim());
    fs.writeFileSync(filePath, words.join('\n'));

    // 重新加载敏感词库
    const { loadSensitiveWords } = require('../utils/sensitiveFilter');
    loadSensitiveWords();

    logger.info(`管理员添加敏感词: ${word}`);

    res.json({
      code: 200,
      message: '添加成功'
    });

  } catch (error) {
    logger.error('添加敏感词失败:', error);
    next(error);
  }
};

// 删除敏感词
exports.deleteSensitiveWord = async (req, res, next) => {
  try {
    const { word } = req.params;

    const filePath = process.env.SENSITIVE_WORDS_PATH || path.join(__dirname, '../../config/sensitive-words.txt');

    if (!fs.existsSync(filePath)) {
      return res.json({
        code: 200,
        message: '删除成功'
      });
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const words = content.split('\n').filter(w => w.trim() !== '' && w.trim() !== word);

    fs.writeFileSync(filePath, words.join('\n'));

    // 重新加载敏感词库
    const { loadSensitiveWords } = require('../utils/sensitiveFilter');
    loadSensitiveWords();

    logger.info(`管理员删除敏感词: ${word}`);

    res.json({
      code: 200,
      message: '删除成功'
    });

  } catch (error) {
    logger.error('删除敏感词失败:', error);
    next(error);
  }
};

// 获取统计数据
exports.getStatistics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ online_status: true });
    const bannedUsers = await User.countDocuments({ is_banned: true });
    const certifiedUsers = await User.countDocuments({ certification_status: 2 });

    const pendingCertifications = await User.countDocuments({ certification_status: 1 });

    const totalPosts = await Post.countDocuments({ is_deleted: false });
    const totalMessages = await Message.countDocuments();

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ created_at: { $gte: today } });

    // 残疾类型统计
    const disabilityStats = await User.aggregate([
      {
        $group: {
          _id: '$disability_type',
          count: { $sum: 1 }
        }
      }
    ]);

    logger.info('管理员获取统计数据');

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          certified: certifiedUsers,
          today: todayUsers
        },
        certifications: {
          pending: pendingCertifications
        },
        content: {
          posts: totalPosts,
          messages: totalMessages
        },
        disability: disabilityStats
      }
    });

  } catch (error) {
    logger.error('获取统计数据失败:', error);
    next(error);
  }
};

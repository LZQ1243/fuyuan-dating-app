const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, calculateAge } = require('../utils/index');
const logger = require('../utils/logger');
const { uploadSingle } = require('../middleware/upload');

// 注册
exports.register = [
  body('phone').notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('gender').isIn([1, 2]).withMessage('性别不正确'),
  body('birthday').isISO8601().withMessage('生日格式不正确'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { phone, password, gender, birthday } = req.body;

      // 检查手机号是否已注册
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(409).json({
          code: 409,
          message: '该手机号已注册'
        });
      }

      // 创建用户
      const user = new User({
        phone,
        password,
        gender,
        birthday: new Date(birthday)
      });

      await user.save();

      // 生成token
      const token = generateToken(user.user_id);

      logger.info(`用户注册成功: ${phone}`);

      res.status(201).json({
        code: 200,
        message: '注册成功',
        data: {
          token,
          user: {
            user_id: user.user_id,
            phone: user.phone,
            nickname: user.nickname,
            gender: user.gender,
            avatar: user.avatar
          }
        }
      });

    } catch (error) {
      logger.error('注册失败:', error);
      next(error);
    }
  }
];

// 登录
exports.login = [
  body('phone').notEmpty().withMessage('手机号不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const { phone, password } = req.body;

      // 查找用户
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: '手机号或密码错误'
        });
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          code: 401,
          message: '手机号或密码错误'
        });
      }

      // 检查是否被封禁
      if (user.is_banned) {
        return res.status(403).json({
          code: 403,
          message: '账号已被封禁',
          reason: user.ban_reason
        });
      }

      // 生成token
      const token = generateToken(user.user_id);

      // 更新最后活跃时间
      user.last_active = new Date();
      await user.save();

      logger.info(`用户登录成功: ${phone}`);

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            user_id: user.user_id,
            phone: user.phone,
            nickname: user.nickname,
            gender: user.gender,
            avatar: user.avatar,
            certification_status: user.certification_status
          }
        }
      });

    } catch (error) {
      logger.error('登录失败:', error);
      next(error);
    }
  }
];

// 提交认证
exports.submitCertification = [
  uploadSingle('certification_image'),

  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: '请上传残疾证图片'
        });
      }

      const user = req.user;

      // 更新认证信息
      user.certification_images = [`/uploads/${req.file.filename}`];
      user.certification_status = 1; // 待审核

      await user.save();

      logger.info(`用户提交认证: ${user.phone}`);

      res.json({
        code: 200,
        message: '认证材料已提交，等待审核',
        data: {
          certification_status: user.certification_status
        }
      });

    } catch (error) {
      logger.error('提交认证失败:', error);
      next(error);
    }
  }
];

// 获取当前用户信息
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        user_id: user.user_id,
        phone: user.phone,
        nickname: user.nickname,
        gender: user.gender,
        birthday: user.birthday,
        age: calculateAge(user.birthday),
        avatar: user.avatar,
        disability_type: user.disability_type,
        disability_level: user.disability_level,
        assistive_device: user.assistive_device,
        marital_status: user.marital_status,
        certification_status: user.certification_status,
        certification_images: user.certification_images,
        location: user.location,
        match_preferences: user.match_preferences,
        online_status: user.online_status,
        created_at: user.created_at
      }
    });

  } catch (error) {
    logger.error('获取用户信息失败:', error);
    next(error);
  }
};

// 更新用户信息
exports.updateProfile = async (req, res, next) => {
  try {
    const { nickname, disability_type, disability_level, assistive_device, marital_status, location, match_preferences } = req.body;
    const user = req.user;

    // 防婚骗检查
    if (marital_status === '已婚' && user.marital_status !== '已婚') {
      return res.status(403).json({
        code: 403,
        message: '不能设置婚姻状态为已婚，违反平台规定'
      });
    }

    // 更新字段
    if (nickname !== undefined) user.nickname = nickname;
    if (disability_type !== undefined) user.disability_type = disability_type;
    if (disability_level !== undefined) user.disability_level = disability_level;
    if (assistive_device !== undefined) user.assistive_device = assistive_device;
    if (marital_status !== undefined) user.marital_status = marital_status;
    if (location !== undefined) user.location = { ...user.location, ...location };
    if (match_preferences !== undefined) user.match_preferences = { ...user.match_preferences, ...match_preferences };

    await user.save();

    logger.info(`用户更新信息: ${user.phone}`);

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        user_id: user.user_id,
        nickname: user.nickname,
        disability_type: user.disability_type,
        disability_level: user.disability_level,
        assistive_device: user.assistive_device,
        marital_status: user.marital_status,
        location: user.location,
        match_preferences: user.match_preferences
      }
    });

  } catch (error) {
    logger.error('更新用户信息失败:', error);
    next(error);
  }
};

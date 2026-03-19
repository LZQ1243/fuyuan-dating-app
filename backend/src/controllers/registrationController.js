const UserMySQL = require('../models/UserMySQL');
const MarriageCertification = require('../models/MarriageCertification');
const AIService = require('../services/AIService');
const logger = require('../utils/logger');

// 强制流程引导 - 路由守卫
exports.registrationGuard = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '未登录'
      });
    }

    // 检查注册步骤是否完成
    if (user.registration_step < 5) {
      const stepPages = [
        '/step/basic-info',
        '/step/id-verification',
        '/step/disability-cert',
        '/step/marriage-cert',
        '/step/final-review'
      ];

      const requiredPage = stepPages[user.registration_step - 1];

      if (req.path !== requiredPage && !req.path.startsWith('/api/')) {
        return res.status(302).json({
          code: 302,
          message: '请完成注册流程',
          redirect: requiredPage
        });
      }
    }

    next();
  } catch (error) {
    logger.error('注册守卫失败:', error);
    next(error);
  }
};

// 提交基础信息
exports.submitBasicInfo = async (req, res, next) => {
  try {
    const { username, real_name, phone, password, gender, birthday } = req.body;
    const user = req.user;

    // 更新基础信息
    await UserMySQL.update(user.id, {
      username,
      real_name,
      phone,
      gender,
      birthday
    });

    // 更新注册步骤
    await UserMySQL.updateRegistrationStep(user.id, 2);

    res.json({
      code: 200,
      message: '基础信息提交成功',
      data: {
        current_step: 2
      }
    });
  } catch (error) {
    logger.error('提交基础信息失败:', error);
    next(error);
  }
};

// 提交身份认证（人脸识别）
exports.submitIdVerification = async (req, res, next) => {
  try {
    const { id_card, face_image, id_card_image } = req.body;
    const user = req.user;

    // AI人脸识别验证
    const faceResult = await AIService.faceDetection(face_image);

    if (!faceResult.success) {
      return res.status(400).json({
        code: 400,
        message: '人脸识别失败',
        error: faceResult.error
      });
    }

    // 更新用户信息
    await UserMySQL.update(user.id, {
      id_card,
      face_verified: 1
    });

    // 更新注册步骤
    await UserMySQL.updateRegistrationStep(user.id, 3);

    res.json({
      code: 200,
      message: '身份认证成功',
      data: {
        face_count: faceResult.faces ? faceResult.faces.length : 0
      }
    });
  } catch (error) {
    logger.error('身份认证失败:', error);
    next(error);
  }
};

// 残疾人认证流程
exports.submitDisabilityCert = async (req, res, next) => {
  try {
    const user = req.user;
    const { disability_type, disability_level, disability_photo, activity_video } = req.body;

    if (!user.is_disabled) {
      // 健全人走简化流程
      return res.json({
        code: 200,
        message: '认证信息提交成功',
        data: {
          skip_detailed_cert: true
        }
      });
    }

    // 残疾人走严格流程
    if (!disability_photo) {
      return res.status(400).json({
        code: 400,
        message: '必须上传残疾部位照片'
      });
    }

    if (!activity_video) {
      return res.status(400).json({
        code: 400,
        message: '必须上传日常活动视频'
      });
    }

    // 更新残疾信息
    await UserMySQL.update(user.id, {
      disability_type,
      disability_level,
      disability_photo,
      disability_video: activity_video
    });

    // 更新注册步骤
    await UserMySQL.updateRegistrationStep(user.id, 4);

    res.json({
      code: 200,
      message: '残疾认证信息提交成功',
      data: {
        current_step: 4
      }
    });
  } catch (error) {
    logger.error('残疾认证失败:', error);
    next(error);
  }
};

// 婚姻认证（含电子签名和防婚骗检测）
exports.submitMarriageCert = async (req, res, next) => {
  try {
    const user = req.user;
    const { certification_type, certification_images, signature_image } = req.body;

    // 查询真实婚姻状态
    const marriageResult = await AIService.queryMarriageStatus(user.id_card);

    if (marriageResult.status === '已婚') {
      // 防婚骗熔断：自动清除用户数据
      await UserMySQL.deleteById(user.id);
      await MarriageCertification.deleteByUserId(user.id);

      logger.warn(`防婚骗：已婚用户 ${user.id} 数据已自动清除`);

      return res.status(403).json({
        code: 403,
        message: '已婚用户数据已自动清除'
      });
    }

    // 创建婚姻认证记录
    const certId = await MarriageCertification.create({
      user_id: user.id,
      certification_type,
      certification_images: certification_images || [],
      signature_image
    });

    // 更新用户婚姻状况
    await UserMySQL.update(user.id, {
      marital_status: certification_type === 1 ? '未婚' : certification_type === 2 ? '离异' : '丧偶'
    });

    // 更新注册步骤
    await UserMySQL.updateRegistrationStep(user.id, 5);

    // 更新用户状态为正常
    await UserMySQL.updateStatus(user.id, 1);

    res.json({
      code: 200,
      message: '婚姻认证成功',
      data: {
        cert_id,
        status: 'completed'
      }
    });
  } catch (error) {
    logger.error('婚姻认证失败:', error);
    next(error);
  }
};

// 获取当前注册步骤
exports.getRegistrationStep = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '未登录'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        registration_step: user.registration_step,
        total_steps: 5
      }
    });
  } catch (error) {
    logger.error('获取注册步骤失败:', error);
    next(error);
  }
};

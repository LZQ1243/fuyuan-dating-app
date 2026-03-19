const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

// 获取用户信息（可访问）
router.get('/:user_id', optionalAuth, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { calculateAge } = require('../utils/index');

    const user = await User.findOne({ user_id: req.params.user_id });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        user_id: user.user_id,
        nickname: user.nickname || '未设置昵称',
        gender: user.gender,
        age: calculateAge(user.birthday),
        avatar: user.avatar,
        disability_type: user.disability_type,
        disability_level: user.disability_level,
        assistive_device: user.assistive_device,
        location: {
          city: user.location?.city || '',
          district: user.location?.district || ''
        },
        online_status: user.online_status,
        certification_status: user.certification_status
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

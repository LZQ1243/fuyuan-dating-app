const User = require('../models/User');

// 检查是否是管理员
const isAdmin = async (req, res, next) => {
  try {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    // 检查是否是管理员账号
    if (req.user.phone === ADMIN_USERNAME) {
      // 验证密码（实际应该使用更安全的方式）
      const user = await User.findOne({ phone: ADMIN_USERNAME });
      if (user) {
        next();
        return;
      }
    }

    res.status(403).json({
      code: 403,
      message: '无权访问'
    });

  } catch (error) {
    console.error('管理员权限检查失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

module.exports = {
  isAdmin
};

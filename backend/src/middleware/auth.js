const { verifyToken } = require('../utils/index');
const logger = require('../utils/logger');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        code: 401,
        message: '令牌无效或已过期'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在'
      });
    }

    if (user.is_banned) {
      return res.status(403).json({
        code: 403,
        message: '账号已被封禁'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('认证中间件错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user && !user.is_banned) {
          req.user = user;
        }
      }
    }

    next();

  } catch (error) {
    logger.error('可选认证中间件错误:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      code: 400,
      message: '验证失败',
      errors
    });
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      code: 409,
      message: `${field} 已存在`
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '令牌无效'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '令牌已过期'
    });
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message
  });
};

module.exports = errorHandler;

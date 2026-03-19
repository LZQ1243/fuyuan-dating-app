/**
 * 统一错误处理器
 * 减少重复的错误处理代码
 */

const logger = require('../config/logger');

/**
 * API错误类
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

/**
 * 异步错误捕获装饰器
 * 自动捕获异步函数中的错误并传递给next
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 成功响应
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * 错误响应
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * 统一错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // 处理已知错误类型
  if (err instanceof ApiError) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      err.errors
    );
  }

  // 验证错误 (express-validator)
  if (err.name === 'ValidationError' || Array.isArray(err)) {
    const errors = Array.isArray(err) ? err : [err];
    const formattedErrors = errors.map(e => ({
      field: e.param || e.path,
      message: e.msg || e.message
    }));

    return errorResponse(
      res,
      400,
      'Validation failed',
      formattedErrors
    );
  }

  // MongoDB验证错误
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return errorResponse(
      res,
      400,
      'Validation failed',
      errors
    );
  }

  // MongoDB重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(
      res,
      409,
      `${field} already exists`
    );
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }

  // CSRF错误
  if (err.code === 'EBADCSRFTOKEN') {
    return errorResponse(res, 403, 'Invalid CSRF token');
  }

  // 文件上传错误
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File too large');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 400, 'Unexpected file field');
    }
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return errorResponse(res, statusCode, message);
};

/**
 * 创建404错误
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};

/**
 * 验证错误助手
 */
const createValidationError = (field, message) => {
  return new ApiError(400, 'Validation failed', [{ field, message }]);
};

/**
 * 认证错误助手
 */
const createAuthError = (message = 'Authentication failed') => {
  return new ApiError(401, message);
};

/**
 * 权限错误助手
 */
const createForbiddenError = (message = 'Access denied') => {
  return new ApiError(403, message);
};

/**
 * 未找到错误助手
 */
const createNotFoundError = (message = 'Resource not found') => {
  return new ApiError(404, message);
};

/**
 * 冲突错误助手
 */
const createConflictError = (message = 'Resource already exists') => {
  return new ApiError(409, message);
};

module.exports = {
  ApiError,
  asyncHandler,
  successResponse,
  errorResponse,
  errorHandler,
  notFound,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createConflictError
};

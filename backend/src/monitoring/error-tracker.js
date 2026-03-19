/**
 * 错误追踪
 * 捕获和追踪应用错误
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
  }

  /**
   * 捕获错误
   */
  captureError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      context,
      type: this.getErrorType(error)
    };

    this.errors.push(errorInfo);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 记录到日志
    console.error('Error captured:', errorInfo);

    return errorInfo;
  }

  /**
   * 捕获未处理的异常
   */
  captureException(error, context = {}) {
    return this.captureError(error, {
      ...context,
      unhandled: true
    });
  }

  /**
   * 捕获Promise拒绝
   */
  captureRejection(reason, promise, context = {}) {
    return this.captureError(new Error(String(reason)), {
      ...context,
      rejection: true,
      promise: promise.toString()
    });
  }

  /**
   * 获取错误类型
   */
  getErrorType(error) {
    if (error.name === 'ValidationError') return 'validation';
    if (error.name === 'MongoError') return 'database';
    if (error.name === 'SyntaxError') return 'syntax';
    if (error.name === 'TypeError') return 'type';
    if (error.name === 'ReferenceError') return 'reference';
    if (error.name === 'RangeError') return 'range';
    if (error.code && error.code.startsWith('AUTH')) return 'auth';
    if (error.code && error.code.startsWith('PERM')) return 'permission';
    return 'unknown';
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      byName: {},
      recent: this.errors.slice(-10),
      topErrors: this.getTopErrors(5)
    };

    this.errors.forEach(error => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // 按名称统计
      stats.byName[error.name] = (stats.byName[error.name] || 0) + 1;
    });

    return stats;
  }

  /**
   * 获取最常见的错误
   */
  getTopErrors(limit = 5) {
    const errorCounts = {};

    this.errors.forEach(error => {
      const key = `${error.name}: ${error.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([message, count]) => ({ message, count }));
  }

  /**
   * 清除旧错误
   */
  clearOldErrors(olderThan = 86400000) { // 默认保留24小时内的错误
    const now = new Date();
    const cutoff = new Date(now - olderThan);

    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * 清除所有错误
   */
  clearAllErrors() {
    this.errors = [];
  }

  /**
   * 获取错误报告
   */
  getErrorReport() {
    return {
      timestamp: new Date(),
      stats: this.getErrorStats(),
      errors: this.errors.slice(-100) // 返回最近100个错误
    };
  }

  /**
   * 导出错误报告
   */
  exportErrorReport() {
    const report = this.getErrorReport();
    const fs = require('fs');
    const path = require('path');

    const reportsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(
      reportsDir,
      `error-report-${Date.now()}.json`
    );

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return reportPath;
  }

  /**
   * 初始化全局错误处理
   */
  initializeGlobalHandlers() {
    // 捕获未处理的异常
    process.on('uncaughtException', (error) => {
      this.captureException(error, { source: 'uncaughtException' });

      // 记录后退出
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // 捕获未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      this.captureRejection(reason, promise, { source: 'unhandledRejection' });
    });

    console.log('✅ 全局错误处理器已初始化');
  }

  /**
   * 创建Express错误处理中间件
   */
  expressMiddleware() {
    return (err, req, res, next) => {
      this.captureError(err, {
        source: 'express',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // 发送错误响应
      res.status(err.status || 500).json({
        success: false,
        error: {
          message: err.message || 'Internal Server Error',
          code: err.code || 'INTERNAL_ERROR'
        }
      });
    };
  }
}

module.exports = new ErrorTracker();

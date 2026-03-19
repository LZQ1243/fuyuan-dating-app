/**
 * IP白名单中间件
 * 验证请求的IP地址是否在白名单中
 */

const ip = require('ip');
const config = require('../config/ip-whitelist');

class IPWhitelist {
  /**
   * 解析IP地址
   */
  static parseIP(req) {
    // 从X-Forwarded-For获取真实IP (可能有多个,取第一个)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    // 从X-Real-IP获取
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
      return realIP;
    }

    // 从连接获取
    return req.ip || req.socket.remoteAddress;
  }

  /**
   * 检查IP是否在CIDR范围内
   */
  static isIPInRange(requestIP, range) {
    // 如果是单个IP地址
    if (range.includes('/')) {
      return ip.cidrSubnet(range).contains(requestIP);
    }

    // 如果是单个IP
    return requestIP === range;
  }

  /**
   * 检查IP是否在白名单中
   */
  static isIPWhitelisted(requestIP, whitelist) {
    // 如果白名单为空,允许所有IP
    if (!whitelist || whitelist.length === 0) {
      return true;
    }

    // 检查是否在白名单中
    return whitelist.some(range => this.isIPInRange(requestIP, range));
  }

  /**
   * IP白名单验证中间件
   */
  static middleware(options = {}) {
    const {
      whitelistKey = 'api', // 默认使用API白名单
      allowAll = false,     // 是否允许所有IP
      onReject = null       // 拒绝时的回调
    } = options;

    return (req, res, next) => {
      try {
        // 如果允许所有IP,直接通过
        if (allowAll) {
          return next();
        }

        // 获取请求IP
        const requestIP = this.parseIP(req);

        // 获取白名单
        const whitelist = config[whitelistKey] || config.api;

        // 验证IP
        const isWhitelisted = this.isIPWhitelisted(requestIP, whitelist);

        if (!isWhitelisted) {
          const error = {
            message: 'IP address not allowed',
            code: 'IP_NOT_ALLOWED',
            ip: requestIP
          };

          // 调用拒绝回调
          if (onReject) {
            onReject(req, error);
          }

          return res.status(403).json({
            success: false,
            error
          });
        }

        // 验证通过
        next();
      } catch (error) {
        console.error('IP whitelist validation error:', error);
        return res.status(500).json({
          success: false,
          error: {
            message: 'IP whitelist validation failed',
            code: 'IP_VALIDATION_ERROR'
          }
        });
      }
    };
  }

  /**
   * 管理后台IP白名单中间件
   */
  static adminMiddleware() {
    return this.middleware({
      whitelistKey: 'admin',
      allowAll: false
    });
  }

  /**
   * 敏感操作IP白名单中间件
   */
  static sensitiveMiddleware() {
    return this.middleware({
      whitelistKey: 'sensitive',
      allowAll: false
    });
  }

  /**
   * 测试环境IP白名单中间件
   */
  static testMiddleware() {
    return this.middleware({
      whitelistKey: 'test',
      allowAll: false
    });
  }

  /**
   * 生产环境IP白名单中间件
   */
  static productionMiddleware() {
    return this.middleware({
      whitelistKey: 'production',
      allowAll: false
    });
  }
}

module.exports = IPWhitelist;

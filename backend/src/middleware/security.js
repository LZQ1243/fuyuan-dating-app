/**
 * 安全中间件
 * 提供CSRF、XSS、CSP等安全防护
 */

const csrf = require('csurf');
const helmet = require('helmet');

// CSRF保护配置
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1小时
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

/**
 * XSS防护中间件
 * 使用helmet的contentSecurityPolicy
 */
const xssProtection = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production'
  }
});

/**
 * 额外的安全头
 */
const securityHeaders = helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: {
    action: 'deny'
  },
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

/**
 * 清理HTML输入,防止XSS
 */
const sanitizeHtml = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // 基本的XSS清理
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // 清理请求体
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // 清理查询参数
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

/**
 * 限流配置
 */
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100次请求
  message: {
    error: '请求过于频繁,请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
};

/**
 * API限流 - 更严格
 */
const apiRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'API请求过于频繁'
  }
};

/**
 * 登录限流 - 更严格
 */
const loginRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: '登录尝试次数过多,请15分钟后再试'
  }
};

module.exports = {
  csrfProtection,
  xssProtection,
  securityHeaders,
  sanitizeHtml,
  rateLimitConfig,
  apiRateLimitConfig,
  loginRateLimitConfig
};

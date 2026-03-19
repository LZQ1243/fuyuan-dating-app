/**
 * API频率限制配置
 * 配置不同API的请求频率限制
 */

module.exports = {
  // 基础API限制
  basic: {
    windowMs: 60 * 1000, // 1分钟
    max: 100,            // 100次
    standardHeaders: true,
    legacyHeaders: false
  },

  // 登录API限制 (严格)
  auth: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10,                   // 10次
    skipSuccessfulRequests: true,
    message: {
      success: false,
      error: {
        message: 'Too many login attempts, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // 敏感API限制 (非常严格)
  sensitive: {
    windowMs: 60 * 1000, // 1分钟
    max: 5,               // 5次
    message: {
      success: false,
      error: {
        message: 'Too many requests to sensitive endpoint',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // 文件上传限制
  upload: {
    windowMs: 60 * 1000, // 1分钟
    max: 10,              // 10次
    message: {
      success: false,
      error: {
        message: 'Too many upload requests',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // 搜索API限制
  search: {
    windowMs: 60 * 1000, // 1分钟
    max: 30,              // 30次
    message: {
      success: false,
      error: {
        message: 'Too many search requests',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // 聊天API限制
  chat: {
    windowMs: 60 * 1000, // 1分钟
    max: 60,              // 60次
    message: {
      success: false,
      error: {
        message: 'Too many chat messages',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // 基于用户的限制 (不同用户类型有不同限制)
  byUserType: {
    normal: {
      windowMs: 60 * 1000, // 1分钟
      max: 100             // 普通用户: 100次/分钟
    },
    vip: {
      windowMs: 60 * 1000, // 1分钟
      max: 500              // VIP用户: 500次/分钟
    },
    enterprise: {
      windowMs: 60 * 1000, // 1分钟
      max: 1000            // 企业用户: 1000次/分钟
    }
  },

  // 基于IP的限制 (防止IP滥用)
  byIP: {
    windowMs: 60 * 1000, // 1分钟
    max: 200             // 每个IP: 200次/分钟
  },

  // 突发限制 (允许短时间内的突发流量)
  burst: {
    windowMs: 60 * 1000, // 1分钟
    max: 200,             // 突发: 200次
    standardHeaders: true,
    legacyHeaders: false
  },

  // WebSocket连接限制
  websocket: {
    windowMs: 60 * 1000, // 1分钟
    max: 10,              // 10个连接
    message: {
      success: false,
      error: {
        message: 'Too many WebSocket connections',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  }
};

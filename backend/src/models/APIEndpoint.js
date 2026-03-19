const mongoose = require('mongoose');

/**
 * API端点模型
 * 用于管理系统的所有API端点
 */
const apiEndpointSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true,
    comment: '接口名称'
  },
  description: {
    type: String,
    trim: true,
    comment: '接口描述'
  },

  // 路由信息
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    comment: 'HTTP方法'
  },
  path: {
    type: String,
    required: true,
    trim: true,
    comment: 'API路径'
  },

  // 分类信息
  module: {
    type: String,
    required: true,
    enum: ['auth', 'user', 'admin', 'match', 'chat', 'post', 'config', 'upload', 'liveRooms', 'registration', 'accessibility', 'reports', 'sensitiveWords', 'shortVideo'],
    comment: '所属模块'
  },
  category: {
    type: String,
    trim: true,
    comment: '分类'
  },

  // 权限信息
  requiresAuth: {
    type: Boolean,
    default: true,
    comment: '是否需要认证'
  },
  requiresAdmin: {
    type: Boolean,
    default: false,
    comment: '是否需要管理员权限'
  },

  // 状态
  enabled: {
    type: Boolean,
    default: true,
    comment: '是否启用'
  },

  // 参数定义
  parameters: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array']
    },
    required: Boolean,
    description: String,
    defaultValue: mongoose.Schema.Types.Mixed
  }],

  // 响应定义
  responseSchema: {
    type: mongoose.Schema.Types.Mixed,
    comment: '响应结构'
  },

  // 测试信息
  testEndpoint: {
    type: String,
    trim: true,
    comment: '测试端点地址'
  },
  lastTestedAt: {
    type: Date,
    comment: '最后测试时间'
  },
  testResult: {
    status: {
      type: String,
      enum: ['success', 'failed', 'untested'],
      default: 'untested'
    },
    statusCode: Number,
    responseTime: Number,
    errorMessage: String
  },

  // 文档
  documentation: {
    type: String,
    comment: '文档URL'
  },

  // 标签
  tags: [String],

  // 备注信息
  notes: String,

  // 操作记录
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    comment: '创建者'
  },
  updatedBy: {
    type: String,
    comment: '最后更新者'
  }
}, {
  timestamps: true
});

// 索引
apiEndpointSchema.index({ method: 1, path: 1 }, { unique: true });
apiEndpointSchema.index({ module: 1 });
apiEndpointSchema.index({ enabled: 1 });
apiEndpointSchema.index({ createdAt: -1 });

module.exports = mongoose.model('APIEndpoint', apiEndpointSchema);

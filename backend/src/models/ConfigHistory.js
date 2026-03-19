const mongoose = require('mongoose');

/**
 * 配置历史记录表
 * 记录所有配置变更，用于审计和回滚
 */
const configHistorySchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    comment: '配置源（如：admin、api、system）'
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true,
    comment: '操作类型'
  },
  old_value: {
    type: Object,
    default: {},
    comment: '旧配置值'
  },
  new_value: {
    type: Object,
    required: true,
    comment: '新配置值'
  },
  operator: {
    type: String,
    comment: '操作者'
  },
  reason: {
    type: String,
    default: '',
    comment: '操作原因'
  },
  created_at: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'config_histories'
});

// 创建索引
configHistorySchema.index({ source: 1, created_at: -1 });
configHistorySchema.index({ action: 1, created_at: -1 });

module.exports = mongoose.model('ConfigHistory', configHistorySchema);

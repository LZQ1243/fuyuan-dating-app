const mongoose = require('mongoose');

/**
 * 用户黑名单表
 * 用户可以屏蔽其他用户，阻止查看和互动
 */
const userBlacklistSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
    comment: '用户ID'
  },
  blocked_user_id: {
    type: String,
    required: true,
    index: true,
    comment: '被屏蔽的用户ID'
  },
  reason: {
    type: String,
    enum: ['骚扰', '诈骗', '虚假信息', '其他'],
    default: '其他',
    comment: '屏蔽原因'
  },
  remark: {
    type: String,
    default: '',
    comment: '备注'
  },
  created_at: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'user_blacklists'
});

// 创建唯一索引（同一用户不能重复屏蔽同一人）
userBlacklistSchema.index({ user_id: 1, blocked_user_id: 1 }, { unique: true });
userBlacklistSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('UserBlacklist', userBlacklistSchema);

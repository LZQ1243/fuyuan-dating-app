const mongoose = require('mongoose');

/**
 * 匹配历史记录表
 * 记录用户的匹配行为，包括查看、喜欢、不喜欢、收藏、聊天等
 */
const matchHistorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
    comment: '用户ID'
  },
  target_user_id: {
    type: String,
    required: true,
    index: true,
    comment: '目标用户ID'
  },
  match_score: {
    type: Number,
    default: 0,
    comment: '匹配得分'
  },
  match_reason: {
    type: String,
    default: '',
    comment: '匹配原因'
  },
  action: {
    type: String,
    enum: ['view', 'like', 'dislike', 'skip', 'chat', 'collect'],
    default: 'view',
    comment: '操作类型'
  },
  created_at: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'match_histories'
});

// 创建索引
matchHistorySchema.index({ user_id: 1, created_at: -1 });
matchHistorySchema.index({ target_user_id: 1 });

module.exports = mongoose.model('MatchHistory', matchHistorySchema);

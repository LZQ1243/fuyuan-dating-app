const mongoose = require('mongoose');

/**
 * 用户收藏表
 * 用户收藏其他用户，可以添加标签和备注
 */
const userFavoriteSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
    comment: '用户ID'
  },
  favorite_user_id: {
    type: String,
    required: true,
    index: true,
    comment: '收藏的用户ID'
  },
  note: {
    type: String,
    default: '',
    comment: '收藏备注'
  },
  tags: [{
    type: String,
    comment: '标签'
  }],
  is_mutual: {
    type: Boolean,
    default: false,
    comment: '是否相互收藏'
  },
  created_at: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'user_favorites'
});

// 创建唯一索引（同一用户不能重复收藏同一人）
userFavoriteSchema.index({ user_id: 1, favorite_user_id: 1 }, { unique: true });
userFavoriteSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('UserFavorite', userFavoriteSchema);

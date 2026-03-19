const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MomentLikeSchema = new Schema({
  moment_id: {
    type: Schema.Types.ObjectId,
    ref: 'Moment',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 复合唯一索引，确保同一用户对同一朋友圈只能点赞一次
MomentLikeSchema.index({ moment_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('MomentLike', MomentLikeSchema);

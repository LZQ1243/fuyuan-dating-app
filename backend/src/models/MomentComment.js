const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MomentCommentSchema = new Schema({
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
  content: {
    type: String,
    required: true,
    maxlength: 200
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'MomentComment',
    default: null
  },
  reply_to_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 索引
MomentCommentSchema.index({ moment_id: 1 });
MomentCommentSchema.index({ user_id: 1 });
MomentCommentSchema.index({ parent_id: 1 });

module.exports = mongoose.model('MomentComment', MomentCommentSchema);

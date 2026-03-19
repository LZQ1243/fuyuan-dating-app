const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LiveCommentSchema = new Schema({
  room_id: {
    type: Schema.Types.ObjectId,
    ref: 'LiveRoom',
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
    maxlength: 200,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'system', 'gift', 'like'],
    default: 'text'
  },
  gift_info: {
    name: String,
    icon: String,
    count: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 索引
LiveCommentSchema.index({ room_id: 1, created_at: -1 });
LiveCommentSchema.index({ user_id: 1 });
LiveCommentSchema.index({ type: 1 });

module.exports = mongoose.model('LiveComment', LiveCommentSchema);

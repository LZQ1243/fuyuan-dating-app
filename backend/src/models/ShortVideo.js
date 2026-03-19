const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShortVideoSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  video_url: {
    type: String,
    required: true
  },
  cover_image: {
    type: String
  },
  duration: {
    type: Number,
    default: 30 // 秒
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  is_private: {
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
ShortVideoSchema.index({ user_id: 1 });
ShortVideoSchema.index({ status: 1 });
ShortVideoSchema.index({ created_at: -1 });
ShortVideoSchema.index({ views: -1 });

module.exports = mongoose.model('ShortVideo', ShortVideoSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MomentSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  images: [{
    type: String
  }],
  video_url: {
    type: String
  },
  location: {
    type: String,
    maxlength: 100
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
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
MomentSchema.index({ user_id: 1 });
MomentSchema.index({ created_at: -1 });
MomentSchema.index({ is_deleted: 1 });

module.exports = mongoose.model('Moment', MomentSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LiveRoomSchema = new Schema({
  host_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  cover_image: {
    type: String
  },
  stream_url: {
    type: String,
    required: true
  },
  stream_key: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['chat', 'game', 'music', 'other'],
    default: 'chat'
  },
  tags: [{
    type: String,
    maxlength: 20
  }],
  viewer_count: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  },
  gift_count: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['waiting', 'live', 'ended'],
    default: 'waiting'
  },
  start_time: {
    type: Date
  },
  end_time: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  is_private: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  max_viewers: {
    type: Number,
    default: 1000
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
LiveRoomSchema.index({ host_id: 1, status: 1 });
LiveRoomSchema.index({ status: 1, created_at: -1 });
LiveRoomSchema.index({ category: 1 });
LiveRoomSchema.index({ tags: 1 });
LiveRoomSchema.index({ stream_key: 1 }, { unique: true });

// 更新时间中间件
LiveRoomSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('LiveRoom', LiveRoomSchema);

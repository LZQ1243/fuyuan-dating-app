const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserPackageSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package_id: {
    type: Schema.Types.ObjectId,
    ref: 'ShortVideoPackage',
    required: true
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date,
    required: true
  },
  remaining_videos: {
    type: Number,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 索引
UserPackageSchema.index({ user_id: 1, is_active: 1 });
UserPackageSchema.index({ user_id: 1, package_id: 1 });

module.exports = mongoose.model('UserPackage', UserPackageSchema);

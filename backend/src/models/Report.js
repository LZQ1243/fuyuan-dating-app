const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 举报模型 - 处理内容举报和用户举报
 */

const ReportSchema = new Schema({
  reporter_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content_type: {
    type: String,
    enum: ['post', 'moment', 'video', 'live', 'user'],
    required: true
  },
  content_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  content_url: {
    type: String
  },
  reported_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    required: true,
    enum: ['content_violation', 'harassment', 'fraud', 'spam', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  action_taken: {
    type: String,
    enum: ['deleted', 'warned', 'ignored', 'banned']
  },
  reviewed_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 索引
ReportSchema.index({ reporter_id: 1, status: 1 });
ReportSchema.index({ content_type: 1, content_id: 1 });
ReportSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model('Report', ReportSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LiveViewerSchema = new Schema({
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
  join_time: {
    type: Date,
    default: Date.now
  },
  leave_time: {
    type: Date
  },
  watch_duration: {
    type: Number,
    default: 0
  },
  is_online: {
    type: Boolean,
    default: true
  }
});

// 唯一索引：同一用户在同一房间只能有一条在线记录
LiveViewerSchema.index({ room_id: 1, user_id: 1, is_online: 1 });
LiveViewerSchema.index({ room_id: 1, is_online: 1 });

module.exports = mongoose.model('LiveViewer', LiveViewerSchema);

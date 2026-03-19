const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  sender_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiver_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  // 已读状态 - 接收方查看消息后标记为已读
  is_read: {
    type: Boolean,
    default: false
  },
  is_revoked: {
    type: Boolean,
    default: false
  },
  // 发送方已读标记 - 发送方查看消息后标记
  sender_read_at: {
    type: Date
  },
  // 接收方已读标记 - 接收方查看消息后标记
  receiver_read_at: {
    type: Date
  },
  // 消息读取记录 - 记录哪些设备/平台查看了消息
  read_records: [{
    user_id: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['app', 'miniprogram', 'wechat', 'h5'],
      required: true
    },
    device_id: String,
    read_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// 索引
messageSchema.index({ sender_id: 1, receiver_id: 1, timestamp: -1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });
messageSchema.index({ sender_id: 1, receiver_id: 1, is_read: 1 });

// 虚拟字段 - 判断消息是否已读(双方任意一方查看)
messageSchema.virtual('is_read_by_any').get(function() {
  return this.is_read || this.sender_read_at || this.receiver_read_at;
});

// 虚拟字段 - 获取最后一次阅读信息
messageSchema.virtual('last_read_info').get(function() {
  if (!this.read_records || this.read_records.length === 0) {
    return null;
  }
  return this.read_records[this.read_records.length - 1];
});

// 更新消息已读状态的方法
messageSchema.methods.markAsReadByUser = function(userId, platform, deviceId) {
  // 如果消息是当前用户发送的
  if (this.sender_id === userId) {
    if (!this.sender_read_at) {
      this.sender_read_at = new Date();
    }
  }
  // 如果消息是发送给当前用户的
  else if (this.receiver_id === userId) {
    if (!this.receiver_read_at) {
      this.receiver_read_at = new Date();
      this.is_read = true;
    }
  }

  // 添加阅读记录
  const existingRecord = this.read_records.find(
    record => record.user_id === userId && record.platform === platform
  );

  if (!existingRecord) {
    this.read_records.push({
      user_id: userId,
      platform,
      device_id: deviceId,
      read_at: new Date()
    });
  }

  return this.save();
};

messageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Message', messageSchema);

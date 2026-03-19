const mongoose = require('mongoose');

/**
 * 配置快照表
 * 保存配置的完整快照，用于备份和恢复
 */
const configSnapshotSchema = new mongoose.Schema({
  snapshot_id: {
    type: String,
    required: true,
    unique: true,
    comment: '快照ID'
  },
  name: {
    type: String,
    required: true,
    comment: '快照名称'
  },
  description: {
    type: String,
    default: '',
    comment: '快照描述'
  },
  configs: {
    type: Object,
    required: true,
    comment: '所有配置数据'
  },
  created_at: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'config_snapshots'
});

// 创建索引
configSnapshotSchema.index({ name: 1, created_at: -1 });

module.exports = mongoose.model('ConfigSnapshot', configSnapshotSchema);

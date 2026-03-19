const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    trim: true,
    default: ''
  },
  gender: {
    type: Number,
    enum: [1, 2], // 1:男, 2:女
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  disability_type: {
    type: String,
    enum: ['视力', '听力', '言语', '肢体', '智力', '精神', '多重', '无'],
    default: '无'
  },
  disability_level: {
    type: Number,
    enum: [1, 2, 3, 4], // 1-4级
    default: 1
  },
  assistive_device: {
    type: String,
    default: ''
  },
  marital_status: {
    type: String,
    enum: ['未婚', '已婚', '离异', '丧偶'],
    default: '未婚'
  },
  certification_status: {
    type: Number,
    enum: [0, 1, 2, 3], // 0:未认证, 1:待审核, 2:已通过, 3:已拒绝
    default: 0
  },
  certification_images: [{
    type: String
  }],
  location: {
    province: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: ''
    },
    longitude: {
      type: Number,
      default: 0
    },
    latitude: {
      type: Number,
      default: 0
    }
  },
  match_preferences: {
    types: [{
      type: String
    }],
    levels: [{
      type: Number
    }],
    age_min: {
      type: Number,
      default: 18
    },
    age_max: {
      type: Number,
      default: 80
    }
  },
  online_status: {
    type: Boolean,
    default: false
  },
  is_banned: {
    type: Boolean,
    default: false
  },
  ban_reason: {
    type: String,
    default: ''
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 索引
userSchema.index({ phone: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ disability_type: 1 });
userSchema.index({ certification_status: 1 });
userSchema.index({ location.city: 1 });

// 密码加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 防婚骗熔断
userSchema.pre('save', function(next) {
  if (this.isModified('marital_status') && this.marital_status === '已婚') {
    this.is_banned = true;
    this.ban_reason = '婚姻状态为已婚，违反平台规定';
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

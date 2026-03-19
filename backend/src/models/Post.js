const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new mongoose.Schema({
  comment_id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  media_urls: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  comments: [commentSchema],
  is_private: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 索引
postSchema.index({ user_id: 1, created_at: -1 });
postSchema.index({ created_at: -1 });

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);

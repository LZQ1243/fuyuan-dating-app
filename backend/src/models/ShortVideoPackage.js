const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShortVideoPackageSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200
  },
  video_limit: {
    type: Number,
    required: true
  },
  validity_days: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

module.exports = mongoose.model('ShortVideoPackage', ShortVideoPackageSchema);

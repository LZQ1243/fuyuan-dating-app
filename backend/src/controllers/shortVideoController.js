const ShortVideo = require('../models/ShortVideo');
const ShortVideoPackage = require('../models/ShortVideoPackage');
const UserPackage = require('../models/UserPackage');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 获取套餐列表
exports.getPackages = async (req, res) => {
  try {
    const packages = await ShortVideoPackage.find({ status: 'active' }).sort({ price: 1 });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取套餐列表失败'
    });
  }
};

// 购买套餐
exports.buyPackage = async (req, res) => {
  try {
    const { package_id } = req.body;
    const user_id = req.user.id;

    // 查找套餐
    const package = await ShortVideoPackage.findById(package_id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: '套餐不存在'
      });
    }

    // 查找用户
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查余额
    if (user.wallet_balance < package.price) {
      return res.status(400).json({
        success: false,
        message: '余额不足，请先充值'
      });
    }

    // 扣除余额
    user.wallet_balance -= package.price;
    await user.save();

    // 计算过期时间
    const end_time = new Date();
    end_time.setDate(end_time.getDate() + package.validity_days);

    // 创建用户套餐
    const userPackage = new UserPackage({
      user_id,
      package_id,
      start_time: new Date(),
      end_time,
      remaining_videos: package.video_limit
    });

    await userPackage.save();

    res.json({
      success: true,
      message: '购买成功',
      data: {
        package_id: userPackage._id,
        package_name: package.name,
        video_limit: package.video_limit,
        remaining_videos: package.video_limit,
        end_time,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    console.error('购买套餐失败:', error);
    res.status(500).json({
      success: false,
      message: '购买失败，请稍后重试'
    });
  }
};

// 检查用户套餐
exports.checkUserPackage = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 查找用户的有效套餐
    const userPackage = await UserPackage.findOne({
      user_id,
      is_active: true,
      end_time: { $gt: new Date() }
    }).populate('package_id');

    if (!userPackage) {
      return res.json({
        success: true,
        data: {
          has_package: false,
          remaining_videos: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        has_package: true,
        package_id: userPackage._id,
        package_name: userPackage.package_id.name,
        video_limit: userPackage.package_id.video_limit,
        remaining_videos: userPackage.remaining_videos,
        end_time: userPackage.end_time
      }
    });
  } catch (error) {
    console.error('检查用户套餐失败:', error);
    res.status(500).json({
      success: false,
      message: '检查套餐失败'
    });
  }
};

// 上传视频
exports.uploadVideo = async (req, res) => {
  try {
    const { title, tags, is_private } = req.body;
    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的视频'
      });
    }

    // 检查用户套餐
    const userPackage = await UserPackage.findOne({
      user_id,
      is_active: true,
      end_time: { $gt: new Date() }
    });

    if (!userPackage || userPackage.remaining_videos <= 0) {
      return res.status(400).json({
        success: false,
        message: '套餐已过期或上传次数不足，请购买套餐'
      });
    }

    // 扣减上传次数
    userPackage.remaining_videos -= 1;
    await userPackage.save();

    // 生成视频URL
    const video_url = `/uploads/videos/${req.file.filename}`;

    // 创建短视频记录
    const video = new ShortVideo({
      user_id,
      title: title || '未命名视频',
      video_url,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      is_private: is_private === 'true'
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: '上传成功，等待审核',
      data: {
        ...video.toObject(),
        remaining_videos: userPackage.remaining_videos
      }
    });
  } catch (error) {
    console.error('上传视频失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

// 获取我的视频
exports.getMyVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    const videos = await ShortVideo.find({ user_id })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ShortVideo.countDocuments({ user_id });

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取我的视频失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 根据用户ID获取视频
exports.getVideosByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const videos = await ShortVideo.find({
      user_id,
      status: 'approved',
      is_private: false
    })
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ShortVideo.countDocuments({
      user_id,
      status: 'approved',
      is_private: false
    });

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户视频失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 获取推荐视频列表
exports.getRecommendedVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const videos = await ShortVideo.find({
      status: 'approved',
      is_private: false
    })
      .populate('user_id', 'username avatar')
      .sort({ views: -1, likes_count: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ShortVideo.countDocuments({
      status: 'approved',
      is_private: false
    });

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取推荐视频失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 删除视频
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const video = await ShortVideo.findOne({ _id: id, user_id });
    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在或无权删除'
      });
    }

    // 删除视频文件
    const videoPath = path.join(__dirname, '../../public', video.video_url);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // 删除封面图片
    if (video.cover_image) {
      const coverPath = path.join(__dirname, '../../public', video.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    await ShortVideo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除视频失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试'
    });
  }
};

// 观看视频（增加观看次数）
exports.watchVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await ShortVideo.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: '视频不存在'
      });
    }

    res.json({
      success: true,
      data: { views: video.views }
    });
  } catch (error) {
    console.error('更新观看次数失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

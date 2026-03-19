const LiveRoom = require('../models/LiveRoom');
const LiveComment = require('../models/LiveComment');
const LiveViewer = require('../models/LiveViewer');
const User = require('../models/User');
const crypto = require('crypto');

// 生成唯一的stream key
function generateStreamKey() {
  return crypto.randomBytes(16).toString('hex');
}

// 创建直播间
exports.createLiveRoom = async (req, res) => {
  try {
    const { title, category, tags, cover_image, is_private, password, max_viewers } = req.body;
    const host_id = req.user.id;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请输入直播间标题'
      });
    }

    // 检查用户是否有正在进行或等待中的直播
    const existingRoom = await LiveRoom.findOne({
      host_id,
      status: { $in: ['waiting', 'live'] }
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: '您已有正在进行或等待中的直播间'
      });
    }

    // 生成stream key和推流URL
    const stream_key = generateStreamKey();
    const stream_url = `rtmp://${process.env.RTMP_HOST || 'localhost'}:1935/live/${stream_key}`;

    const liveRoom = new LiveRoom({
      host_id,
      title: title.trim(),
      category: category || 'chat',
      tags: tags || [],
      cover_image: cover_image || '',
      stream_url,
      stream_key,
      is_private: is_private || false,
      password: is_private ? password : '',
      max_viewers: max_viewers || 1000
    });

    await liveRoom.save();

    res.status(201).json({
      success: true,
      message: '直播间创建成功',
      data: {
        id: liveRoom._id,
        title: liveRoom.title,
        stream_key: liveRoom.stream_key,
        stream_url: liveRoom.stream_url,
        status: liveRoom.status
      }
    });
  } catch (error) {
    console.error('创建直播间失败:', error);
    res.status(500).json({
      success: false,
      message: '创建失败，请稍后重试'
    });
  }
};

// 开始直播
exports.startLive = async (req, res) => {
  try {
    const { room_id } = req.params;
    const host_id = req.user.id;

    const liveRoom = await LiveRoom.findOne({ _id: room_id, host_id });
    if (!liveRoom) {
      return res.status(404).json({
        success: false,
        message: '直播间不存在'
      });
    }

    if (liveRoom.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: '直播间状态不允许开始直播'
      });
    }

    liveRoom.status = 'live';
    liveRoom.start_time = new Date();

    await liveRoom.save();

    res.json({
      success: true,
      message: '直播已开始',
      data: liveRoom
    });
  } catch (error) {
    console.error('开始直播失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 结束直播
exports.endLive = async (req, res) => {
  try {
    const { room_id } = req.params;
    const host_id = req.user.id;

    const liveRoom = await LiveRoom.findOne({ _id: room_id, host_id });
    if (!liveRoom) {
      return res.status(404).json({
        success: false,
        message: '直播间不存在'
      });
    }

    if (liveRoom.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: '直播间未在直播中'
      });
    }

    liveRoom.status = 'ended';
    liveRoom.end_time = new Date();

    // 计算直播时长
    if (liveRoom.start_time) {
      const duration = Math.floor((liveRoom.end_time - liveRoom.start_time) / 1000);
      liveRoom.duration = duration;
    }

    await liveRoom.save();

    res.json({
      success: true,
      message: '直播已结束',
      data: liveRoom
    });
  } catch (error) {
    console.error('结束直播失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 获取直播列表
exports.getLiveRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'live' } = req.query;

    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const liveRooms = await LiveRoom.find(query)
      .populate('host_id', 'username avatar')
      .sort({ viewer_count: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveRoom.countDocuments(query);

    res.json({
      success: true,
      data: {
        rooms: liveRooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取直播列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 获取直播间详情
exports.getLiveRoomDetail = async (req, res) => {
  try {
    const { room_id } = req.params;

    const liveRoom = await LiveRoom.findById(room_id)
      .populate('host_id', 'username avatar age gender bio');

    if (!liveRoom) {
      return res.status(404).json({
        success: false,
        message: '直播间不存在'
      });
    }

    // 检查是否需要密码
    if (liveRoom.is_private && liveRoom.status === 'live') {
      const { password } = req.query;
      if (password !== liveRoom.password) {
        return res.status(403).json({
          success: false,
          message: '密码错误',
          need_password: true
        });
      }
    }

    // 获取在线观众数
    const onlineViewers = await LiveViewer.countDocuments({
      room_id,
      is_online: true
    });

    // 获取最近的评论
    const recentComments = await LiveComment.find({ room_id })
      .populate('user_id', 'username avatar')
      .sort({ created_at: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        ...liveRoom.toObject(),
        current_viewers: onlineViewers,
        recent_comments: recentComments
      }
    });
  } catch (error) {
    console.error('获取直播间详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 加入直播间
exports.joinLiveRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const user_id = req.user.id;

    const liveRoom = await LiveRoom.findById(room_id);
    if (!liveRoom) {
      return res.status(404).json({
        success: false,
        message: '直播间不存在'
      });
    }

    if (liveRoom.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: '直播未开始'
      });
    }

    // 检查是否已在房间中
    const existingViewer = await LiveViewer.findOne({
      room_id,
      user_id,
      is_online: true
    });

    if (existingViewer) {
      return res.json({
        success: true,
        message: '已在直播间中',
        data: existingViewer
      });
    }

    // 创建观众记录
    const viewer = new LiveViewer({
      room_id,
      user_id,
      is_online: true
    });

    await viewer.save();

    // 更新直播间观看人数
    await LiveRoom.findByIdAndUpdate(room_id, {
      $inc: { viewer_count: 1 }
    });

    res.status(201).json({
      success: true,
      message: '加入直播间成功',
      data: viewer
    });
  } catch (error) {
    console.error('加入直播间失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 离开直播间
exports.leaveLiveRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const user_id = req.user.id;

    const viewer = await LiveViewer.findOne({
      room_id,
      user_id,
      is_online: true
    });

    if (viewer) {
      viewer.is_online = false;
      viewer.leave_time = new Date();

      // 计算观看时长
      if (viewer.join_time) {
        viewer.watch_duration = Math.floor((viewer.leave_time - viewer.join_time) / 1000);
      }

      await viewer.save();

      // 更新直播间观看人数
      await LiveRoom.findByIdAndUpdate(room_id, {
        $inc: { viewer_count: -1 }
      });
    }

    res.json({
      success: true,
      message: '离开直播间成功'
    });
  } catch (error) {
    console.error('离开直播间失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 获取我的直播间
exports.getMyLiveRooms = async (req, res) => {
  try {
    const user_id = req.user.id;

    const liveRooms = await LiveRoom.find({ host_id: user_id })
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: liveRooms
    });
  } catch (error) {
    console.error('获取我的直播间失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 发送评论
exports.sendComment = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请输入评论内容'
      });
    }

    const comment = new LiveComment({
      room_id,
      user_id,
      content: content.trim(),
      type: 'text'
    });

    await comment.save();

    // 查询用户信息
    const user = await User.findById(user_id).select('username avatar');

    res.status(201).json({
      success: true,
      message: '发送成功',
      data: {
        ...comment.toObject(),
        user
      }
    });
  } catch (error) {
    console.error('发送评论失败:', error);
    res.status(500).json({
      success: false,
      message: '发送失败，请稍后重试'
    });
  }
};

// 获取评论列表
exports.getComments = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const comments = await LiveComment.find({ room_id })
      .populate('user_id', 'username avatar')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveComment.countDocuments({ room_id });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

// 点赞直播间
exports.likeLiveRoom = async (req, res) => {
  try {
    const { room_id } = req.params;

    const liveRoom = await LiveRoom.findByIdAndUpdate(
      room_id,
      { $inc: { like_count: 1 } },
      { new: true }
    );

    if (!liveRoom) {
      return res.status(404).json({
        success: false,
        message: '直播间不存在'
      });
    }

    // 创建点赞评论
    const user_id = req.user.id;
    const comment = new LiveComment({
      room_id,
      user_id,
      content: '👍 点赞',
      type: 'like'
    });
    await comment.save();

    res.json({
      success: true,
      data: { like_count: liveRoom.like_count }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试'
    });
  }
};

// 上传直播间封面
exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const cover_url = `/uploads/live-covers/${req.file.filename}`;

    res.json({
      success: true,
      message: '上传成功',
      data: { cover_url }
    });
  } catch (error) {
    console.error('上传封面失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

const LiveRoom = require('../models/LiveRoom');
const LiveComment = require('../models/LiveComment');
const LiveViewer = require('../models/LiveViewer');

/**
 * 直播服务 - 处理直播间相关业务逻辑
 */

class LiveService {
  /**
   * 创建直播间
   */
  static async createRoom(data) {
    const room = new LiveRoom(data);
    return await room.save();
  }

  /**
   * 开始直播
   */
  static async startLive(roomId) {
    const room = await LiveRoom.findById(roomId);
    if (!room) {
      throw new Error('直播间不存在');
    }

    if (room.status !== 'waiting') {
      throw new Error('直播间状态不允许开始直播');
    }

    room.status = 'live';
    room.start_time = new Date();
    return await room.save();
  }

  /**
   * 结束直播
   */
  static async endLive(roomId) {
    const room = await LiveRoom.findById(roomId);
    if (!room) {
      throw new Error('直播间不存在');
    }

    if (room.status !== 'live') {
      throw new Error('直播间未在直播中');
    }

    room.status = 'ended';
    room.end_time = new Date();

    // 计算直播时长
    if (room.start_time) {
      const duration = Math.floor((room.end_time - room.start_time) / 1000);
      room.duration = duration;
    }

    return await room.save();
  }

  /**
   * 加入直播间
   */
  static async joinRoom(roomId, userId) {
    const room = await LiveRoom.findById(roomId);
    if (!room) {
      throw new Error('直播间不存在');
    }

    if (room.status !== 'live') {
      throw new Error('直播未开始');
    }

    if (room.is_private) {
      throw new Error('私密直播间需要密码');
    }

    // 检查是否已在房间中
    const existingViewer = await LiveViewer.findOne({
      room_id: roomId,
      user_id: userId,
      is_online: true
    });

    if (existingViewer) {
      return existingViewer;
    }

    // 创建观众记录
    const viewer = new LiveViewer({
      room_id: roomId,
      user_id: userId,
      is_online: true
    });

    await viewer.save();

    // 更新直播间观看人数
    await LiveRoom.findByIdAndUpdate(roomId, {
      $inc: { viewer_count: 1 }
    });

    return viewer;
  }

  /**
   * 离开直播间
   */
  static async leaveRoom(roomId, userId) {
    const viewer = await LiveViewer.findOne({
      room_id: roomId,
      user_id: userId,
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
      await LiveRoom.findByIdAndUpdate(roomId, {
        $inc: { viewer_count: -1 }
      });
    }

    return { success: true };
  }

  /**
   * 获取在线观众数
   */
  static async getOnlineViewerCount(roomId) {
    return await LiveViewer.countDocuments({
      room_id: roomId,
      is_online: true
    });
  }

  /**
   * 发送评论
   */
  static async sendComment(roomId, userId, content, type = 'text') {
    const comment = new LiveComment({
      room_id: roomId,
      user_id: userId,
      content,
      type
    });

    await comment.save();

    // 更新直播间评论数
    // 注意：这里简化处理，实际应用中可能需要更复杂的逻辑

    return await comment.populate('user_id', 'username avatar');
  }

  /**
   * 获取评论列表
   */
  static async getComments(roomId, page = 1, limit = 50) {
    const comments = await LiveComment.find({ room_id: roomId })
      .populate('user_id', 'username avatar')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveComment.countDocuments({ room_id: roomId });

    return {
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 点赞直播间
   */
  static async likeRoom(roomId, userId) {
    const room = await LiveRoom.findById(roomId);
    if (!room) {
      throw new Error('直播间不存在');
    }

    await LiveRoom.findByIdAndUpdate(roomId, {
      $inc: { like_count: 1 }
    });

    // 创建点赞评论
    const comment = new LiveComment({
      room_id: roomId,
      user_id: userId,
      content: '👍 点赞',
      type: 'like'
    });

    await comment.save();

    return { like_count: room.like_count + 1 };
  }

  /**
   * 获取直播列表
   */
  static async getLiveRooms(filters = {}) {
    const query = {};

    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const { page = 1, limit = 10 } = filters;

    const rooms = await LiveRoom.find(query)
      .populate('host_id', 'username avatar')
      .sort({ viewer_count: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveRoom.countDocuments(query);

    return {
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取直播间详情
   */
  static async getRoomDetail(roomId) {
    const room = await LiveRoom.findById(roomId)
      .populate('host_id', 'username avatar age gender bio');

    if (!room) {
      throw new Error('直播间不存在');
    }

    // 获取在线观众数
    const onlineViewers = await this.getOnlineViewerCount(roomId);

    // 获取最近的评论
    const { comments } = await this.getComments(roomId, 1, 20);

    return {
      ...room.toObject(),
      current_viewers: onlineViewers,
      recent_comments: comments
    };
  }

  /**
   * 获取我的直播间
   */
  static async getMyRooms(hostId) {
    return await LiveRoom.find({ host_id: hostId })
      .sort({ created_at: -1 });
  }

  /**
   * 检查用户是否在直播间中
   */
  static async isUserInRoom(roomId, userId) {
    const viewer = await LiveViewer.findOne({
      room_id: roomId,
      user_id: userId,
      is_online: true
    });

    return !!viewer;
  }
}

module.exports = LiveService;

const LiveRoom = require('../models/LiveRoom');
const LiveComment = require('../models/LiveComment');
const LiveViewer = require('../models/LiveViewer');

/**
 * 直播Socket.IO服务 - 处理实时通信
 */

class LiveSocketService {
  /**
   * 处理用户连接
   */
  static handleConnection(socket, io) {
    console.log(`用户连接: ${socket.id}`);

    // 用户上线
    socket.on('user:online', async (userId) => {
      try {
        socket.userId = userId; // 存储用户ID

        // 更新用户在线状态
        const userService = require('./userService');
        await userService.updateOnlineStatus(userId, true);

        console.log(`用户 ${userId} 上线`);

        // 通知其他用户该用户上线
        io.emit('user:online', { userId, socketId: socket.id });
      } catch (error) {
        console.error('用户上线失败:', error);
        socket.emit('error', { message: '上线失败' });
      }
    });

    // 加入直播间
    socket.on('join:room', async (data) => {
      try {
        const { roomId, userId } = data;
        const liveService = require('./liveService');

        const viewer = await liveService.joinRoom(roomId, userId);
        socket.join(`room:${roomId}`);

        console.log(`用户 ${userId} 加入直播间 ${roomId}`);

        // 广播加入消息
        io.to(`room:${roomId}`).emit('room:user:join', {
          userId,
          viewerCount: await liveService.getOnlineViewerCount(roomId)
        });
      } catch (error) {
        console.error('加入直播间失败:', error);
        socket.emit('error', { message: '加入直播间失败' });
      }
    });

    // 离开直播间
    socket.on('leave:room', async (data) => {
      try {
        const { roomId, userId } = data;
        const liveService = require('./liveService');

        await liveService.leaveRoom(roomId, userId);
        socket.leave(`room:${roomId}`);

        console.log(`用户 ${userId} 离开直播间 ${roomId}`);

        // 广播离开消息
        io.to(`room:${roomId}`).emit('room:user:leave', {
          userId,
          viewerCount: await liveService.getOnlineViewerCount(roomId)
        });
      } catch (error) {
        console.error('离开直播间失败:', error);
      }
    });

    // 发送直播评论
    socket.on('room:comment', async (data) => {
      try {
        const { roomId, userId, content } = data;
        const liveService = require('./liveService');

        const comment = await liveService.sendComment(roomId, userId, content);

        // 广播新评论给房间内所有用户
        io.to(`room:${roomId}`).emit('room:comment:new', comment);

        console.log(`直播评论: ${roomId} - ${content}`);
      } catch (error) {
        console.error('发送评论失败:', error);
        socket.emit('error', { message: '发送评论失败' });
      }
    });

    // 直播间点赞
    socket.on('room:like', async (data) => {
      try {
        const { roomId, userId } = data;
        const liveService = require('./liveService');

        const { like_count } = await liveService.likeRoom(roomId, userId);

        // 广播点赞更新
        io.to(`room:${roomId}`).emit('room:like:new', {
          userId,
          likeCount: like_count
        });

        console.log(`直播点赞: ${roomId} - ${like_count}`);
      } catch (error) {
        console.error('点赞失败:', error);
        socket.emit('error', { message: '点赞失败' });
      }
    });

    // 观众数更新（定时推送）
    socket.on('room:viewer:update', async (roomId) => {
      try {
        const liveService = require('./liveService');
        const count = await liveService.getOnlineViewerCount(roomId);

        io.to(`room:${roomId}`).emit('room:viewer:count', { count });
      } catch (error) {
        console.error('更新观众数失败:', error);
      }
    });

    // 直播间状态更新
    socket.on('room:status', async (data) => {
      try {
        const { roomId, status } = data;
        const room = await LiveRoom.findById(roomId);

        if (!room) {
          return;
        }

        room.status = status;

        if (status === 'live' && !room.start_time) {
          room.start_time = new Date();
        }

        if (status === 'ended' && !room.end_time) {
          room.end_time = new Date();
          const duration = room.start_time
            ? Math.floor((room.end_time - room.start_time) / 1000)
            : 0;
          room.duration = duration;
        }

        await room.save();

        // 广播状态更新
        io.to(`room:${roomId}`).emit('room:status:changed', {
          roomId,
          status,
          room: room
        });

        console.log(`直播状态更新: ${roomId} - ${status}`);
      } catch (error) {
        console.error('更新直播状态失败:', error);
      }
    });

    // 断开连接
    socket.on('disconnect', async () => {
      console.log(`用户断开连接: ${socket.id}`);

      if (socket.userId) {
        try {
          // 更新用户离线状态
          const userService = require('./userService');
          await userService.updateOnlineStatus(socket.userId, false);

          console.log(`用户 ${socket.userId} 离线`);
        } catch (error) {
          console.error('用户离线失败:', error);
        }
      }
    });
  }

  /**
   * 广播直播间消息
   */
  static broadcastToRoom(io, roomId, event, data) {
    io.to(`room:${roomId}`).emit(event, data);
  }

  /**
   * 获取房间在线用户数
   */
  static async getRoomOnlineUsers(roomId) {
    const count = await LiveViewer.countDocuments({
      room_id: roomId,
      is_online: true
    });
    return count;
  }
}

module.exports = LiveSocketService;

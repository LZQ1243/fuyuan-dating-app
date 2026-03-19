require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const connectRedis = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const { initializePackages } = require('./utils/initialData');
const liveSocketService = require('./services/liveSocketService');
const LiveRoom = require('./models/LiveRoom');
const config = require('./config'); // 新增：统一配置入口

const app = express();
const httpServer = createServer(app);

// 初始化配置中心（新增）
config.initConfig().then(() => {
  logger.info('配置中心初始化完成');
}).catch(error => {
  logger.error('配置中心初始化失败:', error);
});

// 连接数据库
connectDB().then(() => {
  initializePackages();
});
connectRedis();

// 安全中间件
const { securityHeaders, xssProtection, csrfProtection } = require('./middleware/security');
const { errorHandler, notFound } = require('./utils/error-handler');

app.use(securityHeaders);
app.use(xssProtection);
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// CSRF保护 (在API路由前启用)
if (process.env.NODE_ENV === 'production') {
  app.use(csrfProtection);
}

// 限流
const { rateLimitConfig, apiRateLimitConfig, loginRateLimitConfig } = require('./middleware/security');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit(rateLimitConfig);
app.use('/api/', limiter);

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api', routes);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  }
});

// 在线用户存储
const onlineUsers = new Map();

// 直播房间存储
const liveRooms = new Map();

io.on('connection', (socket) => {
  logger.info(`用户连接: ${socket.id}`);

  // 用户上线
  socket.on('user:online', async (userId) => {
    onlineUsers.set(userId, socket.id);
    await require('./services/userService').updateOnlineStatus(userId, true);
    logger.info(`用户 ${userId} 上线`);
  });

  // 发送消息
  socket.on('message:send', async (data) => {
    const { senderId, receiverId, content, type } = data;
    try {
      const messageService = require('./services/messageService');
      const message = await messageService.sendMessage(senderId, receiverId, content, type);

      // 发送给接收者
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', message);
      }

      // 确认发送
      socket.emit('message:sent', message);
    } catch (error) {
      logger.error('发送消息失败:', error);
      socket.emit('message:error', { error: error.message });
    }
  });

  // 消息已读
  socket.on('message:read', async (data) => {
    const { messageId } = data;
    try {
      const messageService = require('./services/messageService');
      await messageService.markAsRead(messageId);
    } catch (error) {
      logger.error('标记已读失败:', error);
    }
  });

  // 直播相关事件
  // 加入直播间
  socket.on('join:room', (data) => {
    try {
      liveSocketService.handleConnection(socket, io, 'join:room', data);
    } catch (error) {
      console.error('加入直播间失败:', error);
      socket.emit('error', { message: '加入直播间失败' });
    }
  });

  // 离开直播间
  socket.on('leave:room', (data) => {
    try {
      liveSocketService.handleConnection(socket, io, 'leave:room', data);
    } catch (error) {
      console.error('离开直播间失败:', error);
      socket.emit('error', { message: '离开直播间失败' });
    }
  });

  // 直播间评论
  socket.on('room:comment', (data) => {
    try {
      liveSocketService.handleConnection(socket, io, 'room:comment', data);
    } catch (error) {
      console.error('发送评论失败:', error);
      socket.emit('error', { message: '发送评论失败' });
    }
  });

  // 直播间点赞
  socket.on('room:like', (data) => {
    try {
      liveSocketService.handleConnection(socket, io, 'room:like', data);
    } catch (error) {
      console.error('点赞失败:', error);
      socket.emit('error', { message: '点赞失败' });
    }
  });

  // 观众数更新
  socket.on('room:viewer:update', async (data) => {
    try {
      const liveService = require('./services/liveService');
      const count = await liveService.getOnlineViewerCount(data.roomId);
      io.to(`room:${data.roomId}`).emit('room:viewer:count', { count });
    } catch (error) {
      console.error('更新观众数失败:', error);
    }
  });

  // 直播状态更新
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

      logger.info(`直播状态更新: ${roomId} - ${status}`);
    } catch (error) {
      console.error('更新直播状态失败:', error);
    }
  });

  // 用户断开连接
  socket.on('disconnect', async () => {
    logger.info(`用户断开连接: ${socket.id}`);

    // 更新用户离线状态
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        await require('./services/userService').updateOnlineStatus(userId, false);
        logger.info(`用户 ${userId} 离线`);
        break;
      }
    }

    // 处理直播房间离开
    for (const [roomId, viewers] of liveRooms.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        const count = viewers.size;
        io.to(`room:${roomId}`).emit('room:viewer:count', { count });
        logger.info(`用户离开直播间: ${roomId}, 当前观众数: ${count}`);
      }
    }
  });
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404处理
app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`服务器运行在端口 ${PORT}`);
});

module.exports = app;

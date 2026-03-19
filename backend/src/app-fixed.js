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

const app = express();
const httpServer = createServer(app);

// 连接数据库
connectDB().then(() => {
  initializePackages();
});
connectRedis();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// 限流
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  }
});
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

  // 断开连接
  socket.on('disconnect', async () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        await require('./services/userService').updateOnlineStatus(userId, false);
        logger.info(`用户 ${userId} 下线`);
        break;
      }
    }
  });
});

// 错误处理
app.use(errorHandler);

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

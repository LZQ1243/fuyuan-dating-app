const Message = require('../models/Message');
const User = require('../models/User');
const { detectViolation } = require('../utils/sensitiveFilter');
const logger = require('../utils/logger');

// 获取聊天列表
exports.getChatList = async (req, res, next) => {
  try {
    const user = req.user;

    // 获取最近联系的用户
    const pipeline = [
      {
        $match: {
          $or: [
            { sender_id: user.user_id },
            { receiver_id: user.user_id }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender_id', user.user_id] },
              then: '$receiver_id',
              else: '$sender_id'
            }
          },
          last_message: { $first: '$content' },
          last_time: { $first: '$timestamp' },
          unread_count: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver_id', user.user_id] },
                    { $eq: ['$is_read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const chatList = await Message.aggregate(pipeline);

    // 获取用户信息
    const userIds = chatList.map(item => item._id);
    const users = await User.find({ user_id: { $in: userIds } }, 'user_id nickname avatar online_status');

    const userList = users.map(u => ({
      user_id: u.user_id,
      nickname: u.nickname,
      avatar: u.avatar,
      online_status: u.online_status
    }));

    // 合并数据
    const result = chatList.map(chat => {
      const userInfo = userList.find(u => u.user_id === chat._id);
      return {
        user_id: chat._id,
        nickname: userInfo?.nickname || '未知用户',
        avatar: userInfo?.avatar || '',
        online_status: userInfo?.online_status || false,
        last_message: chat.last_message,
        last_time: chat.last_time,
        unread_count: chat.unread_count
      };
    });

    logger.info(`用户 ${user.phone} 获取聊天列表，共 ${result.length} 条`);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        chat_list: result
      }
    });

  } catch (error) {
    logger.error('获取聊天列表失败:', error);
    next(error);
  }
};

// 获取聊天记录
exports.getChatHistory = async (req, res, next) => {
  try {
    const user = req.user;
    const { target_user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const query = {
      $or: [
        { sender_id: user.user_id, receiver_id: target_user_id },
        { sender_id: target_user_id, receiver_id: user.user_id }
      ],
      is_revoked: false
    };

    const options = {
      page,
      limit,
      sort: { timestamp: -1 }
    };

    const result = await Message.paginate(query, options);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        messages: result.docs.reverse(),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          total_pages: result.totalPages
        }
      }
    });

  } catch (error) {
    logger.error('获取聊天记录失败:', error);
    next(error);
  }
};

// 发送消息
exports.sendMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { receiver_id, content, type = 'text' } = req.body;

    // 验证内容
    if (!content || content.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '消息内容不能为空'
      });
    }

    // 敏感词检测
    const violation = detectViolation(content);
    if (violation.isViolation) {
      return res.status(400).json({
        code: 400,
        message: '消息包含违规内容',
        reason: violation.reason
      });
    }

    // 创建消息
    const message = new Message({
      sender_id: user.user_id,
      receiver_id,
      content: violation.filteredContent,
      type
    });

    await message.save();

    // 记录发送方已查看
    const platform = req.headers['x-platform'] || 'unknown';
    const deviceId = req.headers['x-device-id'] || '';

    message.read_records.push({
      user_id: user.user_id,
      platform,
      device_id: deviceId,
      read_at: new Date()
    });

    await message.save();

    logger.info(`用户 ${user.phone} 发送消息给 ${receiver_id}`);

    res.status(201).json({
      code: 200,
      message: '发送成功',
      data: {
        message_id: message.message_id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
        is_read: message.is_read,
        is_read_by_sender: true,
        is_read_by_receiver: false,
        read_by_me: true
      }
    });

  } catch (error) {
    logger.error('发送消息失败:', error);
    next(error);
  }
};

// 标记消息已读
exports.markAsRead = async (req, res, next) => {
  try {
    const user = req.user;
    const { target_user_id } = req.params;

    await Message.updateMany(
      {
        sender_id: target_user_id,
        receiver_id: user.user_id,
        is_read: false
      },
      { is_read: true }
    );

    res.json({
      code: 200,
      message: '标记成功'
    });

  } catch (error) {
    logger.error('标记已读失败:', error);
    next(error);
  }
};

// 撤回消息
exports.revokeMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { message_id } = req.params;

    const message = await Message.findOne({ message_id });

    if (!message) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在'
      });
    }

    // 只有发送者可以撤回，且2分钟内
    if (message.sender_id !== user.user_id) {
      return res.status(403).json({
        code: 403,
        message: '无权撤回此消息'
      });
    }

    const timeDiff = Date.now() - message.timestamp.getTime();
    if (timeDiff > 2 * 60 * 1000) {
      return res.status(400).json({
        code: 400,
        message: '消息发送超过2分钟，无法撤回'
      });
    }

    message.is_revoked = true;
    await message.save();

    logger.info(`用户 ${user.phone} 撤回消息 ${message_id}`);

    res.json({
      code: 200,
      message: '撤回成功'
    });

  } catch (error) {
    logger.error('撤回消息失败:', error);
    next(error);
  }
};

// 获取消息阅读状态
exports.getMessageReadStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { message_id } = req.params;

    const message = await Message.findOne({ message_id });

    if (!message) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在'
      });
    }

    // 检查权限
    if (message.sender_id !== user.user_id && message.receiver_id !== user.user_id) {
      return res.status(403).json({
        code: 403,
        message: '无权查看此消息状态'
      });
    }

    // 判断当前用户是否已读
    const isCurrentUserSender = message.sender_id === user.user_id;
    const readByCurrentUser = isCurrentUserSender ?
      !!message.sender_read_at :
      !!message.receiver_read_at;

    // 获取阅读记录
    const readRecords = message.read_records || [];

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        message_id: message.message_id,
        is_read: message.is_read,
        is_read_by_sender: !!message.sender_read_at,
        is_read_by_receiver: !!message.receiver_read_at,
        read_by_me: readByCurrentUser,
        sender_read_at: message.sender_read_at,
        receiver_read_at: message.receiver_read_at,
        read_records: readRecords.map(record => ({
          user_id: record.user_id,
          platform: record.platform,
          read_at: record.read_at,
          is_me: record.user_id === user.user_id
        }))
      }
    });

  } catch (error) {
    logger.error('获取消息阅读状态失败:', error);
    next(error);
  }
};

// 批量获取消息阅读状态
exports.getBatchMessageReadStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { message_ids } = req.body;

    if (!Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '消息ID列表不能为空'
      });
    }

    const messages = await Message.find({
      message_id: { $in: message_ids },
      $or: [
        { sender_id: user.user_id },
        { receiver_id: user.user_id }
      ]
    });

    const statusMap = messages.map(msg => {
      const isCurrentUserSender = msg.sender_id === user.user_id;
      const readByCurrentUser = isCurrentUserSender ?
        !!msg.sender_read_at :
        !!msg.receiver_read_at;

      return {
        message_id: msg.message_id,
        is_read: msg.is_read,
        is_read_by_sender: !!msg.sender_read_at,
        is_read_by_receiver: !!msg.receiver_read_at,
        read_by_me: readByCurrentUser,
        read_by_any: !!msg.sender_read_at || !!msg.receiver_read_at
      };
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        message_status: statusMap
      }
    });

  } catch (error) {
    logger.error('批量获取消息阅读状态失败:', error);
    next(error);
  }
};

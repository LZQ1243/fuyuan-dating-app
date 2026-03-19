const Message = require('../models/Message');
const logger = require('../utils/logger');

// 发送消息
const sendMessage = async (senderId, receiverId, content, type) => {
  try {
    const message = new Message({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      type
    });

    await message.save();
    return message;
  } catch (error) {
    logger.error('发送消息失败:', error);
    throw error;
  }
};

// 标记已读
const markAsRead = async (messageId) => {
  try {
    await Message.updateOne(
      { message_id: messageId },
      { is_read: true }
    );
  } catch (error) {
    logger.error('标记已读失败:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  markAsRead
};

const User = require('../models/User');
const logger = require('../utils/logger');

// 更新在线状态
const updateOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      {
        online_status: isOnline,
        last_active: new Date()
      }
    );
  } catch (error) {
    logger.error('更新在线状态失败:', error);
  }
};

// 更新最后活跃时间
const updateLastActive = async (userId) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { last_active: new Date() }
    );
  } catch (error) {
    logger.error('更新活跃时间失败:', error);
  }
};

module.exports = {
  updateOnlineStatus,
  updateLastActive
};

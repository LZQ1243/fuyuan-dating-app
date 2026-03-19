const config = {
  projectName: 'fuyuan-taro',
  date: '2026-03-19',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 1 / 2
  },
  // 微信小程序配置
  appid: 'wx1234567890abcdef', // 请替换为实际的小程序AppID
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.fuyuan.com/api'
    : 'http://localhost:3000/api', // 后端API地址
  socketUrl: process.env.NODE_ENV === 'production'
    ? 'wss://api.fuyuan.com'
    : 'ws://localhost:3000', // WebSocket地址
  // 环境配置
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  debug: process.env.NODE_ENV !== 'production',
  // WebSocket配置
  socket: {
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000
  },
  // 上传配置
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageCount: 9,
    compressQuality: 0.8
  }
}

module.exports = config

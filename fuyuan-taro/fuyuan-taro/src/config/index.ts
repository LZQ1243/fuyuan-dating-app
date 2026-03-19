// 应用配置

// 环境类型
type Environment = 'development' | 'production'

// 获取当前环境
const getEnvironment = (): Environment => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

// 当前环境
const env = getEnvironment()

// API配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:3000/api',
    wsURL: 'ws://localhost:3000',
    uploadURL: 'http://localhost:3000/api/upload',
  },
  // 生产环境
  production: {
    baseURL: 'https://api.fuyuan.com/api',
    wsURL: 'wss://api.fuyuan.com',
    uploadURL: 'https://api.fuyuan.com/api/upload',
  }
}

// 微信小程序配置
export const WECHAT_CONFIG = {
  appId: 'your_wechat_appid', // 替换为实际的微信AppID
  appSecret: 'your_wechat_secret', // 仅后端使用
}

// Taro应用配置
export const APP_CONFIG = {
  name: '赴缘婚恋',
  version: '1.0.0',
  env,
  
  // 获取当前环境配置
  get apiConfig() {
    return API_CONFIG[this.env]
  },
  
  // 获取API基础URL
  get baseURL() {
    return this.apiConfig.baseURL
  },
  
  // 获取WebSocket URL
  get wsURL() {
    return this.apiConfig.wsURL
  },
  
  // 获取上传URL
  get uploadURL() {
    return this.apiConfig.uploadURL
  }
}

// 导出环境配置
export default APP_CONFIG

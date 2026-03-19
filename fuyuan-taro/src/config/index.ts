/**
 * 应用配置
 */
const config = {
  // 应用信息
  name: '赴缘',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',

  // API 配置
  apiConfig: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000
  },

  // API 地址
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  wsURL: process.env.WS_BASE_URL || 'ws://localhost:3000',
  uploadURL: process.env.UPLOAD_URL || 'http://localhost:3000/api/upload',

  // 上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    compressQuality: 0.8
  }
}

export default config
export const APP_CONFIG = config

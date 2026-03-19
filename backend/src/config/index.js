/**
 * 配置统一入口
 * 所有配置都从这里导出，确保配置互通无延迟
 */

const configCenter = require('./config-center');

let isInitialized = false;

/**
 * 初始化配置
 */
async function initConfig() {
  if (isInitialized) {
    return configCenter;
  }

  try {
    await configCenter.initialize();
    isInitialized = true;
    return configCenter;
  } catch (error) {
    console.error('配置初始化失败:', error);
    throw error;
  }
}

/**
 * 获取数据库配置
 */
function getDatabaseConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('database');
}

/**
 * 获取Redis配置
 */
function getRedisConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('redis');
}

/**
 * 获取认证配置
 */
function getAuthConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('auth');
}

/**
 * 获取安全配置
 */
function getSecurityConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('security');
}

/**
 * 获取上传配置
 */
function getUploadConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('upload');
}

/**
 * 获取存储配置
 */
function getStorageConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('storage');
}

/**
 * 获取AI配置
 */
function getAIConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('ai');
}

/**
 * 获取匹配配置
 */
function getMatchConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('match');
}

/**
 * 获取无障碍配置
 */
function getAccessibilityConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('accessibility');
}

/**
 * 获取第三方服务配置
 */
function getThirdPartyConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('thirdparty');
}

/**
 * 获取环境配置
 */
function getEnvironmentConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.get('environment');
}

/**
 * 获取所有配置
 */
function getAllConfigs() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.getAll();
}

/**
 * 更新配置
 */
async function updateConfig(source, newConfig) {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return await configCenter.update(source, newConfig);
}

/**
 * 重新加载配置
 */
async function reloadConfig(source) {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return await configCenter.reload(source);
}

/**
 * 重新加载所有配置
 */
async function reloadAllConfigs() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return await configCenter.reloadAll();
}

/**
 * 配置健康检查
 */
async function healthCheck() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return await configCenter.healthCheck();
}

/**
 * 监听配置变化
 */
function onConfigChange(source, callback) {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.onConfigChange(source, callback);
}

/**
 * 移除配置监听
 */
function offConfigChange(source, callback) {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.offConfigChange(source, callback);
}

/**
 * 导出配置
 */
function exportConfig() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.exportConfig();
}

/**
 * 导入配置
 */
async function importConfig(configData) {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return await configCenter.importConfig(configData);
}

/**
 * 获取配置摘要
 */
function getConfigSummary() {
  if (!isInitialized) {
    throw new Error('配置未初始化，请先调用 initConfig()');
  }
  return configCenter.getSummary();
}

// 导出所有函数
module.exports = {
  // 初始化
  initConfig,

  // 获取配置
  getDatabaseConfig,
  getRedisConfig,
  getAuthConfig,
  getSecurityConfig,
  getUploadConfig,
  getStorageConfig,
  getAIConfig,
  getMatchConfig,
  getAccessibilityConfig,
  getThirdPartyConfig,
  getEnvironmentConfig,
  getAllConfigs,

  // 更新配置
  updateConfig,

  // 重新加载
  reloadConfig,
  reloadAllConfigs,

  // 健康检查
  healthCheck,

  // 监听配置
  onConfigChange,
  offConfigChange,

  // 导入导出
  exportConfig,
  importConfig,

  // 摘要
  getConfigSummary
};

/**
 * 使用示例：
 *
 * // 初始化配置
 * const config = require('./config');
 * await config.initConfig();
 *
 * // 获取数据库配置
 * const dbConfig = config.getDatabaseConfig();
 * console.log('数据库URI:', dbConfig.uri);
 *
 * // 获取Redis配置
 * const redisConfig = config.getRedisConfig();
 * console.log('Redis URI:', redisConfig.uri);
 *
 * // 获取所有配置
 * const allConfigs = config.getAllConfigs();
 *
 * // 监听配置变化
 * config.onConfigChange('database', (source, newConfig) => {
 *   console.log('数据库配置已更新:', newConfig);
 * });
 *
 * // 更新配置
 * await config.updateConfig('database', { uri: '...' });
 *
 * // 重新加载配置
 * await config.reloadConfig('database');
 *
 * // 健康检查
 * const health = await config.healthCheck();
 */

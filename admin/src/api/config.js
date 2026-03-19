import request from './request'

/**
 * 获取所有配置
 */
export const getConfig = () => {
  return request({
    url: '/config',
    method: 'GET'
  })
}

/**
 * 获取配置摘要
 */
export const getConfigSummary = () => {
  return request({
    url: '/config/summary',
    method: 'GET'
  })
}

/**
 * 更新特定配置源
 */
export const updateConfigSource = (source, data) => {
  return request({
    url: `/config/${source}`,
    method: 'PUT',
    data
  })
}

/**
 * 更新配置（兼容旧接口）
 */
export const updateConfig = async (data) => {
  try {
    // 如果数据包含多个配置源，逐个更新
    const promises = []
    for (const [source, configData] of Object.entries(data)) {
      promises.push(updateConfigSource(source, configData))
    }

    const results = await Promise.all(promises)

    // 检查是否所有更新都成功
    const hasError = results.some(r => r.code !== 200)
    if (hasError) {
      return {
        code: 500,
        message: '部分配置更新失败'
      }
    }

    return {
      code: 200,
      message: '配置更新成功'
    }
  } catch (error) {
    console.error('更新配置失败:', error)
    return {
      code: 500,
      message: '配置更新失败',
      error: error.message
    }
  }
}

/**
 * 重新加载配置
 */
export const reloadConfig = (source) => {
  return request({
    url: `/config/${source}/reload`,
    method: 'POST'
  })
}

/**
 * 重新加载所有配置
 */
export const reloadAllConfigs = () => {
  return request({
    url: '/config/reload/all',
    method: 'POST'
  })
}

/**
 * 导出配置
 */
export const exportConfigs = () => {
  return request({
    url: '/config/export/all',
    method: 'GET',
    responseType: 'blob'
  })
}

/**
 * 导入配置
 */
export const importConfigs = (data) => {
  return request({
    url: '/config/import/all',
    method: 'POST',
    data
  })
}

/**
 * 获取配置元数据
 */
export const getConfigMetadata = () => {
  return request({
    url: '/config/meta',
    method: 'GET'
  })
}

/**
 * 获取配置历史
 */
export const getConfigHistory = (source) => {
  return request({
    url: `/config/history/${source}`,
    method: 'GET'
  })
}

/**
 * 回滚配置
 */
export const rollbackConfig = (source, historyId) => {
  return request({
    url: `/config/${source}/rollback/${historyId}`,
    method: 'POST'
  })
}

/**
 * 创建配置快照
 */
export const createSnapshot = (data) => {
  return request({
    url: '/config/snapshot',
    method: 'POST',
    data
  })
}

/**
 * 恢复配置快照
 */
export const restoreSnapshot = (snapshotId) => {
  return request({
    url: `/config/snapshot/${snapshotId}/restore`,
    method: 'POST'
  })
}

/**
 * 获取快照列表
 */
export const getSnapshots = () => {
  return request({
    url: '/config/snapshots',
    method: 'GET'
  })
}

/**
 * 配置对比
 */
export const compareConfigs = (data) => {
  return request({
    url: '/config/diff',
    method: 'POST',
    data
  })
}

/**
 * 批量验证配置
 */
export const validateConfigsBatch = (data) => {
  return request({
    url: '/config/validate/batch',
    method: 'POST',
    data
  })
}

/**
 * 获取配置使用统计
 */
export const getConfigUsageStats = () => {
  return request({
    url: '/config/usage/stats',
    method: 'GET'
  })
}

/**
 * 配置健康检查
 */
export const configHealthCheck = () => {
  return request({
    url: '/config/health',
    method: 'GET'
  })
}

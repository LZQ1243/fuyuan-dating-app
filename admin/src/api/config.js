import request from './request'

/**
 * 获取配置
 */
export const getConfig = () => {
  return request({
    url: '/config',
    method: 'GET'
  })
}

/**
 * 更新配置
 */
export const updateConfig = (data) => {
  return request({
    url: '/config',
    method: 'PUT',
    data
  })
}

/**
 * 批量更新配置
 */
export const batchUpdateConfig = (data) => {
  return request({
    url: '/config/batch',
    method: 'PUT',
    data
  })
}

/**
 * 重置配置
 */
export const resetConfig = () => {
  return request({
    url: '/config/reset',
    method: 'POST'
  })
}

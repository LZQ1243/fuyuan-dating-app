import request from './request'

/**
 * 获取API端点列表
 */
export const getAPIEndpoints = (params) => {
  return request({
    url: '/api-endpoints',
    method: 'GET',
    params
  })
}

/**
 * 获取单个API端点
 */
export const getAPIEndpoint = (id) => {
  return request({
    url: `/api-endpoints/${id}`,
    method: 'GET'
  })
}

/**
 * 创建API端点
 */
export const createAPIEndpoint = (data) => {
  return request({
    url: '/api-endpoints',
    method: 'POST',
    data
  })
}

/**
 * 更新API端点
 */
export const updateAPIEndpoint = (id, data) => {
  return request({
    url: `/api-endpoints/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除API端点
 */
export const deleteAPIEndpoint = (id) => {
  return request({
    url: `/api-endpoints/${id}`,
    method: 'DELETE'
  })
}

/**
 * 批量删除API端点
 */
export const batchDeleteAPIEndpoints = (ids) => {
  return request({
    url: '/api-endpoints/batch',
    method: 'DELETE',
    data: { ids }
  })
}

/**
 * 批量启用/禁用API端点
 */
export const batchToggleAPIEndpoints = (ids, enabled) => {
  return request({
    url: '/api-endpoints/batch/toggle',
    method: 'PUT',
    data: { ids, enabled }
  })
}

/**
 * 测试API端点
 */
export const testAPIEndpoint = (id) => {
  return request({
    url: `/api-endpoints/${id}/test`,
    method: 'POST'
  })
}

/**
 * 批量测试API端点
 */
export const batchTestAPIEndpoints = (ids) => {
  return request({
    url: '/api-endpoints/batch/test',
    method: 'POST',
    data: { ids }
  })
}

/**
 * 导出API端点
 */
export const exportAPIEndpoints = (params) => {
  return request({
    url: '/api-endpoints/export/all',
    method: 'GET',
    params,
    responseType: 'blob'
  })
}

/**
 * 导入API端点
 */
export const importAPIEndpoints = (data) => {
  return request({
    url: '/api-endpoints/import/all',
    method: 'POST',
    data
  })
}

/**
 * 获取API统计
 */
export const getAPIStats = () => {
  return request({
    url: '/api-endpoints/stats',
    method: 'GET'
  })
}

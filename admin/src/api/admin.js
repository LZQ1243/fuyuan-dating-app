import request from './request'

// 获取统计数据
export const getStatistics = () => {
  return request({
    url: '/admin/statistics',
    method: 'GET'
  })
}

// 获取用户列表
export const getUsers = (params) => {
  return request({
    url: '/admin/users',
    method: 'GET',
    params
  })
}

// 获取用户详情
export const getUserDetail = (userId) => {
  return request({
    url: `/admin/users/${userId}`,
    method: 'GET'
  })
}

// 封禁用户
export const banUser = (userId, data) => {
  return request({
    url: `/admin/users/${userId}/ban`,
    method: 'PUT',
    data
  })
}

// 解封用户
export const unbanUser = (userId) => {
  return request({
    url: `/admin/users/${userId}/unban`,
    method: 'PUT'
  })
}

// 获取待审核认证
export const getPendingCertifications = (params) => {
  return request({
    url: '/admin/certifications/pending',
    method: 'GET',
    params
  })
}

// 通过认证
export const approveCertification = (userId) => {
  return request({
    url: `/admin/certifications/${userId}/approve`,
    method: 'PUT'
  })
}

// 拒绝认证
export const rejectCertification = (userId, data) => {
  return request({
    url: `/admin/certifications/${userId}/reject`,
    method: 'PUT',
    data
  })
}

// 获取敏感词列表
export const getSensitiveWords = () => {
  return request({
    url: '/admin/sensitive-words',
    method: 'GET'
  })
}

// 添加敏感词
export const addSensitiveWord = (data) => {
  return request({
    url: '/admin/sensitive-words',
    method: 'POST',
    data
  })
}

// 删除敏感词
export const deleteSensitiveWord = (word) => {
  return request({
    url: `/admin/sensitive-words/${word}`,
    method: 'DELETE'
  })
}

import request from './index'

/**
 * 获取所有敏感词
 */
export const getAllWords = () => {
  return request({
    url: '/sensitive-words',
    method: 'GET'
  })
}

/**
 * 添加敏感词
 */
export const addWord = (data) => {
  return request({
    url: '/sensitive-words/add',
    method: 'POST',
    data
  })
}

/**
 * 批量添加敏感词
 */
export const batchAddWords = (data) => {
  return request({
    url: '/sensitive-words/batch-add',
    method: 'POST',
    data
  })
}

/**
 * 删除敏感词
 */
export const removeWord = (data) => {
  return request({
    url: '/sensitive-words/remove',
    method: 'DELETE',
    data
  })
}

/**
 * 检查内容
 */
export const checkContent = (data) => {
  return request({
    url: '/sensitive-words/check',
    method: 'POST',
    data
  })
}

/**
 * 重新加载敏感词库
 */
export const reloadWords = () => {
  return request({
    url: '/sensitive-words/reload',
    method: 'POST'
  })
}

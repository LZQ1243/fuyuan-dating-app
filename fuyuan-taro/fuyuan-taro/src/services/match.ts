import request from './request'

/**
 * 获取智能匹配推荐
 */
export const getMatchRecommend = (params?: {
  page?: number
  pageSize?: number
}) => {
  return request({
    url: '/match/recommend',
    method: 'GET',
    data: params
  })
}

/**
 * 获取匹配列表
 */
export const getMatchList = (params?: {
  page?: number
  pageSize?: number
}) => {
  return request({
    url: '/match/list',
    method: 'GET',
    data: params
  })
}

/**
 * 查看匹配原因
 */
export const getMatchReason = (userId: string) => {
  return request({
    url: `/match/reason/${userId}`,
    method: 'GET'
  })
}

/**
 * 感兴趣（标记喜欢）
 */
export const likeUser = (userId: string) => {
  return request({
    url: '/match/like',
    method: 'POST',
    data: { userId }
  })
}

/**
 * 不感兴趣（标记不喜欢）
 */
export const dislikeUser = (userId: string) => {
  return request({
    url: '/match/dislike',
    method: 'POST',
    data: { userId }
  })
}

/**
 * 滑动跳过
 */
export const skipUser = (userId: string) => {
  return request({
    url: '/match/skip',
    method: 'POST',
    data: { userId }
  })
}

/**
 * 获取喜欢我的用户列表
 */
export const getWhoLikesMe = (page: number = 1, pageSize: number = 10) => {
  return request({
    url: '/match/who-likes-me',
    method: 'GET',
    data: { page, pageSize }
  })
}

/**
 * 获取我喜欢的用户列表
 */
export const getMyLikes = (page: number = 1, pageSize: number = 10) => {
  return request({
    url: '/match/my-likes',
    method: 'GET',
    data: { page, pageSize }
  })
}

/**
 * 更新匹配偏好
 */
export const updateMatchPreferences = (data: {
  ageMin?: number
  ageMax?: number
  disabilityLevel?: number[]
  disabilityType?: string[]
  location?: {
    province?: string
    city?: string
    maxDistance?: number
  }
}) => {
  return request({
    url: '/match/preferences',
    method: 'PUT',
    data
  })
}

/**
 * 获取匹配偏好
 */
export const getMatchPreferences = () => {
  return request({
    url: '/match/preferences',
    method: 'GET'
  })
}

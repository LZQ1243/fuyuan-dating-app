import request from './request'

/**
 * 获取动态列表
 */
export const getPostList = (page: number = 1, pageSize: number = 10) => {
  return request({
    url: '/posts/list',
    method: 'GET',
    data: { page, pageSize }
  })
}

/**
 * 获取动态详情
 */
export const getPostDetail = (postId: string) => {
  return request({
    url: `/posts/${postId}`,
    method: 'GET'
  })
}

/**
 * 发布动态
 */
export const createPost = (data: {
  content: string
  images?: string[]
  location?: string
}) => {
  return request({
    url: '/posts',
    method: 'POST',
    data
  })
}

/**
 * 删除动态
 */
export const deletePost = (postId: string) => {
  return request({
    url: `/posts/${postId}`,
    method: 'DELETE'
  })
}

/**
 * 点赞动态
 */
export const likePost = (postId: string, isLiked: boolean) => {
  return request({
    url: `/posts/${postId}/like`,
    method: 'POST',
    data: { isLiked }
  })
}

/**
 * 评论动态
 */
export const commentPost = (postId: string, content: string) => {
  return request({
    url: `/posts/${postId}/comment`,
    method: 'POST',
    data: { content }
  })
}

/**
 * 获取评论列表
 */
export const getCommentList = (postId: string, page: number = 1) => {
  return request({
    url: `/posts/${postId}/comments`,
    method: 'GET',
    data: { page }
  })
}

/**
 * 删除评论
 */
export const deleteComment = (commentId: string) => {
  return request({
    url: `/comments/${commentId}`,
    method: 'DELETE'
  })
}

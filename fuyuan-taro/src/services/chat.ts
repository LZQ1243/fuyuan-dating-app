import request from './request'

/**
 * 获取聊天列表
 */
export const getChatList = () => {
  return request({
    url: '/chat/list',
    method: 'GET'
  })
}

/**
 * 获取聊天记录
 */
export const getChatHistory = (userId: string, page: number = 1, pageSize: number = 20) => {
  return request({
    url: '/chat/history',
    method: 'GET',
    data: { userId, page, pageSize }
  })
}

/**
 * 发送文本消息
 */
export const sendTextMessage = (userId: string, content: string) => {
  return request({
    url: '/chat/send/text',
    method: 'POST',
    data: { userId, content }
  })
}

/**
 * 发送图片消息
 */
export const sendImageMessage = (userId: string, imageUrl: string) => {
  return request({
    url: '/chat/send/image',
    method: 'POST',
    data: { userId, imageUrl }
  })
}

/**
 * 发送语音消息
 */
export const sendVoiceMessage = (userId: string, voiceUrl: string, duration: number) => {
  return request({
    url: '/chat/send/voice',
    method: 'POST',
    data: { userId, voiceUrl, duration }
  })
}

/**
 * 标记消息已读
 */
export const markAsRead = (userId: string) => {
  return request({
    url: '/chat/read',
    method: 'POST',
    data: { userId }
  })
}

/**
 * 删除聊天
 */
export const deleteChat = (userId: string) => {
  return request({
    url: '/chat/delete',
    method: 'DELETE',
    data: { userId }
  })
}

/**
 * 获取未读消息数
 */
export const getUnreadCount = () => {
  return request({
    url: '/chat/unread',
    method: 'GET'
  })
}

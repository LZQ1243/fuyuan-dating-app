import { View, Text, Image } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getChatList } from '@/services/chat'
import './index.scss'

interface ChatItem {
  id: string
  userId: string
  nickname: string
  avatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  online: boolean
}

export default function ChatList() {
  const [chatList, setChatList] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(false)

  // 加载聊天列表
  const loadChatList = async () => {
    setLoading(true)
    try {
      const res = await getChatList()
      if (res.data?.list) {
        setChatList(res.data.list)
      }
    } catch (error) {
      console.error('加载聊天列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    loadChatList()
  }, [])

  // 下拉刷新
  const onRefresh = () => {
    loadChatList().then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  // 进入聊天
  const handleChat = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/chat/detail?userId=${userId}`
    })
  }

  return (
    <View className="chat-list-page">
      <View className="page-header">
        <Text className="page-title">消息</Text>
      </View>

      {chatList.length === 0 && !loading ? (
        <View className="empty-state">
          <Text className="empty-icon">💬</Text>
          <Text className="empty-text">暂无消息</Text>
          <Text className="empty-hint">去匹配页寻找有缘人吧</Text>
        </View>
      ) : (
        <View className="chat-list">
          {chatList.map(chat => (
            <View
              key={chat.id}
              className="chat-item"
              onClick={() => handleChat(chat.userId)}
            >
              <View className="avatar-wrapper">
                <Image
                  className="avatar"
                  src={chat.avatar}
                  mode="aspectFill"
                />
                {chat.online && <View className="online-badge"></View>}
                {chat.unreadCount > 0 && (
                  <View className="unread-badge">
                    <Text className="unread-count">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <View className="chat-content">
                <View className="chat-header">
                  <Text className="nickname">{chat.nickname}</Text>
                  <Text className="last-time">{chat.lastTime}</Text>
                </View>
                <Text className="last-message">{chat.lastMessage}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {loading && (
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      )}
    </View>
  )
}

import { View, Text, Image } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getChatList } from '@/services/chat'
import useUserStore from '@/store/user'
import './index.scss'

export default function ChatList() {
  const [chatList, setChatList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChatList()
  }, [])

  const loadChatList = async () => {
    try {
      setLoading(true)
      const res = await getChatList()

      if (res.data.code === 200) {
        setChatList(res.data.data || [])
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChat = (chat) => {
    Taro.navigateTo({
      url: `/pages/chat/detail?userId=${chat.userId}`
    })
  }

  return (
    <View className='chat-list-page'>
      <View className='header'>
        <Text className='title'>消息</Text>
      </View>

      {loading ? (
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      ) : chatList.length === 0 ? (
        <View className='empty'>
          <Text className='empty-text'>暂无消息</Text>
        </View>
      ) : (
        <View className='chat-list'>
          {chatList.map((chat, index) => (
            <View
              key={chat._id || index}
              className='chat-item'
              onClick={() => handleChat(chat)}
            >
              <Image
                className='avatar'
                src={chat.avatar || 'https://via.placeholder.com/100'}
                mode='aspectFill'
              />
              <View className='chat-info'>
                <Text className='nickname'>{chat.nickname}</Text>
                <Text className='last-message'>{chat.lastMessage || '暂无消息'}</Text>
              </View>
              <View className='right'>
                <Text className='time'>{chat.lastTime || ''}</Text>
                {chat.unreadCount > 0 && (
                  <View className='unread-badge'>
                    <Text className='unread-count'>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

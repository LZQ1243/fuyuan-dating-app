import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components'
import React, { useState, useEffect, useRef } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { getChatHistory, sendMessage, markAsRead } from '@/services/chat'
import { uploadChatImage } from '@/services/upload'
import { io } from 'socket.io-client'
import './detail.scss'

export default function ChatDetail() {
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollViewRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    // 获取路由参数
    const params = Taro.getCurrentInstance().router?.params
    if (params?.userId) {
      setUserId(params.userId)
      loadMessages(params.userId)
      connectWebSocket()
      markAsRead(params.userId)
    }
  }, [])

  const loadMessages = async (userId) => {
    try {
      setLoading(true)
      const res = await getChatHistory(userId, 1, 50)

      if (res.data.code === 200) {
        setMessages(res.data.data || [])
        scrollToBottom()
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    const token = Taro.getStorageSync('token')

    socketRef.current = io('http://localhost:3000', {
      query: { token }
    })

    socketRef.current.on('connect', () => {
      console.log('WebSocket已连接')
    })

    socketRef.current.on('message:receive', (message) => {
      if (message.senderId === userId || message.receiverId === userId) {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      }
    })

    socketRef.current.on('message:sent', (message) => {
      setMessages(prev => [...prev, message])
      scrollToBottom()
    })

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket已断开')
    })
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ scrollTop: 99999 })
      }
    }, 100)
  }

  const handleSend = async () => {
    if (!inputText.trim()) {
      return
    }

    try {
      const res = await sendMessage({
        receiverId: userId,
        content: inputText,
        type: 'text'
      })

      if (res.data.code === 200) {
        setInputText('')
        // 消息会通过WebSocket推送,不需要手动添加
      } else {
        showToast({ title: '发送失败', icon: 'none' })
      }
    } catch (error) {
      console.error('发送失败:', error)
      showToast({ title: '网络错误', icon: 'none' })
    }
  }

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        try {
          setLoading(true)
          const imageUrl = await uploadChatImage(res.tempFilePaths[0])
          await sendMessage({
            receiverId: params.userId,
            content: imageUrl,
            type: 'image'
          })
          showToast({ title: '发送成功', icon: 'success' })
        } catch (error) {
          console.error('发送图片失败:', error)
          showToast({ title: '发送失败', icon: 'none' })
        } finally {
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  }

  return (
    <View className='chat-detail-page'>
      <View className='header'>
        <Text className='title'>聊天</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        scrollY
        className='message-list'
        scrollIntoView
      >
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : (
          messages.map((msg, index) => (
            <View
              key={msg._id || index}
              className={`message-item ${msg.senderId === userId ? 'received' : 'sent'}`}
            >
              <Image
                className='avatar'
                src={msg.senderId === userId ? msg.senderAvatar : msg.receiverAvatar}
                mode='aspectFill'
              />
              <View className='message-content'>
                <Text className='message-text'>{msg.content}</Text>
                <Text className='message-time'>
                  {new Date(msg.createdAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className='input-area'>
        <View className='input-wrapper'>
          <Input
            className='message-input'
            value={inputText}
            onInput={(e) => setInputText(e.detail.value)}
            placeholder='输入消息...'
            maxlength={500}
          />
          <Button
            className='image-btn'
            onClick={handleChooseImage}
            size='mini'
          >
            +
          </Button>
        </View>
        <Button
          className='send-btn'
          onClick={handleSend}
        >
          发送
        </Button>
      </View>
    </View>
  )
}

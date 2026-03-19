import React, { useState, useEffect } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 获取用户信息
    getUserInfo()
  }, [])

  const getUserInfo = async () => {
    try {
      const res = await Taro.getUserInfo({
        withCredentials: true
      })
      setUserInfo(res.userInfo)
    } catch (error) {
      console.log('获取用户信息失败', error)
    }
  }

  const handleLogin = async () => {
    try {
      const loginRes = await Taro.login()
      console.log('登录成功', loginRes)
    } catch (error) {
      console.log('登录失败', error)
    }
  }

  return (
    <View className="index">
      <View className="header">
        <Text className="title">赴缘婚恋</Text>
        <Text className="subtitle">遇见真爱，从这里开始</Text>
      </View>

      <View className="content">
        {userInfo ? (
          <View className="user-info">
            <Image
              className="avatar"
              src={userInfo.avatarUrl}
              mode="aspectFill"
            />
            <Text className="nickname">{userInfo.nickName}</Text>
          </View>
        ) : (
          <Button className="login-btn" onClick={handleLogin}>
            微信登录
          </Button>
        )}
      </View>

      <View className="features">
        <View className="feature-item">
          <Text className="feature-icon">💝</Text>
          <Text className="feature-title">智能匹配</Text>
          <Text className="feature-desc">精准推荐您的另一半</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">💬</Text>
          <Text className="feature-title">实时聊天</Text>
          <Text className="feature-desc">随时随地畅聊无阻</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">👩‍❤️‍👨</Text>
          <Text className="feature-title">红娘服务</Text>
          <Text className="feature-desc">专业红娘为您牵线</Text>
        </View>
      </View>
    </View>
  )
}

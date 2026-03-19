import { View, Text, Image, Button } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getUserInfo, logout } from '@/services/user'
import './index.scss'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone: string
  gender: 'male' | 'female'
  age: number
  location?: {
    province: string
    city: string
  }
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'none'
  vipLevel: number
  vipExpireTime?: string
}

export default function Mine() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载用户信息
  const loadUserInfo = async () => {
    setLoading(true)
    try {
      const res = await getUserInfo()
      if (res.data?.user) {
        setUserInfo(res.data.user)
        Taro.setStorageSync('userInfo', res.data.user)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始化
  useEffect(() => {
    loadUserInfo()
  }, [])

  // 菜单操作
  const handleMenu = (action: string) => {
    if (!userInfo) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    switch (action) {
      case 'profile':
        Taro.navigateTo({ url: '/pages/mine/edit' })
        break
      case 'verification':
        Taro.navigateTo({ url: '/pages/mine/verification' })
        break
      case 'vip':
        Taro.navigateTo({ url: '/pages/mine/vip' })
        break
      case 'settings':
        Taro.navigateTo({ url: '/pages/mine/settings' })
        break
      case 'help':
        Taro.navigateTo({ url: '/pages/mine/help' })
        break
      case 'about':
        Taro.navigateTo({ url: '/pages/mine/about' })
        break
      default:
        break
    }
  }

  // 退出登录
  const handleLogout = async () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await logout()
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
            Taro.reLaunch({ url: '/pages/login/index' })
          } catch (error) {
            console.error('退出登录失败:', error)
          }
        }
      }
    })
  }

  if (loading) {
    return (
      <View className="mine-page">
        <View className="loading">加载中...</View>
      </View>
    )
  }

  return (
    <View className="mine-page">
      {/* 用户信息头部 */}
      <View className="user-header">
        {userInfo ? (
          <>
            <Image
              className="avatar"
              src={userInfo.avatar}
              mode="aspectFill"
              onClick={() => handleMenu('profile')}
            />
            <View className="user-info">
              <View className="user-row">
                <Text className="nickname">{userInfo.nickname}</Text>
                {userInfo.vipLevel > 0 && (
                  <Text className="vip-badge">VIP {userInfo.vipLevel}</Text>
                )}
              </View>
              <Text className="phone">{userInfo.phone}</Text>
              <View className="tags">
                <Text className="tag gender-tag">
                  {userInfo.gender === 'male' ? '男' : '女'}
                </Text>
                <Text className="tag age-tag">{userInfo.age}岁</Text>
                {userInfo.location && (
                  <Text className="tag location-tag">
                    {userInfo.location.province} {userInfo.location.city}
                  </Text>
                )}
              </View>
            </View>
            <View className="edit-btn" onClick={() => handleMenu('profile')}>
              <Text className="edit-icon">✏️</Text>
            </View>
          </>
        ) : (
          <View className="login-prompt">
            <Text className="login-text">登录/注册</Text>
          </View>
        )}
      </View>

      {/* 认证状态卡片 */}
      {userInfo && (
        <View
          className="verification-card"
          onClick={() => handleMenu('verification')}
        >
          <View className="verification-icon">
            <Text>{userInfo.verificationStatus === 'approved' ? '✅' : '📋'}</Text>
          </View>
          <View className="verification-info">
            <Text className="verification-title">
              {userInfo.verificationStatus === 'approved' ? '已认证' : '实名认证'}
            </Text>
            <Text className="verification-desc">
              {userInfo.verificationStatus === 'approved'
                ? '您的身份已通过认证'
                : '完成认证可提升信任度'}
            </Text>
          </View>
          <Text className="arrow">›</Text>
        </View>
      )}

      {/* 功能菜单 */}
      <View className="menu-section">
        <View className="menu-item" onClick={() => handleMenu('profile')}>
          <Text className="menu-icon">👤</Text>
          <Text className="menu-text">个人资料</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item" onClick={() => handleMenu('vip')}>
          <Text className="menu-icon">👑</Text>
          <Text className="menu-text">会员中心</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item" onClick={() => handleMenu('settings')}>
          <Text className="menu-icon">⚙️</Text>
          <Text className="menu-text">设置</Text>
          <Text className="arrow">›</Text>
        </View>
      </View>

      <View className="menu-section">
        <View className="menu-item" onClick={() => handleMenu('help')}>
          <Text className="menu-icon">❓</Text>
          <Text className="menu-text">帮助中心</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item" onClick={() => handleMenu('about')}>
          <Text className="menu-icon">ℹ️</Text>
          <Text className="menu-text">关于我们</Text>
          <Text className="arrow">›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      {userInfo && (
        <View className="logout-section">
          <Button className="logout-btn" onClick={handleLogout}>
            退出登录
          </Button>
        </View>
      )}
    </View>
  )
}

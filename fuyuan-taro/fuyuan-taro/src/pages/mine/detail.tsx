import { View, Text, Image, Button } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getUserDetail } from '@/services/user'
import { likeUser } from '@/services/match'
import './detail.scss'

interface UserDetail {
  id: string
  nickname: string
  avatar: string
  age: number
  gender: 'male' | 'female'
  disabilityLevel: number
  disabilityType: string
  location: {
    province: string
    city: string
  }
  bio?: string
  verified: boolean
  photos?: string[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const userId = router.params.userId

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImages, setCurrentImages] = useState<number>(0)

  useEffect(() => {
    loadUserDetail()
  }, [userId])

  const loadUserDetail = async () => {
    if (!userId) {
      Taro.showToast({
        title: '用户ID不存在',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const res = await getUserDetail(userId)
      if (res.data) {
        setUser(res.data)
      }
    } catch (error) {
      console.error('加载用户详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) return

    try {
      await likeUser(user.id)
      Taro.showToast({
        title: '已添加喜欢',
        icon: 'success'
      })
    } catch (error) {
      console.error('喜欢失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }

  const handleChat = () => {
    if (!user) return

    Taro.navigateTo({
      url: `/pages/chat/detail?userId=${user.id}`
    })
  }

  const previewImages = (index?: number) => {
    if (!user?.photos || user.photos.length === 0) return

    Taro.previewImage({
      urls: user.photos,
      current: index !== undefined ? user.photos[index] : user.photos[0]
    })
  }

  if (loading) {
    return (
      <View className="user-detail-page loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="user-detail-page empty">
        <Text>用户不存在</Text>
      </View>
    )
  }

  return (
    <View className="user-detail-page">
      {/* 头部 */}
      <View className="detail-header">
        <Image
          className="avatar"
          src={user.avatar}
          mode="aspectFill"
          onClick={() => previewImages(0)}
        />
        <View className="info">
          <View className="name-row">
            <Text className="nickname">{user.nickname}</Text>
            {user.verified && <Text className="verified">✓ 已认证</Text>}
          </View>
          <View className="meta">
            <Text className="gender">
              {user.gender === 'male' ? '♂' : '♀'}
            </Text>
            <Text className="age">{user.age}岁</Text>
            <Text className="location">
              {user.location.province} {user.location.city}
            </Text>
          </View>
        </View>
      </View>

      {/* 照片墙 */}
      {user.photos && user.photos.length > 0 && (
        <View className="photos-section">
          <Text className="section-title">照片 ({user.photos.length})</Text>
          <View className="photos-grid">
            {user.photos.map((photo, index) => (
              <Image
                key={index}
                className="photo-item"
                src={photo}
                mode="aspectFill"
                onClick={() => previewImages(index)}
              />
            ))}
          </View>
        </View>
      )}

      {/* 基本信息 */}
      <View className="info-section">
        <Text className="section-title">基本信息</Text>
        <View className="info-row">
          <Text className="label">残疾等级:</Text>
          <Text className="value">{user.disabilityLevel}级</Text>
        </View>
        <View className="info-row">
          <Text className="label">残疾类型:</Text>
          <Text className="value">{user.disabilityType}</Text>
        </View>
        <View className="info-row">
          <Text className="label">年龄:</Text>
          <Text className="value">{user.age}岁</Text>
        </View>
        <View className="info-row">
          <Text className="label">性别:</Text>
          <Text className="value">{user.gender === 'male' ? '男' : '女'}</Text>
        </View>
        <View className="info-row">
          <Text className="label">地区:</Text>
          <Text className="value">
            {user.location.province} {user.location.city}
          </Text>
        </View>
      </View>

      {/* 个人简介 */}
      {user.bio && (
        <View className="info-section">
          <Text className="section-title">个人简介</Text>
          <Text className="bio-text">{user.bio}</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View className="action-buttons">
        <Button className="btn btn-like" onClick={handleLike}>
          ♥ 添加喜欢
        </Button>
        <Button className="btn btn-chat" onClick={handleChat}>
          💬 开始聊天
        </Button>
      </View>
    </View>
  )
}

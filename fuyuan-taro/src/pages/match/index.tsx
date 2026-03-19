import { View, Text, Image } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getMatchRecommend, getMatchReason } from '@/services/match'
import { getUserDetail } from '@/services/user'
import config from '@/config'
import './index.scss'

interface User {
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
}

interface MatchCardProps {
  user: User
  onChat: (userId: string) => void
  onDetail: (userId: string) => void
}

// 匹配卡片组件
function MatchCard({ user, onChat, onDetail }: MatchCardProps) {
  const [matchReason, setMatchReason] = useState('')

  useEffect(() => {
    // 获取匹配原因
    getMatchReason(user.id).then(res => {
      if (res.data?.reason) {
        setMatchReason(res.data.reason)
      }
    }).catch(err => {
      console.error('获取匹配原因失败:', err)
    })
  }, [user.id])

  return (
    <View className="match-card">
      <View className="match-header">
        <Image
          className="avatar"
          src={user.avatar}
          mode="aspectFill"
          onClick={() => onDetail(user.id)}
        />
        <View className="user-info">
          <Text className="nickname">{user.nickname}</Text>
          <Text className="gender">
            {user.gender === 'male' ? '♂' : '♀'}
          </Text>
          <Text className="age">{user.age}岁</Text>
        </View>
      </View>

      <View className="match-body">
        <View className="info-item">
          <Text className="label">残疾等级:</Text>
          <Text className="value">{user.disabilityLevel}级</Text>
        </View>
        <View className="info-item">
          <Text className="label">残疾类型:</Text>
          <Text className="value">{user.disabilityType}</Text>
        </View>
        <View className="info-item">
          <Text className="label">地区:</Text>
          <Text className="value">
            {user.location?.province} {user.location?.city}
          </Text>
        </View>
        {matchReason && (
          <View className="match-reason">
            <Text className="reason-label">💕 匹配理由:</Text>
            <Text className="reason-text">{matchReason}</Text>
          </View>
        )}
      </View>

      <View className="match-footer">
        <View
          className="btn btn-detail"
          onClick={() => onDetail(user.id)}
        >
          查看详情
        </View>
        <View
          className="btn btn-chat"
          onClick={() => onChat(user.id)}
        >
          开始聊天
        </View>
      </View>
    </View>
  )
}

export default function MatchPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')

  // 加载匹配用户
  const loadUsers = async (pageNum: number = 1, refresh: boolean = false) => {
    if (loading) return

    setLoading(true)
    try {
      const res = await getMatchRecommend(pageNum, 10)

      if (res.data?.users) {
        const newUsers = res.data.users

        if (refresh) {
          setUsers(newUsers)
        } else {
          setUsers(prev => [...prev, ...newUsers])
        }

        setHasMore(newUsers.length >= 10)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('加载匹配用户失败:', error)
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
    // 获取当前用户ID
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo?.id) {
      setCurrentUserId(userInfo.id)
    }

    // 加载第一页数据
    loadUsers(1, true)
  }, [])

  // 下拉刷新
  const onRefresh = () => {
    loadUsers(1, true).then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  // 上拉加载更多
  const onReachBottom = () => {
    if (hasMore && !loading) {
      loadUsers(page + 1)
    }
  }

  // 查看详情
  const handleDetail = (userId: string) => {
    if (!currentUserId) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    Taro.navigateTo({
      url: `/pages/mine/detail?userId=${userId}`
    })
  }

  // 开始聊天
  const handleChat = (userId: string) => {
    if (!currentUserId) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    Taro.navigateTo({
      url: `/pages/chat/detail?userId=${userId}`
    })
  }

  return (
    <View className="match-page">
      <View className="page-header">
        <Text className="page-title">智能匹配</Text>
        <Text className="page-subtitle">为你推荐最适合的TA</Text>
      </View>

      {users.length === 0 && !loading ? (
        <View className="empty-state">
          <Text className="empty-text">暂无匹配用户</Text>
          <Text className="empty-hint">完善个人资料可获得更精准的匹配</Text>
        </View>
      ) : (
        <View className="match-list">
          {users.map(user => (
            <MatchCard
              key={user.id}
              user={user}
              onChat={handleChat}
              onDetail={handleDetail}
            />
          ))}
        </View>
      )}

      {loading && (
        <View className="loading-more">
          <Text>加载中...</Text>
        </View>
      )}

      {!hasMore && users.length > 0 && (
        <View className="no-more">
          <Text>没有更多了</Text>
        </View>
      )}
    </View>
  )
}

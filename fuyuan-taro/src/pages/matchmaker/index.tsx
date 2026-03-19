import { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { LazyImage } from '@/components/LazyImage'
import { SkeletonCard } from '@/components/Skeleton'
import './index.scss'

interface Matchmaker {
  id: string
  name: string
  avatar: string
  rating: number
  serviceCount: number
  successRate: number
  specialty: string[]
  isOnline: boolean
  price: number
}

export default function MatchmakerList() {
  const [loading, setLoading] = useState(true)
  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([])
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadMatchmakers()
  }, [])

  const loadMatchmakers = async () => {
    try {
      setLoading(true)
      // TODO: 调用API获取红娘列表
      // const res = await getMatchmakerList()
      
      // 模拟数据
      setTimeout(() => {
        setMatchmakers([
          {
            id: '1',
            name: '王小红',
            avatar: 'https://via.placeholder.com/150',
            rating: 4.8,
            serviceCount: 256,
            successRate: 92,
            specialty: ['婚恋匹配', '情感咨询'],
            isOnline: true,
            price: 99
          },
          {
            id: '2',
            name: '李美丽',
            avatar: 'https://via.placeholder.com/150',
            rating: 4.9,
            serviceCount: 312,
            successRate: 95,
            specialty: ['高端婚恋', '一对一服务'],
            isOnline: true,
            price: 199
          },
          {
            id: '3',
            name: '张雅琴',
            avatar: 'https://via.placeholder.com/150',
            rating: 4.7,
            serviceCount: 189,
            successRate: 88,
            specialty: ['相亲活动', '形象指导'],
            isOnline: false,
            price: 149
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('加载红娘列表失败:', error)
      setLoading(false)
    }
  }

  const handleSearch = () => {
    console.log('搜索:', keyword)
    // TODO: 实现搜索逻辑
  }

  const handleDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/matchmaker/detail?id=${id}`
    })
  }

  const handleConsult = async (matchmaker: Matchmaker) => {
    if (!matchmaker.isOnline) {
      Taro.showToast({
        title: '红娘不在线',
        icon: 'none'
      })
      return
    }

    try {
      // TODO: 创建咨询会话
      Taro.showToast({
        title: '咨询成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('咨询失败:', error)
    }
  }

  return (
    <View className="matchmaker-list">
      {/* 搜索栏 */}
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索红娘"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={handleSearch}
        />
        <Button className="search-btn" onClick={handleSearch}>
          搜索
        </Button>
      </View>

      {/* 红娘列表 */}
      <ScrollView scrollY className="list-container">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} loading />
          ))
        ) : (
          matchmakers.map(matchmaker => (
            <View key={matchmaker.id} className="matchmaker-card">
              <View className="card-header" onClick={() => handleDetail(matchmaker.id)}>
                <View className="avatar-wrapper">
                  <LazyImage 
                    src={matchmaker.avatar}
                    className="avatar"
                    mode="aspectFill"
                  />
                  {matchmaker.isOnline && <View className="online-badge" />}
                </View>
                
                <View className="info">
                  <View className="name-row">
                    <Text className="name">{matchmaker.name}</Text>
                    <View className="rating">
                      <Text className="star">⭐</Text>
                      <Text className="score">{matchmaker.rating}</Text>
                    </View>
                  </View>
                  
                  <View className="stats">
                    <Text className="stat-item">
                      服务 {matchmaker.serviceCount} 次
                    </Text>
                    <Text className="stat-item">
                      成功率 {matchmaker.successRate}%
                    </Text>
                  </View>
                  
                  <View className="specialty">
                    {matchmaker.specialty.map(tag => (
                      <Text key={tag} className="tag">
                        {tag}
                      </Text>
                    ))}
                  </View>
                  
                  <View className="price-row">
                    <Text className="price">¥{matchmaker.price}</Text>
                    <Text className="unit">/次</Text>
                  </View>
                </View>
              </View>
              
              <View className="card-footer">
                <Button 
                  className="btn-consult"
                  onClick={() => handleConsult(matchmaker)}
                  disabled={!matchmaker.isOnline}
                >
                  {matchmaker.isOnline ? '立即咨询' : '离线'}
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

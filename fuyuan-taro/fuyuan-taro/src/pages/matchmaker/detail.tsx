import { useState, useEffect } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRouter } from '@tarojs/router'
import { LazyImage } from '@/components/LazyImage'
import './detail.scss'

interface MatchmakerDetail {
  id: string
  name: string
  avatar: string
  rating: number
  serviceCount: number
  successRate: number
  specialty: string[]
  isOnline: boolean
  price: number
  intro: string
  reviews: {
    id: string
    userName: string
    avatar: string
    rating: number
    content: string
    date: string
  }[]
}

export default function MatchmakerDetail() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [matchmaker, setMatchmaker] = useState<MatchmakerDetail | null>(null)

  useEffect(() => {
    const { id } = router.params
    if (id) {
      loadMatchmakerDetail(id)
    }
  }, [])

  const loadMatchmakerDetail = async (id: string) => {
    try {
      setLoading(true)
      // TODO: 调用API获取红娘详情
      // const res = await getMatchmakerDetail(id)
      
      // 模拟数据
      setTimeout(() => {
        setMatchmaker({
          id,
          name: '王小红',
          avatar: 'https://via.placeholder.com/150',
          rating: 4.8,
          serviceCount: 256,
          successRate: 92,
          specialty: ['婚恋匹配', '情感咨询'],
          isOnline: true,
          price: 99,
          intro: '拥有10年婚恋服务经验，成功促成256对新人。擅长心理分析和情感匹配，为每位客户提供个性化服务。',
          reviews: [
            {
              id: '1',
              userName: '张先生',
              avatar: 'https://via.placeholder.com/50',
              rating: 5,
              content: '王老师非常专业,很快就帮我找到了合适的另一半。',
              date: '2026-03-15'
            },
            {
              id: '2',
              userName: '李女士',
              avatar: 'https://via.placeholder.com/50',
              rating: 5,
              content: '服务态度很好,推荐的都很符合我的要求。',
              date: '2026-03-10'
            }
          ]
        })
        setLoading(false)
      }, 800)
    } catch (error) {
      console.error('加载红娘详情失败:', error)
      setLoading(false)
    }
  }

  const handleConsult = () => {
    if (!matchmaker?.isOnline) {
      Taro.showToast({
        title: '红娘不在线',
        icon: 'none'
      })
      return
    }

    // TODO: 创建咨询会话
    Taro.showToast({
      title: '咨询功能开发中',
      icon: 'none'
    })
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  if (loading || !matchmaker) {
    return (
      <View className="matchmaker-detail">
        <View className="skeleton-header" />
        <View className="skeleton-content" />
      </View>
    )
  }

  return (
    <ScrollView scrollY className="matchmaker-detail">
      {/* 头部信息 */}
      <View className="header">
        <View className="avatar-wrapper">
          <LazyImage 
            src={matchmaker.avatar}
            className="avatar"
            mode="aspectFill"
          />
          {matchmaker.isOnline && <View className="online-badge" />}
        </View>
        
        <View className="info">
          <Text className="name">{matchmaker.name}</Text>
          
          <View className="rating-row">
            <View className="rating">
              <Text className="star">⭐</Text>
              <Text className="score">{matchmaker.rating}</Text>
            </View>
            <Text className="service-count">
              服务 {matchmaker.serviceCount} 次
            </Text>
          </View>
          
          <View className="success-rate">
            <Text className="rate">成功率</Text>
            <Text className="value">{matchmaker.successRate}%</Text>
          </View>
        </View>
      </View>

      {/* 价格信息 */}
      <View className="price-section">
        <Text className="price-label">咨询费用</Text>
        <View className="price-row">
          <Text className="price">¥{matchmaker.price}</Text>
          <Text className="unit">/次</Text>
        </View>
      </View>

      {/* 服务标签 */}
      <View className="specialty-section">
        <Text className="section-title">专长领域</Text>
        <View className="tags">
          {matchmaker.specialty.map(tag => (
            <Text key={tag} className="tag">{tag}</Text>
          ))}
        </View>
      </View>

      {/* 个人简介 */}
      <View className="intro-section">
        <Text className="section-title">个人简介</Text>
        <Text className="intro-text">{matchmaker.intro}</Text>
      </View>

      {/* 用户评价 */}
      <View className="reviews-section">
        <View className="section-header">
          <Text className="section-title">用户评价</Text>
          <Text className="review-count">
            ({matchmaker.reviews.length})
          </Text>
        </View>
        
        {matchmaker.reviews.map(review => (
          <View key={review.id} className="review-item">
            <Image 
              src={review.avatar}
              className="review-avatar"
              mode="aspectFill"
            />
            
            <View className="review-content">
              <View className="review-header">
                <Text className="user-name">{review.userName}</Text>
                <View className="review-rating">
                  <Text className="star">⭐</Text>
                  <Text className="score">{review.rating}</Text>
                </View>
              </View>
              <Text className="review-text">{review.content}</Text>
              <Text className="review-date">{review.date}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 底部操作栏 */}
      <View className="footer">
        <Button className="btn-share" onClick={handleShare}>
          分享
        </Button>
        <Button 
          className="btn-consult"
          onClick={handleConsult}
          disabled={!matchmaker.isOnline}
        >
          {matchmaker.isOnline ? '立即咨询' : '离线'}
        </Button>
      </View>
    </ScrollView>
  )
}

import { View, Text, Image, Button } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getPostList, likePost, deletePost } from '@/services/post'
import LazyImage from '@/components/LazyImage'
import './index.scss'

interface Post {
  id: string
  userId: string
  nickname: string
  avatar: string
  content: string
  images: string[]
  location?: string
  likeCount: number
  commentCount: number
  isLiked: boolean
  createTime: string
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 加载动态列表
  const loadPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    if (loading) return

    setLoading(true)
    try {
      const res = await getPostList(pageNum, 10)
      if (res.data?.list) {
        const newPosts = res.data.list

        if (refresh) {
          setPosts(newPosts)
        } else {
          setPosts(prev => [...prev, ...newPosts])
        }

        setHasMore(newPosts.length >= 10)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('加载动态失败:', error)
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
    loadPosts(1, true)
  }, [])

  // 下拉刷新
  const onRefresh = () => {
    loadPosts(1, true).then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  // 上拉加载更多
  const onReachBottom = () => {
    if (hasMore && !loading) {
      loadPosts(page + 1)
    }
  }

  // 点赞
  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      await likePost(postId, !isLiked)
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: !isLiked, likeCount: post.likeCount + (isLiked ? -1 : 1) }
            : post
        )
      )
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  // 删除动态
  const handleDelete = async (postId: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除这条动态吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deletePost(postId)
            setPosts(prev => prev.filter(post => post.id !== postId))
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('删除失败:', error)
          }
        }
      }
    })
  }

  // 查看详情
  const handleDetail = (postId: string) => {
    Taro.navigateTo({
      url: `/pages/posts/detail?id=${postId}`
    })
  }

  // 发布动态
  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/posts/publish'
    })
  }

  return (
    <View className="posts-page">
      <View className="page-header">
        <Text className="page-title">动态</Text>
      </View>

      {posts.length === 0 && !loading ? (
        <View className="empty-state">
          <Text className="empty-icon">📰</Text>
          <Text className="empty-text">暂无动态</Text>
          <Text className="empty-hint">发布第一条动态吧</Text>
        </View>
      ) : (
        <View className="posts-list">
          {posts.map(post => (
            <View key={post.id} className="post-item">
              <View className="post-header">
                <Image
                  className="avatar"
                  src={post.avatar}
                  mode="aspectFill"
                />
                <View className="user-info">
                  <Text className="nickname">{post.nickname}</Text>
                  <Text className="time">{post.createTime}</Text>
                </View>
                {post.location && (
                  <View className="location">
                    <Text className="location-icon">📍</Text>
                    <Text className="location-text">{post.location}</Text>
                  </View>
                )}
              </View>

              <View className="post-content">
                <Text className="content-text">{post.content}</Text>
              </View>

              {post.images && post.images.length > 0 && (
                <View className={`post-images images-${post.images.length}`}>
                  {post.images.map((img, index) => (
                    <LazyImage
                      key={index}
                      className="post-image"
                      src={img}
                      mode="aspectFill"
                    />
                  ))}
                </View>
              )}

              <View className="post-footer">
                <View
                  className="action-btn"
                  onClick={() => handleLike(post.id, post.isLiked)}
                >
                  <Text className="action-icon">
                    {post.isLiked ? '❤️' : '🤍'}
                  </Text>
                  <Text className="action-text">{post.likeCount}</Text>
                </View>
                <View className="action-btn" onClick={() => handleDetail(post.id)}>
                  <Text className="action-icon">💬</Text>
                  <Text className="action-text">{post.commentCount}</Text>
                </View>
                <View className="delete-btn" onClick={() => handleDelete(post.id)}>
                  <Text className="delete-icon">🗑️</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {loading && (
        <View className="loading-more">
          <Text>加载中...</Text>
        </View>
      )}

      {!hasMore && posts.length > 0 && (
        <View className="no-more">
          <Text>没有更多了</Text>
        </View>
      )}

      {/* 发布按钮 */}
      <View className="publish-btn" onClick={handlePublish}>
        <Text className="publish-icon">✏️</Text>
      </View>
    </View>
  )
}

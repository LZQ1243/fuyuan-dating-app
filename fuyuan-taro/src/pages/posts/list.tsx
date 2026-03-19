import { View, Text, Image, ScrollView } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro, { showToast, pullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { getPostList, likePost, unlikePost } from '@/services/post'
import './list.scss'

export default function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async (isRefresh = false) => {
    if (loading) return

    try {
      setLoading(true)
      const currentPage = isRefresh ? 1 : page

      const res = await getPostList({
        page: currentPage,
        pageSize: 20
      })

      if (res.data.code === 200) {
        const newPosts = res.data.data || []

        if (isRefresh) {
          setPosts(newPosts)
          setPage(1)
        } else {
          setPosts(prev => [...prev, ...newPosts])
        }

        setHasMore(newPosts.length >= 20)
      }
    } catch (error) {
      console.error('加载动态失败:', error)
      showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
      if (isRefresh) {
        stopPullDownRefresh()
      }
    }
  }

  const handleRefresh = () => {
    loadPosts(true)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
      loadPosts(false)
    }
  }

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await unlikePost(postId)
      } else {
        await likePost(postId)
      }

      // 更新本地状态
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: !isLiked,
            likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
          }
        }
        return post
      }))
    } catch (error) {
      console.error('点赞失败:', error)
      showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleDetail = (postId) => {
    Taro.navigateTo({
      url: `/pages/posts/detail?id=${postId}`
    })
  }

  const renderImages = (images) => {
    if (!images || images.length === 0) return null

    if (images.length === 1) {
      return (
        <View className='single-image'>
          <Image
            className='post-image'
            src={images[0]}
            mode='aspectFill'
          />
        </View>
      )
    }

    return (
      <View className='multi-images'>
        {images.map((img, index) => (
          <Image
            key={index}
            className='post-image'
            src={img}
            mode='aspectFill'
          />
        ))}
      </View>
    )
  }

  return (
    <View className='post-list-page'>
      <View className='header'>
        <Text className='title'>动态</Text>
      </View>

      <ScrollView
        scrollY
        className='post-list'
        onScrollToLower={handleLoadMore}
        lowerThreshold={100}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        {posts.map((post, index) => (
          <View
            key={post._id || index}
            className='post-card'
            onClick={() => handleDetail(post._id)}
          >
            <View className='user-info'>
              <Image
                className='avatar'
                src={post.user?.avatar || 'https://via.placeholder.com/100'}
                mode='aspectFill'
              />
              <View className='user-text'>
                <Text className='nickname'>{post.user?.nickname || '用户'}</Text>
                <Text className='time'>
                  {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </View>

            {post.content && (
              <Text className='content'>{post.content}</Text>
            )}

            {renderImages(post.images)}

            <View className='actions'>
              <View
                className={`action-item ${post.isLiked ? 'liked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(post._id, post.isLiked)
                }}
              >
                <Text className='action-icon'>
                  {post.isLiked ? '♥' : '♡'}
                </Text>
                <Text className='action-count'>{post.likeCount || 0}</Text>
              </View>

              <View className='action-item'>
                <Text className='action-icon'>💬</Text>
                <Text className='action-count'>{post.commentCount || 0}</Text>
              </View>
            </View>
          </View>
        ))}

        {!hasMore && posts.length > 0 && (
          <View className='no-more'>
            <Text className='no-more-text'>没有更多了</Text>
          </View>
        )}

        {!loading && posts.length === 0 && (
          <View className='empty'>
            <Text className='empty-text'>暂无动态</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

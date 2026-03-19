import { View, Text, Image, ScrollView, Input, Button } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro, { showToast, previewImage } from '@tarojs/taro'
import { getPostDetail, likePost, unlikePost, commentPost, deleteComment } from '@/services/post'
import './detail.scss'

export default function PostDetail() {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      loadPostDetail(params.id)
      loadComments(params.id)
    }
  }, [])

  const loadPostDetail = async (postId) => {
    try {
      setLoading(true)
      const res = await getPostDetail(postId)

      if (res.data.code === 200) {
        setPost(res.data.data)
      }
    } catch (error) {
      console.error('加载动态详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (postId, currentPage = 1) => {
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/api/posts/${postId}/comments`,
        method: 'GET',
        data: { page: currentPage, pageSize: 20 }
      })

      if (res.data.code === 200) {
        if (currentPage === 1) {
          setComments(res.data.data || [])
        } else {
          setComments(prev => [...prev, ...(res.data.data || [])])
        }
      }
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  const handleLike = async () => {
    try {
      if (post.isLiked) {
        await unlikePost(post._id)
      } else {
        await likePost(post._id)
      }

      setPost({
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
      })
    } catch (error) {
      showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleComment = async () => {
    if (!commentInput.trim()) {
      showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    try {
      await commentPost(post._id, commentInput)
      setCommentInput('')

      // 重新加载评论
      await loadComments(post._id, 1)
      setPage(1)

      showToast({ title: '评论成功', icon: 'success' })
    } catch (error) {
      console.error('评论失败:', error)
      showToast({ title: '评论失败', icon: 'none' })
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(post._id, commentId)
      setComments(comments.filter(c => c._id !== commentId))
      showToast({ title: '删除成功', icon: 'success' })
    } catch (error) {
      console.error('删除评论失败:', error)
      showToast({ title: '删除失败', icon: 'none' })
    }
  }

  const handlePreviewImage = (url) => {
    const imageUrls = post.images || []
    previewImage({
      current: url,
      urls: imageUrls
    })
  }

  const handleLoadMoreComments = () => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setPage(prev => prev + 1)
      loadComments(params.id, page + 1)
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else {
      return `${Math.floor(diff / day)}天前`
    }
  }

  if (loading || !post) {
    return (
      <View className='post-detail-page'>
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='post-detail-page'>
      <ScrollView scrollY className='detail-scroll'>
        {/* 动态内容 */}
        <View className='post-content'>
          <View className='user-info'>
            <Image
              className='avatar'
              src={post.user?.avatar}
              mode='aspectFill'
            />
            <View className='user-text'>
              <Text className='nickname'>{post.user?.nickname}</Text>
              <Text className='time'>{formatTime(post.createdAt)}</Text>
            </View>
          </View>

          {post.content && (
            <Text className='content'>{post.content}</Text>
          )}

          {post.images && post.images.length > 0 && (
            <View className={`images-container ${post.images.length}`}>
              {post.images.map((img, index) => (
                <Image
                  key={index}
                  className='post-image'
                  src={img}
                  mode='aspectFill'
                  onClick={() => handlePreviewImage(img)}
                />
              ))}
            </View>
          )}

          {post.location && (
            <View className='location'>
              <Text className='location-icon'>📍</Text>
              <Text className='location-text'>{post.location.address}</Text>
            </View>
          )}

          <View className='actions'>
            <View
              className={`action-item ${post.isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Text className='action-icon'>{post.isLiked ? '♥' : '♡'}</Text>
              <Text className='action-count'>{post.likeCount}</Text>
            </View>

            <View className='action-item'>
              <Text className='action-icon'>💬</Text>
              <Text className='action-count'>{post.commentCount}</Text>
            </View>
          </View>
        </View>

        {/* 评论区 */}
        <View className='comments-section'>
          <Text className='section-title'>评论 ({post.commentCount})</Text>

          {comments.length === 0 ? (
            <View className='empty-comments'>
              <Text className='empty-text'>暂无评论</Text>
            </View>
          ) : (
            <View className='comment-list'>
              {comments.map((comment, index) => (
                <View key={comment._id || index} className='comment-item'>
                  <Image
                    className='comment-avatar'
                    src={comment.user?.avatar}
                    mode='aspectFill'
                  />
                  <View className='comment-content'>
                    <Text className='comment-user'>{comment.user?.nickname}</Text>
                    <Text className='comment-text'>{comment.content}</Text>
                    <Text className='comment-time'>{formatTime(comment.createdAt)}</Text>
                  </View>

                  {comment.isMine && (
                    <View
                      className='delete-btn'
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <Text className='delete-text'>删除</Text>
                    </View>
                  )}
                </View>
              ))}

              {post.commentCount > comments.length && (
                <View className='load-more' onClick={handleLoadMoreComments}>
                  <Text className='load-more-text'>加载更多评论</Text>
                </View>
              )}
            </View>
          )}

          {/* 评论输入 */}
          <View className='comment-input-section'>
            <Input
              className='comment-input'
              value={commentInput}
              onInput={(e) => setCommentInput(e.detail.value)}
              placeholder='写下你的评论...'
              maxlength={200}
            />
            <Button
              className='comment-btn'
              onClick={handleComment}
            >
              发送
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

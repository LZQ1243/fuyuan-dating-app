<template>
  <view class="post-detail-container">
    <scroll-view scroll-y class="scroll-container">
      <!-- 动态内容 -->
      <view class="post-card" v-if="post">
        <view class="post-header" @click="viewUser">
          <image
            class="user-avatar"
            :src="post.user?.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="user-info">
            <text class="user-name">{{ post.user?.nickname || '匿名' }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
        </view>

        <view class="post-content">
          <text class="text">{{ post.content }}</text>
        </view>

        <view class="post-media" v-if="post.media_urls && post.media_urls.length > 0">
          <image
            v-for="(url, index) in post.media_urls"
            :key="index"
            class="media-item"
            :src="url"
            mode="widthFix"
            @click="previewImage(post.media_urls, index)"
          ></image>
        </view>

        <view class="post-actions">
          <view class="action-item" @click="handleLike">
            <text class="icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
            <text class="count">{{ post.likes_count }}</text>
          </view>
          <view class="action-item">
            <text class="icon">💬</text>
            <text class="count">{{ post.comments_count }}</text>
          </view>
          <view class="action-item" @click="sharePost">
            <text class="icon">📤</text>
          </view>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comments-section">
        <view class="section-header">
          <text class="title">评论 ({{ comments.length }})</text>
        </view>

        <view class="comment-list" v-if="comments.length > 0">
          <view
            v-for="comment in comments"
            :key="comment.comment_id"
            class="comment-item"
          >
            <image
              class="comment-avatar"
              :src="comment.user?.avatar || '/static/default-avatar.png'"
              mode="aspectFill"
            ></image>
            <view class="comment-content">
              <view class="comment-header">
                <text class="user-name">{{ comment.user?.nickname || '匿名' }}</text>
                <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
            </view>
          </view>
        </view>

        <view class="empty-comments" v-else>
          <text>暂无评论，快来抢沙发吧~</text>
        </view>

        <view class="load-more" v-if="hasMore" @click="loadComments">
          <text>{{ loading ? '加载中...' : '加载更多' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部评论输入 -->
    <view class="comment-footer">
      <u-input
        v-model="commentText"
        placeholder="写下你的评论..."
        :border="false"
        :custom-style="{
          flex: 1,
          marginRight: '20rpx',
          backgroundColor: '#f5f5f5',
          borderRadius: '40rpx',
          padding: '20rpx 30rpx'
        }"
        @confirm="submitComment"
      ></u-input>
      <u-button
        type="primary"
        size="small"
        :disabled="!commentText.trim()"
        @click="submitComment"
        :custom-style="{
          borderRadius: '50%',
          width: '70rpx',
          height: '70rpx',
          padding: 0,
          backgroundColor: '#FF6B6B'
        }"
      >
        发
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPosts as getPostApi, likePost, getComments, commentPost } from '@/api/post'
import { getUserInfo } from '@/api/user'

const post = ref(null)
const comments = ref([])
const commentText = ref('')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const postId = currentPage.options.post_id

  if (postId) {
    await loadPost(postId)
    await loadComments(postId)
  }
})

const loadPost = async (postId) => {
  try {
    const res = await getPostApi({ post_id: postId })
    if (res.data.posts && res.data.posts.length > 0) {
      post.value = res.data.posts[0]
    }
  } catch (error) {
    console.error('获取动态详情失败:', error)
  }
}

const loadComments = async (postId, append = false) => {
  if (loading.value || !hasMore.value) return

  try {
    loading.value = true
    const currentPage = append ? page.value + 1 : 1
    const res = await getComments(postId, { page: currentPage, limit: 20 })

    if (append) {
      comments.value = [...comments.value, ...res.data.comments]
    } else {
      comments.value = res.data.comments
    }

    page.value = res.data.pagination.page
    hasMore.value = res.data.pagination.page < res.data.pagination.total_pages
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`

  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const viewUser = () => {
  if (!post.value?.user?.user_id) return

  uni.navigateTo({
    url: `/pages/user/detail?user_id=${post.value.user.user_id}`
  })
}

const handleLike = async () => {
  if (!post.value) return

  try {
    await likePost(post.value.post_id)
    post.value.is_liked = !post.value.is_liked
    post.value.likes_count += post.value.is_liked ? 1 : -1
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const sharePost = () => {
  uni.showShareMenu({
    withShareTicket: true
  })
}

const previewImage = (urls, current) => {
  uni.previewImage({
    urls,
    current
  })
}

const submitComment = async () => {
  if (!post.value || !commentText.value.trim()) {
    return
  }

  const content = commentText.value
  commentText.value = ''

  try {
    await commentPost(post.value.post_id, { content })
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    })

    // 重新加载评论
    page.value = 0
    hasMore.value = true
    await loadComments(post.value.post_id)
  } catch (error) {
    console.error('评论失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.post-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.scroll-container {
  flex: 1;
  overflow: hidden;
}

.post-card {
  background: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .post-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 5rpx;

      .user-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
      }

      .post-time {
        font-size: 22rpx;
        color: #999999;
      }
    }
  }

  .post-content {
    margin-bottom: 20rpx;

    .text {
      font-size: 28rpx;
      color: #333333;
      line-height: 1.6;
    }
  }

  .post-media {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 20rpx;

    .media-item {
      max-width: 100%;
      border-radius: 10rpx;
    }
  }

  .post-actions {
    display: flex;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .action-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
      font-size: 24rpx;
      color: #666666;

      .icon {
        font-size: 32rpx;
      }

      .count {
        font-size: 24rpx;
      }
    }
  }
}

.comments-section {
  background: #FFFFFF;
  padding: 30rpx;

  .section-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }
  }

  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }

  .comment-item {
    display: flex;
    gap: 20rpx;

    .comment-avatar {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 15rpx;
        margin-bottom: 10rpx;

        .user-name {
          font-size: 26rpx;
          font-weight: bold;
          color: #333333;
        }

        .comment-time {
          font-size: 22rpx;
          color: #999999;
        }
      }

      .comment-text {
        font-size: 26rpx;
        color: #666666;
        line-height: 1.5;
      }
    }
  }

  .empty-comments {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: #999999;
  }

  .load-more {
    text-align: center;
    padding: 30rpx 0;
    font-size: 24rpx;
    color: #FF6B6B;
  }
}

.comment-footer {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
}
</style>

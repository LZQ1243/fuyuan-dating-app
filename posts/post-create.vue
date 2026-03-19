<template>
  <view class="post-create-container">
    <view class="header">
      <text class="cancel-btn" @click="handleCancel">取消</text>
      <text class="title">发布动态</text>
      <u-button
        type="primary"
        size="small"
        :loading="loading"
        :disabled="!canSubmit"
        @click="handleSubmit"
        :custom-style="{
          borderRadius: '40rpx',
          height: '60rpx',
          padding: '0 30rpx',
          fontSize: '24rpx',
          backgroundColor: '#FF6B6B'
        }"
      >
        发布
      </u-button>
    </view>

    <view class="content">
      <textarea
        class="post-textarea"
        v-model="content"
        placeholder="分享你的生活..."
        :maxlength="500"
        :show-confirm-bar="false"
        auto-height
      ></textarea>

      <view class="media-grid" v-if="mediaUrls.length > 0">
        <view
          v-for="(url, index) in mediaUrls"
          :key="index"
          class="media-item"
        >
          <image
            class="media-image"
            :src="url"
            mode="aspectFill"
          ></image>
          <view class="delete-btn" @click="removeMedia(index)">
            <text>✕</text>
          </view>
        </view>

        <view
          v-if="mediaUrls.length < 9"
          class="add-media-btn"
          @click="chooseMedia"
        >
          <text class="add-icon">+</text>
          <text class="add-text">添加图片</text>
        </view>
      </view>

      <view class="empty-media" v-else @click="chooseMedia">
        <text class="empty-icon">📷</text>
        <text class="empty-text">添加图片（最多9张）</text>
      </view>

      <view class="options">
        <view class="option-item" @click="togglePrivacy">
          <text class="option-icon">🔒</text>
          <text class="option-text">仅自己可见</text>
          <u-switch v-model="isPrivate" size="24"></u-switch>
        </view>
      </view>
    </view>

    <view class="keyboard-placeholder"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createPost } from '@/api/post'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const content = ref('')
const mediaUrls = ref([])
const isPrivate = ref(false)
const loading = ref(false)

const canSubmit = computed(() => {
  return content.value.trim() || mediaUrls.value.length > 0
})

const chooseMedia = () => {
  const remainingCount = 9 - mediaUrls.value.length

  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePaths = res.tempFilePaths

      // 上传图片
      for (const filePath of tempFilePaths) {
        try {
          const uploadRes = await uni.uploadFile({
            url: 'http://localhost:3000/api/upload',
            filePath,
            name: 'file',
            header: {
              'Authorization': `Bearer ${userStore.token}`
            }
          })

          const uploadData = JSON.parse(uploadRes.data)
          if (uploadData.code === 200) {
            mediaUrls.value.push(uploadData.data.url)
          }
        } catch (error) {
          console.error('上传图片失败:', error)
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

const removeMedia = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        mediaUrls.value.splice(index, 1)
      }
    }
  })
}

const togglePrivacy = () => {
  isPrivate.value = !isPrivate.value
}

const handleSubmit = async () => {
  if (!canSubmit.value || loading.value) {
    return
  }

  if (!content.value.trim() && mediaUrls.value.length === 0) {
    uni.showToast({
      title: '请输入内容或添加图片',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    await createPost({
      content: content.value.trim(),
      media_urls: mediaUrls.value,
      type: mediaUrls.value.length > 0 ? 'image' : 'text',
      is_private: isPrivate.value
    })

    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('发布失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (content.value.trim() || mediaUrls.value.length > 0) {
    uni.showModal({
      title: '提示',
      content: '确定要放弃发布吗？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}
</script>

<style lang="scss" scoped>
.post-create-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;

  .cancel-btn {
    font-size: 28rpx;
    color: #666666;
  }

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
  }
}

.content {
  flex: 1;
  background: #FFFFFF;
  padding: 30rpx;
  overflow-y: auto;

  .post-textarea {
    width: 100%;
    min-height: 300rpx;
    font-size: 32rpx;
    line-height: 1.6;
    color: #333333;
    border: none;
    outline: none;
    resize: none;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
    margin-top: 30rpx;

    .media-item {
      position: relative;
      aspect-ratio: 1;

      .media-image {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
      }

      .delete-btn {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 50rpx;
        height: 50rpx;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          color: #FFFFFF;
          font-size: 32rpx;
          line-height: 1;
        }
      }
    }

    .add-media-btn {
      aspect-ratio: 1;
      background: #f8f8f8;
      border: 2rpx dashed #d9d9d9;
      border-radius: 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10rpx;

      .add-icon {
        font-size: 60rpx;
        color: #999999;
        line-height: 1;
      }

      .add-text {
        font-size: 22rpx;
        color: #999999;
      }
    }
  }

  .empty-media {
    margin-top: 30rpx;
    padding: 80rpx 0;
    background: #f8f8f8;
    border: 2rpx dashed #d9d9d9;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15rpx;

    .empty-icon {
      font-size: 80rpx;
    }

    .empty-text {
      font-size: 24rpx;
      color: #999999;
    }
  }

  .options {
    margin-top: 40rpx;

    .option-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 30rpx 0;
      border-top: 1rpx solid #f0f0f0;

      .option-icon {
        font-size: 36rpx;
      }

      .option-text {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
      }
    }
  }
}

.keyboard-placeholder {
  height: 500rpx;
}
</style>

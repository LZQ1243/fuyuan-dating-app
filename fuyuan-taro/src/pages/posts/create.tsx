import { View, Text, Textarea, Button, Image } from '@tarojs/components'
import React, { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { createPost } from '@/services/post'
import './create.scss'

export default function PostCreate() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChooseImage = async () => {
    if (images.length >= 9) {
      showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths) {
        // TODO: 上传图片到服务器
        setImages(prev => [...prev, ...res.tempFilePaths])
      }
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  }

  const handleDeleteImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleChooseLocation = async () => {
    try {
      const res = await Taro.chooseLocation({
        type: 'wgs84'
      })

      if (res) {
        setLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.name || res.address
        })
      }
    } catch (error) {
      console.error('选择位置失败:', error)
    }
  }

  const handlePublish = async () => {
    if (!content.trim()) {
      showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    if (content.length > 500) {
      showToast({ title: '内容不能超过500字', icon: 'none' })
      return
    }

    try {
      setLoading(true)

      // 确保所有图片都已上传
      const imageUrls = images.filter(img => img.startsWith('http'))

      await createPost({
        content,
        images: imageUrls,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        } : undefined
      })

      showToast({ title: '发布成功', icon: 'success' })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('发布失败:', error)
      showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='post-create-page'>
      <View className='header'>
        <Text className='title'>发布动态</Text>
      </View>

      <View className='form'>
        <View className='form-item'>
          <Textarea
            className='content-input'
            placeholder='分享你的心情...'
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
            showConfirmBar
            autoHeight
          />
          <View className='char-count'>
            <Text className={content.length > 500 ? 'over-limit' : ''}>
              {content.length}/500
            </Text>
          </View>
        </View>

        <View className='form-item images-section'>
          <Text className='section-title'>添加图片</Text>
          <View className='images-grid'>
            {images.map((img, index) => (
              <View key={index} className='image-item'>
                <Image
                  className='image'
                  src={img}
                  mode='aspectFill'
                />
                <View
                  className='delete-btn'
                  onClick={() => handleDeleteImage(index)}
                >
                  <Text className='delete-icon'>×</Text>
                </View>
              </View>
            ))}

            {images.length < 9 && (
              <View
                className='add-image'
                onClick={handleChooseImage}
              >
                <Text className='add-icon'>+</Text>
              </View>
            )}
          </View>
          <Text className='hint'>最多9张图片</Text>
        </View>

        <View className='form-item location-section'>
          <Text className='section-title'>添加位置</Text>
          {location ? (
            <View className='location-info' onClick={handleChooseLocation}>
              <Text className='location-icon'>📍</Text>
              <Text className='location-text'>{location.address}</Text>
              <Text className='change-btn'>更换</Text>
            </View>
          ) : (
            <View className='add-location' onClick={handleChooseLocation}>
              <Text className='location-icon'>📍</Text>
              <Text className='add-text'>添加位置</Text>
            </View>
          )}
        </View>

        <Button
          className='publish-btn'
          onClick={handlePublish}
          loading={loading}
        >
          发布
        </Button>
      </View>
    </View>
  )
}

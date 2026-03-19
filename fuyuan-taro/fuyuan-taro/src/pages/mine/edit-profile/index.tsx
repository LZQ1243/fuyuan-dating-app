import { View, Text, Textarea, Button, Image, Input, Picker, ScrollView, Radio } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useRouter } from '@tarojs/router'
import { getUserInfo, updateProfile } from '@/services/user'
import './index.scss'

interface FormData {
  username: string
  avatar: string
  gender: 'male' | 'female'
  age: number
  disabilityType: string
  disabilityLevel: string
  disabilityCertificate: string
  disabilityCertificateBack: string
  bio: string
  location?: {
    province: string
    city: string
  }
}

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    avatar: '',
    gender: 'female',
    age: 25,
    disabilityType: '',
    disabilityLevel: '',
    disabilityCertificate: '',
    disabilityCertificateBack: '',
    bio: '',
    location: undefined
  })

  const [preferences, setPreferences] = useState({
    ageMin: 18,
    ageMax: 60,
    genderPreference: 'both',
    distanceMax: 50,
    showPhone: false,
    showDistance: true,
    allowMatch: true
  })

  const [userInfo, setUserInfo] = useState<any>(null)

  const disabilityTypes = [
    '视力残疾',
    '听力残疾',
    '言语残疾',
    '肢体残疾',
    '智力残疾',
    '精神残疾',
    '多重残疾'
  ]

  const disabilityLevels = ['一级', '二级', '三级', '四级']

  // 加载用户信息
  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      setLoading(true)
      const info = await getUserInfo()
      if (info?.data) {
        setUserInfo(info.data)
        setFormData({
          username: info.data.username || '',
          avatar: info.data.avatar || '',
          gender: info.data.gender || 'female',
          age: info.data.age || 25,
          disabilityType: info.data.disabilityType || '',
          disabilityLevel: info.data.disabilityLevel || '',
          disabilityCertificate: info.data.disabilityCertificate || '',
          disabilityCertificateBack: info.data.disabilityCertificateBack || '',
          bio: info.data.bio || '',
          location: info.data.location || undefined
        })
        if (info.data.preferences) {
          setPreferences(info.data.preferences)
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 选择图片
  const chooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera']
    }).then((res: any) => {
      setFormData({
        ...formData,
        avatar: res.tempFilePaths[0]
      })
    })
  }

  // 保存更改
  const handleSave = async () => {
    try {
      setLoading(true)

      await updateProfile({
        username: formData.username,
        gender: formData.gender,
        age: formData.age,
        disabilityType: formData.disabilityType,
        disabilityLevel: formData.disabilityLevel,
        bio: formData.bio,
        location: formData.location,
        preferences
      })

      setUserInfo({
        ...userInfo,
        preferences: preferences
      })

      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })

      router.switchTab('/pages/mine/index')
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 实名认证页面
  const handleVerification = () => {
    if (userInfo?.verified) {
      Taro.showToast({
        title: '已认证',
        icon: 'success'
      })
      return
    }

    Taro.navigateTo({
      url: '/pages/mine/verification'
    })
  }

  // 设置页面
  const handleSettings = () => {
    Taro.navigateTo({
      url: '/pages/mine/settings'
    })
  }

  return (
    <View className="edit-profile-page">
      {/* 头部导航栏 */}
      <View className="nav-bar">
        <Text className="nav-title">编辑资料</Text>
        <View className="nav-back" onClick={() => router.switchTab('/pages/mine/index')}>
          <Text className="nav-back-text">← 返回</Text>
        </View>
      </View>

      {/* 主内容区 */}
      <ScrollView
        scrollY
        className="scroll-area"
      >
        {/* 顶部提示 */}
        {loading && (
          <View className="loading-wrapper">
            <Text className="loading-text">加载中...</Text>
          </View>
        )}

        {/* 基本信息 */}
        <View className="section">
          <Text className="section-title">基本信息</Text>
          <View className="info-card">
            <View className="avatar-section">
              {formData.avatar ? (
                <Image
                  className="avatar-upload"
                  src={formData.avatar}
                  onClick={chooseImage}
                />
              ) : (
                <View className="avatar-placeholder" onClick={chooseImage}>
                  <Text className="placeholder-text">+</Text>
                  <Text className="placeholder-icon">📷</Text>
                </View>
              )}
            </View>

            <View className="form-section">
              <Input
                className="form-input"
                value={formData.username}
                placeholder="请输入用户名"
                onInput={(e: any) => setFormData({ ...formData, username: e.detail.value })}
              />

              <View className="form-row">
                <Text className="form-label">性别</Text>
                <Radio.Group
                  value={formData.gender}
                  onChange={(e: any) => setFormData({ ...formData, gender: e.detail.value })}
                  style={{ display: 'flex', gap: '40px' }}
                >
                  <Radio value="male">男</Radio>
                  <Radio value="female">女</Radio>
                </Radio.Group>
              </View>

              <Input
                className="form-input"
                type="digit"
                value={String(formData.age)}
                placeholder="年龄"
                onInput={(e: any) => setFormData({ ...formData, age: parseInt(e.detail.value) || 25 })}
              />
            </View>
          </View>
        </View>

        {/* 残疾信息 */}
        <View className="section">
          <Text className="section-title">残疾信息</Text>
          <View className="info-card">
            <View className="form-section">
              <Input
                className="form-input"
                value={formData.disabilityType}
                placeholder="残疾类型"
                onInput={(e: any) => setFormData({ ...formData, disabilityType: e.detail.value })}
              />

              <Picker
                mode="selector"
                range={disabilityTypes}
                value={disabilityTypes.indexOf(formData.disabilityType)}
                onChange={(e: any) => setFormData({ ...formData, disabilityType: disabilityTypes[e.detail.value] })}
              >
                <View className="picker">
                  <Text className="picker-text">
                    {formData.disabilityType || '请选择残疾类型'}
                  </Text>
                  <Text className="picker-arrow">›</Text>
                </View>
              </Picker>
            </View>

            <Input
              className="form-input"
              type="digit"
              value={String(formData.disabilityLevel)}
              placeholder="残疾等级"
              onInput={(e: any) => setFormData({ ...formData, disabilityLevel: e.detail.value })}
            />

            <Picker
              mode="selector"
              range={disabilityLevels}
              value={disabilityLevels.indexOf(formData.disabilityLevel)}
              onChange={(e: any) => setFormData({ ...formData, disabilityLevel: disabilityLevels[e.detail.value] })}
            >
              <View className="picker">
                <Text className="picker-text">
                  {formData.disabilityLevel || '请选择残疾等级'}
                </Text>
                <Text className="picker-arrow">›</Text>
              </View>
            </Picker>
          </View>
        </View>

        {/* 认证信息 */}
        <View className="section">
          <Text className="section-title">认证信息</Text>
          <View className="info-card">
            <View className="form-section">
              <Input
                className="form-input"
                value={formData.disabilityCertificate}
                placeholder="残疾证正面"
                onInput={(e: any) => setFormData({ ...formData, disabilityCertificate: e.detail.value })}
              />

              <Input
                className="form-input"
                value={formData.disabilityCertificateBack}
                placeholder="残疾证反面"
                onInput={(e: any) => setFormData({ ...formData, disabilityCertificateBack: e.detail.value })}
              />
            </View>
          </View>
        </View>

        {/* 个人简介 */}
        <View className="section">
          <Text className="section-title">个人简介</Text>
          <View className="info-card">
            <View className="form-section">
              <Textarea
                className="form-input"
                value={formData.bio}
                placeholder="介绍一下自己吧..."
                onInput={(e: any) => setFormData({ ...formData, bio: e.detail.value })}
                maxlength={200}
                showWordLimit
              />
            </View>
          </View>
        </View>

        {/* 地区信息 */}
        <View className="section">
          <Text className="section-title">地区信息</Text>
          <View className="info-card">
            <Picker
              mode="region"
              onChange={(e: any) => {
                const location = {
                  province: e.detail.value[0] || '',
                  city: e.detail.value[1] || ''
                }
                setFormData({ ...formData, location })
              }}
            >
              <View className="picker">
                <Text className="picker-text">
                  {formData.location ? `${formData.location.province} ${formData.location.city}` : '请选择地区'}
                </Text>
                <Text className="picker-arrow">›</Text>
              </View>
            </Picker>
          </View>
        </View>
      </ScrollView>

      {/* 侧边栏菜单 */}
      <View className="side-menu">
        <View className="side-title">我的</View>
        <View className="menu-item" onClick={() => router.switchTab('/pages/mine/index')}>
          <Text className="menu-icon">👤</Text>
          <Text className="menu-text">首页</Text>
        </View>
        <View className="menu-divider"></View>
        <View className="menu-item" onClick={() => router.switchTab('/pages/mine/edit-profile')}>
          <Text className="menu-icon">📝</Text>
          <Text className="menu-text">编辑资料</Text>
        </View>
        <View className="menu-divider"></View>
        <View className="menu-item" onClick={handleSettings}>
          <Text className="menu-icon">⚙️</Text>
          <Text className="menu-text">设置</Text>
        </View>
        <View className="menu-divider"></View>
        <View className="menu-item" onClick={handleVerification}>
          <Text className="menu-icon">📋</Text>
          <Text className="menu-text">实名认证</Text>
        </View>
      </View>

      {/* 底部保存按钮 */}
      <View className="save-btn">
        <Button
          className="save-button"
          type="primary"
          loading={loading}
          onClick={handleSave}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </View>
    </View>
  )
}

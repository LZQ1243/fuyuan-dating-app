import { View, Text, Input, Button, Picker, Image } from '@tarojs/components'
import React, { useState } from 'react'
import Taro, { showToast, chooseImage } from '@tarojs/taro'
import { updateProfile, uploadImage } from '@/services/user'
import './edit-profile.scss'

export default function EditProfile() {
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    gender: 'male',
    birthday: '',
    province: '',
    city: '',
    height: '',
    weight: '',
    occupation: '',
    education: '',
    bio: ''
  })
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChooseAvatar = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        try {
          setLoading(true)
          const avatarUrl = await uploadAvatar(res.tempFilePaths[0])
          setAvatar(avatarUrl)
          showToast({ title: '头像上传成功', icon: 'success' })
        } catch (error) {
          console.error('上传头像失败:', error)
          showToast({ title: '上传失败', icon: 'none' })
        } finally {
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('选择头像失败:', error)
      showToast({ title: '选择失败', icon: 'none' })
    }
  }

  const handleGenderChange = (e) => {
    setUserInfo({ ...userInfo, gender: e.detail.value })
  }

  const handleBirthdayChange = (e) => {
    setUserInfo({ ...userInfo, birthday: e.detail.value })
  }

  const handleEducationChange = (e) => {
    setUserInfo({ ...userInfo, education: e.detail.value })
  }

  const handleInput = (field, value) => {
    setUserInfo({ ...userInfo, [field]: value })
  }

  const handleSave = async () => {
    // 表单验证
    if (!userInfo.nickname.trim()) {
      showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    try {
      setLoading(true)

      await updateProfile(userInfo)
      showToast({ title: '保存成功', icon: 'success' })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存失败:', error)
      showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='edit-profile-page'>
      <View className='header'>
        <Text className='title'>编辑资料</Text>
      </View>

      <ScrollView scrollY className='form-container'>
        {/* 头像 */}
        <View className='form-section'>
          <Text className='section-title'>头像</Text>
          <View className='avatar-section' onClick={handleChooseAvatar}>
            <Image
              className='avatar-preview'
              src={avatar || 'https://via.placeholder.com/200'}
              mode='aspectFill'
            />
            <Text className='avatar-hint'>点击更换头像</Text>
          </View>
        </View>

        {/* 基本信息 */}
        <View className='form-section'>
          <Text className='section-title'>基本信息</Text>

          <View className='form-item'>
            <Text className='label'>昵称</Text>
            <Input
              className='input'
              value={userInfo.nickname}
              onInput={(e) => handleInput('nickname', e.detail.value)}
              placeholder='请输入昵称'
              maxlength={20}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>性别</Text>
            <Picker
              mode='selector'
              range={['男', '女']}
              value={userInfo.gender === 'male' ? 0 : 1}
              onChange={handleGenderChange}
            >
              <View className='picker'>
                <Text className='picker-text'>
                  {userInfo.gender === 'male' ? '男' : '女'}
                </Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          <View className='form-item'>
            <Text className='label'>生日</Text>
            <Picker
              mode='date'
              value={userInfo.birthday}
              onChange={handleBirthdayChange}
            >
              <View className='picker'>
                <Text className='picker-text'>
                  {userInfo.birthday || '选择生日'}
                </Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          <View className='form-item'>
            <Text className='label'>学历</Text>
            <Picker
              mode='selector'
              range={['初中', '高中', '大专', '本科', '硕士', '博士']}
              value={['初中', '高中', '大专', '本科', '硕士', '博士'].indexOf(userInfo.education)}
              onChange={handleEducationChange}
            >
              <View className='picker'>
                <Text className='picker-text'>
                  {userInfo.education || '选择学历'}
                </Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>
        </View>

        {/* 详细信息 */}
        <View className='form-section'>
          <Text className='section-title'>详细信息</Text>

          <View className='form-item'>
            <Text className='label'>身高</Text>
            <Input
              className='input'
              type='digit'
              value={userInfo.height}
              onInput={(e) => handleInput('height', e.detail.value)}
              placeholder='请输入身高(cm)'
              maxlength={3}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>体重</Text>
            <Input
              className='input'
              type='digit'
              value={userInfo.weight}
              onInput={(e) => handleInput('weight', e.detail.value)}
              placeholder='请输入体重(kg)'
              maxlength={3}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>职业</Text>
            <Input
              className='input'
              value={userInfo.occupation}
              onInput={(e) => handleInput('occupation', e.detail.value)}
              placeholder='请输入职业'
              maxlength={30}
            />
          </View>
        </View>

        {/* 个人简介 */}
        <View className='form-section'>
          <Text className='section-title'>个人简介</Text>
          <Input
            className='textarea-input'
            type='textarea'
            value={userInfo.bio}
            onInput={(e) => handleInput('bio', e.detail.value)}
            placeholder='介绍一下自己...'
            maxlength={200}
            autoHeight
          />
        </View>
      </ScrollView>

      <View className='footer'>
        <Button
          className='save-btn'
          onClick={handleSave}
          loading={loading}
        >
          保存
        </Button>
      </View>
    </View>
  )
}

import { View, Text, Input, Button, Image } from '@tarojs/components'
import React, { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { login } from '@/services/user'
import './phone.scss'

export default function PhoneLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    // 表单验证
    if (!phone) {
      showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    if (!password) {
      showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    try {
      setLoading(true)

      // 调用后端登录接口
      const res = await Taro.request({
        url: 'http://localhost:3000/api/auth/login',
        method: 'POST',
        data: { phone, password }
      })

      if (res.data.code === 200) {
        const { token, user } = res.data.data

        // 保存token和用户信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('userInfo', user)

        showToast({ title: '登录成功', icon: 'success' })

        // 跳转到首页
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' })
        }, 1500)
      } else {
        showToast({ title: res.data.message || '登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('登录失败:', error)
      showToast({ title: '网络错误,请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='phone-login-page'>
      {/* 背景装饰 */}
      <View className='bg-decoration' />

      {/* Logo和标题 */}
      <View className='header'>
        <Button className='back-btn' onClick={handleBack}>
          <Text className='back-icon'>‹</Text>
        </Button>
        <View className='header-content'>
          <Text className='logo-text'>赴缘</Text>
          <Text className='header-title'>欢迎回来</Text>
        </View>
      </View>

      {/* 装饰元素 */}
      <View className='decoration'>
        <View className='deco-circle deco-1'></View>
        <View className='deco-circle deco-2'></View>
        <View className='deco-circle deco-3'></View>
      </View>

      {/* 登录表单 */}
      <View className='form-section'>
        <View className='form-card'>
          {/* 手机号输入 */}
          <View className='input-group'>
            <View className='input-icon'>
              <Text className='icon'>📱</Text>
            </View>
            <Input
              className='form-input'
              placeholder='请输入手机号'
              type='number'
              maxlength={11}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
          </View>

          {/* 密码输入 */}
          <View className='input-group'>
            <View className='input-icon'>
              <Text className='icon'>🔒</Text>
            </View>
            <Input
              className='form-input'
              placeholder='请输入密码'
              type='password'
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>

          {/* 忘记密码 */}
          <View className='forgot-password'>
            <Text className='forgot-link'>忘记密码?</Text>
          </View>
        </View>

        {/* 登录按钮 */}
        <Button
          className='login-btn'
          onClick={handleLogin}
          loading={loading}
        >
          登录
        </Button>
      </View>

      {/* 注册引导 */}
      <View className='register-guide'>
        <Text className='guide-title'>还没有账号?</Text>
        <View className='register-actions'>
          <Button
            className='register-btn'
            onClick={handleRegister}
          >
            立即注册
          </Button>
        </View>
      </View>

      {/* 底部装饰 */}
      <View className='bottom-decoration'>
        <View className='deco-line'></View>
        <View className='deco-circle deco-4'></View>
        <View className='deco-circle deco-5'></View>
      </View>
    </View>
  )
}

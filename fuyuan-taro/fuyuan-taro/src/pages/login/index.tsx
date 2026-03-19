import { View, Text, Input, Button } from '@tarojs/components'
import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { login, wechatLogin } from '@/services/user'
import './index.scss'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 手机号登录
  const handleLogin = async () => {
    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!password) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const res = await login({ phone, password })

      if (res.data?.token) {
        // 保存token和用户信息
        Taro.setStorageSync('token', res.data.token)
        if (res.data.user) {
          Taro.setStorageSync('userInfo', res.data.user)
        }

        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 延迟跳转
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' })
        }, 1500)
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 微信登录
  const handleWechatLogin = async () => {
    try {
      const loginRes = await Taro.login()

      const res = await wechatLogin({ code: loginRes.code })

      if (res.data?.token) {
        Taro.setStorageSync('token', res.data.token)
        if (res.data.user) {
          Taro.setStorageSync('userInfo', res.data.user)
        }

        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' })
        }, 1500)
      }
    } catch (error) {
      console.error('微信登录失败:', error)
    }
  }

  // 跳转注册
  const handleRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/index'
    })
  }

  return (
    <View className="login-page">
      <View className="header">
        <Text className="logo">💝</Text>
        <Text className="title">赴缘婚恋</Text>
        <Text className="subtitle">遇见真爱,从这里开始</Text>
      </View>

      <View className="form">
        <View className="input-group">
          <Text className="label">手机号</Text>
          <Input
            className="input"
            type="number"
            placeholder="请输入手机号"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxLength={11}
          />
        </View>

        <View className="input-group">
          <Text className="label">密码</Text>
          <Input
            className="input"
            type="password"
            placeholder="请输入密码"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
            maxLength={20}
          />
        </View>

        <Button
          className="login-btn"
          onClick={handleLogin}
          loading={loading}
        >
          {loading ? '登录中...' : '登录'}
        </Button>

        <View className="wechat-login">
          <Text className="divider">或</Text>
          <View className="wechat-btn" onClick={handleWechatLogin}>
            <Text className="wechat-icon">💚</Text>
            <Text className="wechat-text">微信一键登录</Text>
          </View>
        </View>
      </View>

      <View className="footer">
        <Text className="register-text">
          还没有账号?
          <Text className="register-link" onClick={handleRegister}>
            立即注册
          </Text>
        </Text>
      </View>
    </View>
  )
}

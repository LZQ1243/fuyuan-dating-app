import { View, Text, Input, Button } from '@tarojs/components'
import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { register, sendCode } from '@/services/user'
import './index.scss'

export default function Register() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    setSendingCode(true)
    try {
      await sendCode({ phone, type: 'register' })

      Taro.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败:', error)
    } finally {
      setSendingCode(false)
    }
  }

  // 注册
  const handleRegister = async () => {
    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!code) {
      Taro.showToast({
        title: '请输入验证码',
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

    if (password.length < 6) {
      Taro.showToast({
        title: '密码至少6位',
        icon: 'none'
      })
      return
    }

    if (password !== confirmPassword) {
      Taro.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const res = await register({
        phone,
        password,
        code
      })

      if (res.data?.token) {
        Taro.setStorageSync('token', res.data.token)
        if (res.data.user) {
          Taro.setStorageSync('userInfo', res.data.user)
        }

        Taro.showToast({
          title: '注册成功',
          icon: 'success'
        })

        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/login/index' })
        }, 1500)
      }
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="register-page">
      <View className="header">
        <Text className="title">注册账号</Text>
        <Text className="subtitle">开启你的婚恋之旅</Text>
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
          <Text className="label">验证码</Text>
          <View className="code-wrapper">
            <Input
              className="input code-input"
              type="number"
              placeholder="请输入验证码"
              value={code}
              onInput={(e) => setCode(e.detail.value)}
              maxLength={6}
            />
            <Button
              className="code-btn"
              onClick={handleSendCode}
              disabled={countdown > 0 || sendingCode}
            >
              {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
            </Button>
          </View>
        </View>

        <View className="input-group">
          <Text className="label">密码</Text>
          <Input
            className="input"
            type="password"
            placeholder="请输入密码(至少6位)"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
            maxLength={20}
          />
        </View>

        <View className="input-group">
          <Text className="label">确认密码</Text>
          <Input
            className="input"
            type="password"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onInput={(e) => setConfirmPassword(e.detail.value)}
            maxLength={20}
          />
        </View>

        <Button
          className="register-btn"
          onClick={handleRegister}
          loading={loading}
        >
          {loading ? '注册中...' : '注册'}
        </Button>
      </View>

      <View className="footer">
        <Text className="login-text">
          已有账号?
          <Text
            className="login-link"
            onClick={() => Taro.navigateBack()}
          >
            立即登录
          </Text>
        </Text>
      </View>
    </View>
  )
}

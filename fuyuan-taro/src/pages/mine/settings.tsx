import { View, Text, Switch, Button } from '@tarojs/components'
import React, { useState } from 'react'
import Taro, { showToast, showModal, clearStorage } from '@tarojs/taro'
import './settings.scss'

export default function Settings() {
  const [settings, setSettings] = useState({
    searchByPhone: true,
    showLocation: true,
    allowStrangerMessage: true,
    messageNotify: true,
    matchNotify: true,
    likeNotify: true
  })
  const [loading, setLoading] = useState(false)

  const handleSwitch = (key, value) => {
    setSettings({ ...settings, [key]: value })
    // TODO: 保存到服务器
  }

  const handleClearCache = () => {
    showModal({
      title: '提示',
      content: '确定要清除缓存吗?',
      success: (res) => {
        if (res.confirm) {
          try {
            clearStorage()
            showToast({ title: '缓存已清除', icon: 'success' })
          } catch (error) {
            console.error('清除缓存失败:', error)
          }
        }
      }
    })
  }

  const handleAbout = () => {
    showModal({
      title: '关于我们',
      content: '赴缘 - 专业的残疾人婚恋社交平台\n\n版本: 1.0.0',
      showCancel: false
    })
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      // 检查是否有新版本
      const response = await Taro.request({
        url: 'http://localhost:3000/api/app/version',
        method: 'GET'
      })
      if (response.data.code === 200 && response.data.data.version > '1.0.0') {
        Taro.showModal({
          title: '发现新版本',
          content: '是否立即更新?',
          success: (res) => {
            if (res.confirm) {
              // 跳转到更新页面或下载新版本
              showToast({ title: '正在更新...', icon: 'loading' })
            }
          }
        })
      } else {
        showToast({ title: '已是最新版本', icon: 'success' })
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      showToast({ title: '已是最新版本', icon: 'success' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          clearStorage()
          Taro.reLaunch({ url: '/pages/login/index' })
        }
      }
    })
  }

  const getVerificationStatus = () => {
    // TODO: 从用户信息获取认证状态
    return '未认证'
  }

  return (
    <View className='settings-page'>
      <View className='header'>
        <Text className='title'>设置</Text>
      </View>

      <View className='settings-list'>
        {/* 隐私设置 */}
        <View className='settings-section'>
          <Text className='section-title'>隐私设置</Text>

          <View className='setting-item'>
            <Text className='item-label'>手机号搜索</Text>
            <Switch
              checked={settings.searchByPhone}
              onChange={(e) => handleSwitch('searchByPhone', e.detail.value)}
              color='#FF6B6B'
            />
          </View>

          <View className='setting-item'>
            <Text className='item-label'>展示位置</Text>
            <Switch
              checked={settings.showLocation}
              onChange={(e) => handleSwitch('showLocation', e.detail.value)}
              color='#FF6B6B'
            />
          </View>

          <View className='setting-item'>
            <Text className='item-label'>接受陌生人消息</Text>
            <Switch
              checked={settings.allowStrangerMessage}
              onChange={(e) => handleSwitch('allowStrangerMessage', e.detail.value)}
              color='#FF6B6B'
            />
          </View>
        </View>

        {/* 通知设置 */}
        <View className='settings-section'>
          <Text className='section-title'>通知设置</Text>

          <View className='setting-item'>
            <Text className='item-label'>新消息通知</Text>
            <Switch
              checked={settings.messageNotify}
              onChange={(e) => handleSwitch('messageNotify', e.detail.value)}
              color='#FF6B6B'
            />
          </View>

          <View className='setting-item'>
            <Text className='item-label'>匹配提醒</Text>
            <Switch
              checked={settings.matchNotify}
              onChange={(e) => handleSwitch('matchNotify', e.detail.value)}
              color='#FF6B6B'
            />
          </View>

          <View className='setting-item'>
            <Text className='item-label'>点赞评论通知</Text>
            <Switch
              checked={settings.likeNotify}
              onChange={(e) => handleSwitch('likeNotify', e.detail.value)}
              color='#FF6B6B'
            />
          </View>
        </View>

        {/* 账号安全 */}
        <View className='settings-section'>
          <Text className='section-title'>账号安全</Text>

          <View className='setting-item' onClick={() => Taro.navigateTo({ url: '/pages/mine/edit-profile' })}>
            <Text className='item-label'>修改密码</Text>
            <Text className='item-arrow'>›</Text>
          </View>

          <View className='setting-item' onClick={() => Taro.navigateTo({ url: '/pages/mine/verification' })}>
            <Text className='item-label'>实名认证</Text>
            <View className='info-row'>
              <Text className='item-value'>{getVerificationStatus()}</Text>
              <Text className='item-arrow'>›</Text>
            </View>
          </View>
        </View>

        {/* 通用设置 */}
        <View className='settings-section'>
          <Text className='section-title'>通用设置</Text>

          <View className='setting-item' onClick={handleClearCache}>
            <Text className='item-label'>清除缓存</Text>
            <Text className='item-desc'>释放存储空间</Text>
            <Text className='item-arrow'>›</Text>
          </View>

          <View className='setting-item' onClick={handleUpdate}>
            <Text className='item-label'>检查更新</Text>
            <Text className='item-desc'>当前版本 1.0.0</Text>
            <Text className='item-arrow'>›</Text>
          </View>

          <View className='setting-item' onClick={handleAbout}>
            <Text className='item-label'>关于我们</Text>
            <Text className='item-arrow'>›</Text>
          </View>
        </View>

        {/* 退出登录 */}
        <View className='logout-section'>
          <Button
            className='logout-btn'
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </View>
      </View>
    </View>
  )
}

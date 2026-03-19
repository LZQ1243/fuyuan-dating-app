import { View, Text } from '@tarojs/components'
import React, { FC } from 'react'
import './Loading.scss'

interface LoadingProps {
  text?: string
  show?: boolean
}

const Loading: FC<LoadingProps> = ({ text = '加载中...', show = true }) => {
  if (!show) return null

  return (
    <View className="loading">
      <View className="loading-spinner">
        <View className="spinner" />
      </View>
      <Text className="loading-text">{text}</Text>
    </View>
  )
}

export default Loading

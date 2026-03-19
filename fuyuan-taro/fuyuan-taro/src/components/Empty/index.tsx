import { View, Text } from '@tarojs/components'
import React, { FC } from 'react'
import './Empty.scss'

interface EmptyProps {
  text?: string
  hint?: string
  show?: boolean
}

const Empty: FC<EmptyProps> = ({ text = '暂无数据', hint, show = true }) => {
  if (!show) return null

  return (
    <View className="empty">
      <View className="empty-icon">📭</View>
      <Text className="empty-text">{text}</Text>
      {hint && <Text className="empty-hint">{hint}</Text>}
    </View>
  )
}

export default Empty

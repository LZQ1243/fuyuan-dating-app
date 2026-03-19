import { View, Text } from '@tarojs/components'
import React from 'react'
import './index.scss'

interface SkeletonProps {
  loading?: boolean
  children?: React.ReactNode
  rows?: number
  avatar?: boolean
  title?: boolean
}

export default function Skeleton({ 
  loading = true, 
  children,
  rows = 3,
  avatar = true,
  title = true
}: SkeletonProps) {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <View className="skeleton">
      {avatar && <View className="skeleton-avatar" />}
      <View className="skeleton-content">
        {title && <View className="skeleton-title" />}
        {Array.from({ length: rows }).map((_, index) => (
          <View key={index} className="skeleton-paragraph" />
        ))}
      </View>
    </View>
  )
}

// 骨架屏卡片
export const SkeletonCard = ({ loading, children }: { loading?: boolean; children?: React.ReactNode }) => {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <View className="skeleton-card">
      <View className="skeleton-card-image" />
      <View className="skeleton-card-content">
        <View className="skeleton-title" />
        <View className="skeleton-paragraph" />
        <View className="skeleton-paragraph" style={{ width: '60%' }} />
      </View>
    </View>
  )
}

// 骨架屏列表项
export const SkeletonListItem = ({ loading, children }: { loading?: boolean; children?: React.ReactNode }) => {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <View className="skeleton-list-item">
      <View className="skeleton-avatar" />
      <View className="skeleton-content">
        <View className="skeleton-title" />
        <View className="skeleton-paragraph" />
      </View>
    </View>
  )
}

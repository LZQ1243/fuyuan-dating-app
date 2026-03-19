import { View, Text } from '@tarojs/components'
import React from 'react'
import './index.scss'

// 加载动画
export const LoadingSpinner = ({ size = 40 }: { size?: number }) => (
  <View className="loading-spinner" style={{ width: size, height: size }}>
    <View className="spinner-inner"></View>
  </View>
)

// 心跳动画
export const HeartBeat = ({ children }: { children: React.ReactNode }) => (
  <View className="heart-beat">
    {children}
  </View>
)

// 脉冲动画
export const Pulse = ({ children }: { children: React.ReactNode }) => (
  <View className="pulse">
    {children}
  </View>
)

// 淡入动画
export const FadeIn = ({ children, duration = 300 }: { children: React.ReactNode; duration?: number }) => (
  <View 
    className="fade-in" 
    style={{ animationDuration: `${duration}ms` }}
  >
    {children}
  </View>
)

// 滑入动画
export const SlideIn = ({ 
  children, 
  direction = 'bottom',
  distance = '100%' 
}: { 
  children: React.ReactNode
  direction?: 'top' | 'bottom' | 'left' | 'right'
  distance?: string
}) => (
  <View 
    className={`slide-in slide-in-${direction}`}
    style={{ '--slide-distance': distance }}
  >
    {children}
  </View>
)

// 缩放动画
export const ScaleIn = ({ children }: { children: React.ReactNode }) => (
  <View className="scale-in">
    {children}
  </View>
)

// 旋转动画
export const Rotate = ({ 
  children, 
  duration = 1000 
}: { 
  children: React.ReactNode
  duration?: number
}) => (
  <View 
    className="rotate"
    style={{ animationDuration: `${duration}ms` }}
  >
    {children}
  </View>
)

// 弹跳动画
export const Bounce = ({ children }: { children: React.ReactNode }) => (
  <View className="bounce">
    {children}
  </View>
)

// 摇晃动画
export const Shake = ({ children }: { children: React.ReactNode }) => (
  <View className="shake">
    {children}
  </View>
)

// 波浪动画
export const Wave = ({ count = 3 }: { count?: number }) => (
  <View className="wave">
    {Array.from({ length: count }).map((_, index) => (
      <View 
        key={index} 
        className="wave-bar"
        style={{ animationDelay: `${index * 0.1}s` }}
      />
    ))}
  </View>
)

// 成功动画
export const SuccessCheckmark = () => (
  <View className="success-checkmark">
    <View className="checkmark-circle"></View>
    <View className="checkmark-check"></View>
  </View>
)

// 错误动画
export const ErrorCross = () => (
  <View className="error-cross">
    <View className="error-circle"></View>
    <View className="error-x"></View>
  </View>
)

// 点赞动画
export const LikeAnimation = ({ children }: { children: React.ReactNode }) => (
  <View className="like-animation">
    {children}
  </View>
)

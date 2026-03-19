import { useEffect, useRef, useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface LottieAnimationProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  width?: number
  height?: number
  speed?: number
  onLoad?: () => void
  onError?: () => void
}

export default function LottieAnimation({
  src,
  autoPlay = true,
  loop = true,
  width = 300,
  height = 300,
  speed = 1,
  onLoad,
  onError
}: LottieAnimationProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const animationRef = useRef<any>(null)

  useEffect(() => {
    // 微信小程序使用web动画
    try {
      const query = Taro.createSelectorQuery()
      query.select('#lottie-canvas').fields({ node: true, size: true }).exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 设置canvas尺寸
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // 加载lottie-web (需要在项目中引入)
        // 这里使用简化的占位实现
        setLoaded(true)
        onLoad?.()
      })
    } catch (err) {
      console.error('加载Lottie失败:', err)
      setError(true)
      onError?.()
    }
  }, [src, width, height, onLoad, onError])

  if (error) {
    return (
      <View className="lottie-error">
        <View className="error-placeholder" style={{ width, height }}>
          <Text className="error-text">动画加载失败</Text>
        </View>
      </View>
    )
  }

  if (!loaded) {
    return (
      <View className="lottie-loading">
        <View className="loading-placeholder" style={{ width, height }}>
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View 
      className="lottie-animation"
      style={{ width, height }}
    >
      <canvas 
        id="lottie-canvas"
        type="2d"
        style={{ width, height }}
      />
    </View>
  )
}

// 预定义动画
export const LoadingAnimation = () => (
  <LottieAnimation 
    src="/animations/loading.json"
    width={100}
    height={100}
  />
)

export const SuccessAnimation = () => (
  <LottieAnimation 
    src="/animations/success.json"
    width={200}
    height={200}
    loop={false}
  />
)

export const HeartAnimation = () => (
  <LottieAnimation 
    src="/animations/heart.json"
    width={100}
    height={100}
    loop={false}
  />
)

export const EmptyAnimation = () => (
  <LottieAnimation 
    src="/animations/empty.json"
    width={300}
    height={300}
    loop={false}
  />
)

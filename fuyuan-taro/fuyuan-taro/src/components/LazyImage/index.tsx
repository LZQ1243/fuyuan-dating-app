import { useState, useEffect, useRef } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface LazyImageProps {
  src: string
  placeholder?: string
  className?: string
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'heightFix' | 'scaleToFill'
  onClick?: () => void
}

export default function LazyImage({ 
  src, 
  placeholder = '', 
  className = '',
  mode = 'aspectFill',
  onClick 
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const imageRef = useRef<any>(null)

  useEffect(() => {
    // 使用Intersection Observer检测图片是否进入视口
    const observer = Taro.createIntersectionObserver()
    
    observer.observe('.lazy-image', (res) => {
      if (res[0].intersectionRatio > 0) {
        setInView(true)
        observer.disconnect()
      }
    })
    
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLoad = () => {
    setLoaded(true)
    setError(false)
  }

  const handleError = () => {
    setError(true)
    setLoaded(false)
  }

  return (
    <View 
      className={`lazy-image-wrapper ${className}`}
      onClick={onClick}
    >
      <Image
        ref={imageRef}
        src={inView && !error ? src : placeholder}
        mode={mode}
        onLoad={handleLoad}
        onError={handleError}
        className={`lazy-image ${loaded ? 'loaded' : 'loading'} ${error ? 'error' : ''}`}
        lazyLoad={true}
      />
      
      {!loaded && !error && (
        <View className="lazy-placeholder">
          <Text className="placeholder-icon">🖼️</Text>
          <Text className="placeholder-text">加载中...</Text>
        </View>
      )}
      
      {error && (
        <View className="lazy-error">
          <Text className="error-icon">❌</Text>
          <Text className="error-text">加载失败</Text>
        </View>
      )}
    </View>
  )
}

// 骨架屏图片
export const SkeletonImage = () => {
  return (
    <View className="skeleton-image">
      <View className="skeleton-placeholder" />
    </View>
  )
}

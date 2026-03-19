import { useState, useRef } from 'react'
import { View, Text, Image, Slider } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface VoiceMessage {
  id: string
  filePath: string
  duration: number
  fileSize: number
  fromSelf: boolean
}

interface VoicePlayerProps {
  message: VoiceMessage
}

export default function VoicePlayer({ message }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null)

  // 播放/暂停
  const togglePlay = () => {
    if (!innerAudioContextRef.current) {
      const audio = Taro.createInnerAudioContext()
      audio.src = message.filePath
      
      audio.onPlay(() => {
        setIsPlaying(true)
      })

      audio.onPause(() => {
        setIsPlaying(false)
      })

      audio.onEnded(() => {
        setIsPlaying(false)
        setCurrentTime(0)
      })

      audio.onTimeUpdate(() => {
        setCurrentTime(audio.currentTime)
      })

      audio.onError((err) => {
        console.error('播放失败', err)
        setIsPlaying(false)
        Taro.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })

      innerAudioContextRef.current = audio
    }

    const audio = innerAudioContextRef.current

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  // 跳转进度
  const handleSeek = (value: number) => {
    if (innerAudioContextRef.current) {
      innerAudioContextRef.current.seek(value)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className={`voice-player ${message.fromSelf ? 'from-self' : 'from-other'}`}>
      <View className="voice-content">
        <View 
          className="play-button"
          onClick={togglePlay}
        >
          <Text className="play-icon">
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </View>
        
        <View className="voice-info">
          <View className="duration-bar">
            <Text className="current-time">{formatTime(currentTime)}</Text>
            <Text className="total-time">{formatTime(message.duration)}</Text>
          </View>
          
          <Slider
            className="progress-bar"
            value={currentTime}
            min={0}
            max={message.duration}
            showValue={false}
            onChange={handleSeek}
            activeColor="#ff6b6b"
            backgroundColor="#e0e0e0"
            blockSize={12}
          />
        </View>
      </View>
    </View>
  )
}

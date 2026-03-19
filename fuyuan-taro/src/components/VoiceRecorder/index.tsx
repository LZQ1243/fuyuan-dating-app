import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface VoiceRecorderProps {
  onSend: (audioData: {
    filePath: string
    duration: number
    fileSize: number
  }) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onSend, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioPath, setAudioPath] = useState('')
  const [recorderManager, setRecorderManager] = useState<any>(null)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  // 初始化录音管理器
  useEffect(() => {
    const recorder = Taro.getRecorderManager()
    
    recorder.onStart(() => {
      console.log('录音开始')
      setIsRecording(true)
      setDuration(0)
      
      // 开始计时
      const interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
      setTimer(interval)
    })

    recorder.onStop((res) => {
      console.log('录音结束', res)
      setIsRecording(false)
      
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
      
      setAudioPath(res.tempFilePath)
    })

    recorder.onError((err) => {
      console.error('录音错误', err)
      setIsRecording(false)
      
      if (timer) {
        clearInterval(timer)
        setTimer(null)
      }
      
      Taro.showToast({
        title: '录音失败',
        icon: 'none'
      })
    })

    setRecorderManager(recorder)

    return () => {
      if (timer) {
        clearInterval(timer)
      }
      recorder.stop()
    }
  }, [])

  // 开始录音
  const startRecord = () => {
    if (!recorderManager || disabled) return

    // 检查权限
    Taro.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          Taro.authorize({
            scope: 'scope.record',
            success: () => {
              startRecording()
            },
            fail: () => {
              Taro.showModal({
                title: '提示',
                content: '需要录音权限才能发送语音消息',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    Taro.openSetting()
                  }
                }
              })
            }
          })
        } else {
          startRecording()
        }
      }
    })
  }

  const startRecording = () => {
    recorderManager.start({
      duration: 60000,
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
    })
  }

  // 停止录音
  const stopRecord = () => {
    if (!recorderManager || !isRecording) return
    recorderManager.stop()
  }

  // 取消录音
  const cancelRecord = () => {
    if (!recorderManager) return
    recorderManager.stop()
    setAudioPath('')
    setDuration(0)
  }

  // 发送语音
  const handleSend = async () => {
    if (!audioPath) return

    try {
      const fileInfo = await Taro.getFileInfo({
        filePath: audioPath
      })

      onSend({
        filePath: audioPath,
        duration,
        fileSize: fileInfo.size
      })

      setAudioPath('')
      setDuration(0)
    } catch (error) {
      console.error('获取文件信息失败', error)
      Taro.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className="voice-recorder">
      {isRecording && (
        <View className="recording-state">
          <View className="recording-animation">
            <View className="wave wave1"></View>
            <View className="wave wave2"></View>
            <View className="wave wave3"></View>
          </View>
          <Text className="duration">{formatDuration(duration)}</Text>
          <Text className="tip">松开结束录音</Text>
        </View>
      )}

      {audioPath && !isRecording && (
        <View className="recorded-state">
          <Text className="duration">{formatDuration(duration)}</Text>
          <View className="actions">
            <Button size="mini" onClick={() => setAudioPath('')}>重录</Button>
            <Button type="primary" size="mini" onClick={handleSend}>发送</Button>
          </View>
        </View>
      )}

      {!isRecording && !audioPath && (
        <Button
          className="btn-record"
          onClick={startRecord}
          disabled={disabled}
        >
          按住录音
        </Button>
      )}
    </View>
  )
}

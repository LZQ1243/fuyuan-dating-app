import { useEffect, useRef } from 'react'
import { websocket, ConnectionState } from '@/services/websocket'

/**
 * WebSocket Hook
 * 用于在React组件中使用WebSocket
 */
export const useWebSocket = () => {
  const isConnectedRef = useRef(false)

  useEffect(() => {
    // 连接WebSocket
    websocket.connect()
    isConnectedRef.current = true

    // 组件卸载时断开连接
    return () => {
      if (isConnectedRef.current) {
        websocket.disconnect()
        isConnectedRef.current = false
      }
    }
  }, [])

  /**
   * 监听事件
   */
  const on = (event: string, handler: Function) => {
    websocket.on(event, handler)
  }

  /**
   * 移除事件监听
   */
  const off = (event: string, handler?: Function) => {
    websocket.off(event, handler)
  }

  /**
   * 发送消息
   */
  const emit = (event: string, data: any) => {
    websocket.emit(event, data)
  }

  /**
   * 获取连接状态
   */
  const getState = (): ConnectionState => {
    return websocket.getState()
  }

  /**
   * 是否已连接
   */
  const isConnected = (): boolean => {
    return websocket.isConnected()
  }

  return {
    on,
    off,
    emit,
    getState,
    isConnected,
  }
}

/**
 * 监听特定消息的Hook
 */
export const useMessage = (event: string, handler: Function) => {
  const { on, off } = useWebSocket()

  useEffect(() => {
    on(event, handler)
    return () => {
      off(event, handler)
    }
  }, [event, handler, on, off])
}

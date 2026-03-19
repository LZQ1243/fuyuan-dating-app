import { io, Socket } from 'socket.io-client'
import Taro from '@tarojs/taro'
import { getToken } from '@/store/user'

// WebSocket连接状态
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// 消息类型
interface SocketMessage {
  type: string
  data: any
  timestamp: number
}

// WebSocket服务类
class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private state: ConnectionState = 'disconnected'
  private messageHandlers: Map<string, Function[]> = new Map()

  /**
   * 连接WebSocket
   */
  connect(): void {
    try {
      const token = getToken()
      if (!token) {
        console.warn('WebSocket: 未找到token,跳过连接')
        return
      }

      this.state = 'connecting'

      // 从配置获取WebSocket地址
      const wsUrl = APP_CONFIG.wsURL

      console.log('WebSocket: 正在连接...', wsUrl)

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        query: { token },
        timeout: 10000,
        forceNew: true
      })

      this.setupEventHandlers()
    } catch (error) {
      console.error('WebSocket: 连接失败', error)
      this.state = 'error'
      this.handleReconnect()
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket: 连接成功')
      this.state = 'connected'
      this.reconnectAttempts = 0
      Taro.showToast({ title: '连接成功', icon: 'success', duration: 1000 })
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket: 连接错误', error)
      this.state = 'error'
    })

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket: 断开连接', reason)
      this.state = 'disconnected'
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开,需要重新连接
        this.handleReconnect()
      }
    })

    // 接收新消息
    this.socket.on('new_message', (data: any) => {
      console.log('WebSocket: 收到新消息', data)
      this.triggerHandler('new_message', data)
    })

    // 消息已读
    this.socket.on('message_read', (data: any) => {
      console.log('WebSocket: 消息已读', data)
      this.triggerHandler('message_read', data)
    })

    // 新匹配
    this.socket.on('new_match', (data: any) => {
      console.log('WebSocket: 新匹配', data)
      this.triggerHandler('new_match', data)
    })

    // 点赞通知
    this.socket.on('like_notification', (data: any) => {
      console.log('WebSocket: 点赞通知', data)
      this.triggerHandler('like_notification', data)
    })

    // 评论通知
    this.socket.on('comment_notification', (data: any) => {
      console.log('WebSocket: 评论通知', data)
      this.triggerHandler('comment_notification', data)
    })
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: 达到最大重连次数')
      Taro.showToast({
        title: '连接失败',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.reconnectAttempts++
    console.log(`WebSocket: 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
  }

  /**
   * 触发事件处理器
   */
  private triggerHandler(event: string, data: any): void {
    const handlers = this.messageHandlers.get(event) || []
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error(`WebSocket: 事件处理器错误 (${event})`, error)
      }
    })
  }

  /**
   * 注册事件处理器
   */
  on(event: string, handler: Function): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event)!.push(handler)
  }

  /**
   * 移除事件处理器
   */
  off(event: string, handler?: Function): void {
    if (!handler) {
      this.messageHandlers.delete(event)
      return
    }

    const handlers = this.messageHandlers.get(event) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  /**
   * 发送消息
   */
  emit(event: string, data: any): void {
    if (!this.socket || this.state !== 'connected') {
      console.warn('WebSocket: 未连接,无法发送消息')
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.state = 'disconnected'
    this.reconnectAttempts = 0
    this.messageHandlers.clear()
  }

  /**
   * 获取连接状态
   */
  getState(): ConnectionState {
    return this.state
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.state === 'connected'
  }
}

// 导出单例
export const websocket = new WebSocketService()

// 导出类型
export type { ConnectionState, SocketMessage }

import * as React from 'react'
const { Component } = React
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('错误边界捕获错误:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 上报错误
    this.reportError(error, errorInfo)
  }

  // 上报错误到服务器
  reportError = async (error: Error, errorInfo: any) => {
    try {
      // 获取用户信息
      const userInfo = Taro.getStorageSync('userInfo')
      
      // 构建错误信息
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        userInfo,
        timestamp: new Date().toISOString(),
        userAgent: Taro.getSystemInfoSync()
      }

      // 上报错误
      await Taro.request({
        url: `${process.env.API_BASE_URL}/api/error/report`,
        method: 'POST',
        data: errorData,
        header: {
          'Authorization': `Bearer ${Taro.getStorageSync('token')}`
        }
      })
    } catch (reportError) {
      console.error('上报错误失败:', reportError)
    }
  }

  // 重试
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  // 返回首页
  handleGoHome = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
    this.handleRetry()
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <View className="error-boundary">
          <View className="error-content">
            <Text className="error-icon">😵</Text>
            <Text className="error-title">页面出错了</Text>
            <Text className="error-message">
              {this.state.error?.message || '未知错误'}
            </Text>
            
            <View className="error-actions">
              <Button 
                className="btn-retry"
                onClick={this.handleRetry}
              >
                重新加载
              </Button>
              <Button 
                className="btn-home"
                onClick={this.handleGoHome}
              >
                返回首页
              </Button>
            </View>
            
            {process.env.NODE_ENV === 'development' && (
              <View className="error-details">
                <Text className="error-details-title">错误详情:</Text>
                <Text className="error-stack">
                  {this.state.error?.stack}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text className="error-stack">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )
    }

    return this.props.children
  }
}

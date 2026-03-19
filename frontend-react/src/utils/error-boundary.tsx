/**
 * 错误边界组件
 * 优雅处理React错误
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private lastResetKey: string | number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // 调用错误回调
    this.props.onError?.(error, errorInfo);

    // 上报错误
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // 检查resetKeys是否变化
    if (hasError && prevProps.resetKeys !== resetKeys) {
      const currentResetKey = resetKeys?.join('-') || null;

      if (this.lastResetKey !== currentResetKey) {
        this.lastResetKey = currentResetKey;
        this.reset();
      }
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // 发送错误到服务器
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack
          },
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(console.error);
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  private reset() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 使用自定义fallback或默认UI
      if (fallback) {
        return fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#fff5f5',
          color: '#c53030'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            出错了
          </h1>
          <p style={{ fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>
            {error?.message || '应用遇到了一些问题,请稍后重试'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#c53030',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * 高阶组件包装器
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * 使用错误边界的Hook (函数组件)
 */
export function useErrorHandler(
  error: Error | null,
  errorInfo?: ErrorInfo
) {
  const [errorState, setErrorState] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      setErrorState(error);

      // 上报错误
      try {
        fetch('/api/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack
            },
            errorInfo,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      } catch (e) {
        console.error('Failed to report error:', e);
      }
    }
  }, [error, errorInfo]);

  return errorState;
}

/**
 * 异步错误边界
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AsyncErrorBoundary({
  children,
  fallback
}: AsyncErrorBoundaryProps) {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    return fallback || (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>操作失败: {error.message}</p>
        <button onClick={() => setError(null)}>重试</button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;

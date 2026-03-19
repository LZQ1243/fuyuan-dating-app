/// <reference types="@tarojs/taro" />

// 添加 React 类型声明兼容
import React from 'react'

declare global {
  namespace React {
    type FC<P = {}> = (props: P) => React.ReactElement | null
    type ComponentType<P = {}> = (props: P) => React.ReactElement | null
    type ReactNode = React.ReactElement | string | number | boolean | null | undefined
  }
}

// Taro 全局类型声明
declare namespace Taro {
  interface App {
    config: App.Config
  }

  namespace Event {
    type Touch = any
    type TouchEvent<T = any> = any
  }

  class Component<P = {}, S = {}> {
    props: P
    state: S
    setState<K extends keyof S>(state: Pick<S, K> | S | null, callback?: () => void): void
    forceUpdate(callback?: () => void): void
  }
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

export {}

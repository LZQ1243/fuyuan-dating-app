// 全局类型补充声明
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test'
    API_BASE_URL?: string
  }
}

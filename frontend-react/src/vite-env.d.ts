/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  // 添加更多环境变量类型声明
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

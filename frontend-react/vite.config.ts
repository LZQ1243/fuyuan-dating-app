import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import legacy from '@vitejs/plugin-legacy'

const __dirname = path.resolve()

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-import',
          {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: 'css'
          },
          {
            libraryName: '@ant-design/icons',
            libraryDirectory: 'es/icons',
            camel2DashComponentName: false
          }
        ]
      }
    }),
    // Gzip压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),
    // Brotli压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),
    // 兼容旧浏览器
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    // 打包分析
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React核心库
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // 状态管理
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'state-vendor';
            }
            // UI组件库
            if (id.includes('antd') || id.includes('@ant-design/icons') || id.includes('@ant-design/pro-components')) {
              return 'antd-vendor';
            }
            // 其他第三方库
            if (id.includes('axios') || id.includes('socket.io-client') || id.includes('dayjs') || id.includes('framer-motion')) {
              return 'utils-vendor';
            }
            // Material UI
            if (id.includes('@mui/material') || id.includes('@mui/icons-material') || id.includes('@emotion/react') || id.includes('@emotion/styled')) {
              return 'mui-vendor';
            }
            // 其他node_modules
            return 'vendor';
          }
        },
        // 文件名哈希
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 目标浏览器
    target: 'es2015',
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    // chunk大小警告阈值
    chunkSizeWarningLimit: 500,
    // 启用源码映射
    sourcemap: false
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'socket.io-client',
      'dayjs',
      'framer-motion'
    ],
    exclude: []
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
    // 启用gzip压缩
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // 预加载配置
  preview: {
    port: 3003
  }
})

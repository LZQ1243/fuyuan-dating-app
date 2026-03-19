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
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('react-router')) return 'react-vendor';
            if (id.includes('react-query') || id.includes('zustand')) return 'state-vendor';
            if (id.includes('antd')) return 'antd-vendor';
            if (id.includes('@ant-design/icons')) return 'antd-vendor';
            if (id.includes('axios') || id.includes('socket.io') || id.includes('dayjs') || id.includes('framer-motion')) return 'utils-vendor';
            if (id.includes('mui')) return 'mui-vendor';
            return 'vendor';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      '@ant-design/pro-components',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'socket.io-client',
      'dayjs',
      'framer-motion'
    ]
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3003
  }
})

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest配置文件
 * 用于前端单元测试
 */
export default defineConfig({
  plugins: [react()],

  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局变量
    globals: true,

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}'
    ],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],

    // 覆盖率配置
    coverage: {
      provider: 'v8',

      // 是否收集覆盖率
      enabled: true,

      // 收集覆盖率的文件
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts'
      ],

      // 排除的文件
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.d.ts',
        '**/types/**',
        '**/*.config.*'
      ],

      // 覆盖率报告格式
      reporter: [
        'text',
        'text-summary',
        'json',
        'json-summary',
        'html',
        'lcov'
      ],

      // 覆盖率目录
      reportsDirectory: '../test-reports/frontend-coverage',

      // 覆盖率阈值
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        perFile: {
          lines: 75,
          functions: 75,
          branches: 75,
          statements: 75
        }
      },

      // 排除100%覆盖的文件
      all: true,

      // 是否显示未覆盖的行
      skipFull: false
    },

    // 报告器
    reporters: [
      'verbose',
      'json',
      'junit'
    ],

    // 输出目录
    outputFile: {
      json: '../test-reports/frontend-test-results.json',
      junit: '../test-reports/frontend-junit.xml'
    },

    // 并发测试
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 测试超时时间
    testTimeout: 10000,
    hookTimeout: 10000,

    // 是否在运行测试前自动清除模拟
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,

    // 是否只运行变更的文件
    related: false,

    // 是否监听文件变化
    watch: false,

    // 是否覆盖全局
    isolate: true,

    // UI配置
    ui: false,
    open: false,

    // 输出配置
    onConsoleLog: 'stdout',

    // 别名配置
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },

  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@config': path.resolve(__dirname, './src/config')
    }
  }
});

/**
 * Jest配置文件
 * 用于后端单元测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // 覆盖率配置
  collectCoverage: false, // 默认关闭,运行测试时使用--coverage开启
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],

  // 覆盖率目录
  coverageDirectory: '../test-reports/backend-coverage',

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary'
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/controllers/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/models/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // 覆盖率输出配置
  coverageProvider: 'v8',

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1'
  },

  // 测试超时时间
  testTimeout: 10000,

  // 并行测试
  maxWorkers: 4,

  // 是否在运行测试前自动清除模拟
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 全局设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // 转换配置
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],

  // 是否显示详细输出
  verbose: true,

  // 测试结果输出
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '../test-reports',
        outputName: 'backend-junit.xml'
      }
    ]
  ],

  // 全局变量
  globals: {
    'TEST_ENV': true
  },

  // 缓存
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache'
};

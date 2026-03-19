/**
 * Commitlint配置
 * 规范Git提交信息格式
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // 类型枚举: 允许的提交类型
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能 (feature)
        'fix',       // 修复 (bug fix)
        'docs',      // 文档 (documentation)
        'style',     // 格式 (formatting, missing semi colons, etc)
        'refactor',  // 重构 (refactoring production code)
        'test',      // 测试 (adding tests)
        'chore',     // 构建 (updating build tasks, package manager configs)
        'perf',      // 性能优化
        'ci',        // CI配置
        'revert',    // 回滚
        'build'      // 构建系统或外部依赖
      ]
    ],

    // 类型大小写: 必须小写
    'type-case': [2, 'always', 'lower-case'],

    // 类型为空: 不允许
    'type-empty': [2, 'never'],

    // 类型最大长度: 无限制
    'type-max-length': [0, 'always'],

    // 类型最小长度: 至少2个字符
    'type-min-length': [2, 'always', 2],

    // 作用域枚举: 可选的作用域
    'scope-enum': [
      0,
      'always',
      [
        // 项目模块
        'backend',
        'frontend',
        'admin',
        'matchmaker',
        'taro',

        // 功能模块
        'auth',
        'user',
        'match',
        'chat',
        'moments',
        'posts',
        'video',
        'live',
        'config',
        'api',
        'database',
        'redis',

        // 其他
        'tests',
        'docs',
        'deploy',
        'ci'
      ]
    ],

    // 作用域大小写: 小写
    'scope-case': [2, 'always', 'lower-case'],

    // 作用域为空: 允许
    'scope-empty': [0, 'always'],

    // 主题最大长度: 100个字符
    'subject-max-length': [2, 'always', 100],

    // 主题最小长度: 至少3个字符
    'subject-min-length': [2, 'always', 3],

    // 主题大小写: 不限制
    'subject-case': [0, 'always'],

    // 主题结尾: 不允许句号
    'subject-full-stop': [2, 'never', '.'],

    // 主题必须以感叹号结尾: 不强制
    'subject-exclamation-mark': [0, 'always'],

    // 主题空: 不允许
    'subject-empty': [2, 'never'],

    // 主体最大行长度: 100个字符
    'body-max-line-length': [2, 'always', 100],

    // 主体最大长度: 5000个字符
    'body-max-length': [0, 'always', 5000],

    // 脚注最大行长度: 100个字符
    'footer-max-line-length': [2, 'always', 100],

    // 脚注最大长度: 5000个字符
    'footer-max-length': [0, 'always', 5000],

    // 引用Issue: 必须使用closes或fixes
    'references-empty': [0, 'always'],

    // Header最大长度: 100个字符
    'header-max-length': [2, 'always', 100]
  },

  // 自定义解析器
  parserPreset: {
    parserOpts: {
      // 破坏性变更标记
      breakCommits: '^BREAKING CHANGE'
    }
  },

  // 自定义格式化
  formatter: '@commitlint/format',

  // 插件
  plugins: [
    // 添加自定义规则插件
    // '@commitlint/plugin-lerna-scopes'
  ],

  // 提示信息
  helpUrl: 'https://www.conventionalcommits.org/zh-hans/v1.0.0-beta.4/'
};

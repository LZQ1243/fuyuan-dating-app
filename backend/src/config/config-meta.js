/**
 * 配置元数据定义
 * 提供所有配置项的中文提示、步骤说明和验证规则
 */

/**
 * 配置元数据
 * 每个配置项都包含详细的中文说明、步骤提示和示例
 */
const configMeta = {
  // ====================================
  // 环境配置
  // ====================================
  environment: {
    title: '环境配置',
    description: '配置应用运行环境的基本参数，包括运行模式、端口和监听地址',
    icon: '🌍',
    items: {
      NODE_ENV: {
        label: '运行环境',
        description: '选择应用的运行环境，不同环境会有不同的配置和安全策略',
        type: 'select',
        required: true,
        defaultValue: 'development',
        options: [
          { value: 'development', label: '开发环境' },
          { value: 'production', label: '生产环境' },
          { value: 'test', label: '测试环境' }
        ],
        // 详细提示
        hint: '开发环境：启用详细日志、错误堆栈和调试工具，适合本地开发\n生产环境：启用缓存、压缩和性能优化，关闭调试信息，适合正式上线\n测试环境：介于开发和生产之间，用于自动化测试和QA',
        // 配置步骤
        steps: [
          '确定当前应用的使用场景',
          '选择对应的环境类型',
          '保存后需要重启应用才能生效',
          '生产环境建议先在测试环境验证'
        ],
        // 示例
        example: 'production',
        // 验证规则
        validation: /^(development|production|test)$/,
        // 注意事项
        notes: '生产环境会自动关闭错误堆栈输出，提升安全性'
      },

      PORT: {
        label: '服务端口号',
        description: '指定后端服务监听的TCP端口号，确保该端口未被其他程序占用',
        type: 'number',
        required: true,
        defaultValue: 3000,
        // 详细提示
        hint: '端口号范围：1-65535\n常用端口：3000（Node.js应用）、8080（Web服务）、5000（备用端口）\n确保端口未被占用，否则会导致启动失败',
        // 配置步骤
        steps: [
          '使用 netstat -an | grep 端口号 检查端口是否被占用',
          '检查服务器防火墙是否开放该端口',
          '如果端口被占用，选择其他可用端口',
          '保存配置后需要重启服务'
        ],
        // 示例
        example: '3000',
        // 验证规则
        validation: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
        // 注意事项
        notes: '避免使用0-1024的特权端口，除非有root权限\n外网访问需要配置云服务器的安全组规则'
      },

      HOST: {
        label: '监听地址',
        description: '指定服务监听的IP地址，决定服务的可访问范围',
        type: 'text',
        required: true,
        defaultValue: '0.0.0.0',
        // 详细提示
        hint: '0.0.0.0：监听所有网络接口，外网和内网都可以访问\n127.0.0.1：仅监听本地回环地址，仅本机访问\n具体IP：只监听指定IP的网络接口',
        // 配置步骤
        steps: [
          '确定服务的访问范围（是否需要外网访问）',
          '选择对应的监听地址',
          '0.0.0.0 适用于生产环境',
          '127.0.0.1 适用于仅本地访问的场景'
        ],
        // 示例
        example: '0.0.0.0',
        // 验证规则
        validation: /^(0|255)\.(0|255)\.(0|255)\.(0|255)$/,
        // 注意事项
        notes: '生产环境推荐使用 0.0.0.0 以便外网访问\n仅本地访问的服务可以使用 127.0.0.1 提升安全性'
      }
    }
  },

  // ====================================
  // 数据库配置
  // ====================================
  database: {
    title: '数据库配置',
    description: '配置数据库连接信息，支持MongoDB、MySQL、PostgreSQL等多种数据库类型',
    icon: '🗄️',
    items: {
      DATABASE_URI: {
        label: '数据库连接字符串',
        description: '填写数据库的完整连接URI，系统会自动识别数据库类型并建立连接',
        type: 'text',
        required: true,
        // 详细提示
        hint: '支持多种数据库类型，系统会自动识别：\n• MongoDB：mongodb://user:pass@host:port/db\n• MySQL：mysql://user:pass@host:port/db\n• PostgreSQL：postgresql://user:pass@host:port/db\n• SQLite：sqlite:path/to/db.sqlite',
        // 配置步骤
        steps: [
          '步骤1：确定使用的数据库类型（MongoDB/MySQL/PostgreSQL/SQLite等）',
          '步骤2：准备数据库连接信息（地址、端口、数据库名）',
          '步骤3：准备数据库凭证（用户名、密码）',
          '步骤4：按照格式填写完整的连接URI',
          '步骤5：保存后测试连接是否成功',
          '步骤6：如连接失败，检查防火墙和网络配置'
        ],
        // 示例
        examples: {
          mongodb: 'mongodb://admin:password@localhost:27017/fuyuan?authSource=admin',
          mysql: 'mysql://root:password@localhost:3306/fuyuan',
          postgresql: 'postgresql://postgres:password@localhost:5432/fuyuan',
          sqlite: 'sqlite:./data/fuyuan.sqlite'
        },
        // 注意事项
        notes: '• 生产环境必须使用强密码\n• 云数据库需要使用内网地址\n• 确保数据库防火墙允许应用服务器访问\n• 连接池大小要合理，避免连接数过多导致数据库压力过大'
      },

      DB_POOL_SIZE: {
        label: '数据库连接池最大大小',
        description: '设置数据库连接池同时保持的最大连接数，影响并发处理能力',
        type: 'number',
        required: true,
        defaultValue: 20,
        // 详细提示
        hint: '连接池说明：\n• 连接池复用连接，避免频繁创建和销毁连接\n• 合理的连接池大小可以提升性能\n• 过大的连接池会占用大量内存\n• 过小的连接池会导致连接等待',
        // 配置步骤
        steps: [
          '步骤1：评估应用的并发访问量',
          '步骤2：评估数据库服务器的硬件配置（CPU、内存）',
          '步骤3：根据并发量和硬件确定连接池大小',
          '步骤4：开发环境可以设置较小值（5-10）',
          '步骤5：生产环境建议设置为 20-50',
          '步骤6：高并发应用可以设置为 50-100'
        ],
        // 示例
        example: '20',
        // 建议值
        recommendations: {
          development: '5-10',
          production: '20-50',
          'high_concurrency': '50-100'
        },
        // 注意事项
        notes: '• 连接数越多，占用内存越大\n• 每个数据库连接都有网络开销\n• 建议设置为数据库最大连接数的 70%-80%\n• 定期监控连接池使用率'
      },

      DB_MIN_POOL_SIZE: {
        label: '数据库连接池最小大小',
        description: '设置数据库连接池始终保持的最小连接数，确保有可用连接',
        type: 'number',
        required: true,
        defaultValue: 5,
        // 详细提示
        hint: '最小连接数说明：\n• 即使没有请求，也会保持这些连接\n• 避免频繁创建和销毁连接\n• 确保有"热连接"可用，提升首次响应速度',
        // 配置步骤
        steps: [
          '步骤1：评估应用的访问频率',
          '步骤2：低频率应用可设置为 2-5',
          '步骤3：高频率应用可设置为 5-10',
          '步骤4：最小连接数应小于最大连接数',
          '步骤5：通常设置为最大连接数的 20%-30%'
        ],
        // 示例
        example: '5',
        // 注意事项
        notes: '• 最小连接数不能大于最大连接数\n• 过多的最小连接会浪费资源\n• 建议：最小连接数 ≤ 最大连接数 × 30%'
      },

      DB_TIMEOUT: {
        label: '数据库连接超时时间（毫秒）',
        description: '设置建立数据库连接的超时时间，超过此时间视为连接失败',
        type: 'number',
        required: true,
        defaultValue: 5000,
        // 详细提示
        hint: '超时时间说明：\n• 单位：毫秒（1000ms = 1秒）\n• 建议值：3000-10000\n• 过短会导致误判\n• 过长会导致长时间等待',
        // 配置步骤
        steps: [
          '步骤1：测试数据库连接的网络延迟（ping 或 telnet）',
          '步骤2：本地数据库：3000-5000ms',
          '步骤3：同机房云数据库：5000-8000ms',
          '步骤4：跨机房云数据库：8000-15000ms',
          '步骤5：慢速网络：15000-30000ms'
        ],
        // 示例
        example: '5000',
        // 建议值
        recommendations: {
          local_db: '3000-5000',
          cloud_db_same_region: '5000-8000',
          cloud_db_cross_region: '8000-15000',
          slow_network: '15000-30000'
        },
        // 注意事项
        notes: '• 超时时间应大于正常网络延迟\n• 超时过短会导致连接失败\n• 超时过长会导致响应慢\n• 根据实际网络状况调整'
      }
    }
  },

  // ====================================
  // Redis配置
  // ====================================
  redis: {
    title: 'Redis配置',
    description: '配置Redis缓存服务的连接信息，用于会话管理和数据缓存',
    icon: '⚡',
    items: {
      REDIS_URI: {
        label: 'Redis连接字符串',
        description: '填写Redis服务的连接地址，用于缓存和会话存储',
        type: 'text',
        required: false,
        // 详细提示
        hint: 'Redis连接格式：\n• 无密码：redis://host:port\n• 有密码：redis://:password@host:port\n• 云Redis：redis://:password@host:port',
        // 配置步骤
        steps: [
          '步骤1：确认Redis服务已启动（redis-cli ping）',
          '步骤2：确认Redis是否设置密码',
          '步骤3：准备Redis连接信息（地址、端口）',
          '步骤4：按照格式填写连接URI',
          '步骤5：如果是云Redis，使用内网地址',
          '步骤6：测试连接是否成功'
        ],
        // 示例
        examples: {
          local_no_password: 'redis://localhost:6379',
          local_with_password: 'redis://:yourpassword@localhost:6379',
          aliyun_redis: 'redis://:password@r-bp123456.redis.rds.aliyuncs.com:6379',
          tencent_redis: 'redis://:password@redis-123456.redis.tencentcloudapi.com:6379',
          aws_elasticache: 'redis://:password@cluster-name.abc123.use1.cache.amazonaws.com:6379'
        },
        // 注意事项
        notes: '• 云Redis务必使用内网地址以降低延迟和费用\n• 确保Redis密码设置正确\n• 生产环境建议启用Redis持久化\n• 监控Redis内存使用率，避免OOM'
      }
    }
  },

  // ====================================
  // 认证配置
  // ====================================
  auth: {
    title: '认证配置',
    description: '配置JWT令牌认证和管理员账号的安全信息',
    icon: '🔐',
    items: {
      JWT_SECRET: {
        label: 'JWT密钥',
        description: '用于生成和验证JWT令牌的密钥，生产环境必须使用强密钥',
        type: 'password',
        required: true,
        // 详细提示
        hint: 'JWT密钥要求：\n• 长度：至少32字符\n• 复杂度：包含大小写字母、数字、特殊字符\n• 安全性：生产环境必须修改默认密钥\n• 随机性：使用随机生成的密钥',
        // 配置步骤
        steps: [
          '步骤1：打开命令行工具',
          '步骤2：生成随机密钥：openssl rand -base64 32',
          '步骤3：或使用在线随机密钥生成器',
          '步骤4：将生成的密钥复制到输入框',
          '步骤5：确保密钥长度至少32字符',
          '步骤6：保存密钥后需要重新登录',
          '步骤7：旧密钥生成的令牌会失效'
        ],
        // 示例
        example: 'your-super-secret-jwt-key-at-least-32-characters-long-2026',
        // 生成命令
        generateCommand: 'openssl rand -base64 32',
        // 注意事项
        notes: '⚠️ 重要：\n• 生产环境必须修改默认密钥\n• 密钥泄露会导致安全风险\n• 密钥修改会导致所有用户需重新登录\n• 妥善保管密钥，不要提交到代码仓库'
      },

      JWT_EXPIRES_IN: {
        label: 'JWT令牌过期时间',
        description: '设置JWT令牌的有效期，过期后用户需要重新登录',
        type: 'text',
        required: true,
        defaultValue: '7d',
        // 详细提示
        hint: '时间格式：\n• 数字+单位：如 7d、24h、3600s\n• 常用单位：d（天）、h（小时）、m（分钟）、s（秒）\n• 过期后需重新登录获取新令牌',
        // 配置步骤
        steps: [
          '步骤1：根据应用性质确定令牌有效期',
          '步骤2：银行/支付类应用：1h-24h（高安全）',
          '步骤3：社交类应用：7d-30d（用户友好）',
          '步骤4：企业应用：12h-7d（平衡安全和便利）',
          '步骤5：填写时间，如：7d（7天）',
          '步骤6：保存后新令牌使用新有效期'
        ],
        // 示例
        examples: {
          one_hour: '1h',
          one_day: '24h',
          seven_days: '7d',
          thirty_days: '30d'
        },
        // 推荐值
        recommendations: {
          high_security: '1h-24h',
          user_friendly: '7d-30d',
          balanced: '12h-7d'
        },
        // 注意事项
        notes: '• 有效期越短越安全，但用户体验越差\n• 有效期越长越方便，但安全风险越大\n• 建议根据应用性质选择\n• 高安全要求的应用建议使用较短的有效期'
      },

      ADMIN_USERNAME: {
        label: '管理员用户名',
        description: '设置系统管理员账号的登录用户名',
        type: 'text',
        required: true,
        defaultValue: 'admin',
        // 详细提示
        hint: '用户名要求：\n• 长度：3-20字符\n• 字符：字母、数字、下划线\n• 大小写敏感\n• 建议不使用默认的 admin',
        // 配置步骤
        steps: [
          '步骤1：设计一个容易记忆的用户名',
          '步骤2：避免使用常见的用户名（admin、root等）',
          '步骤3：只包含字母、数字、下划线',
          '步骤4：长度控制在 3-20 字符之间',
          '步骤5：填写到输入框',
          '步骤6：使用该用户名登录后台'
        ],
        // 示例
        example: 'system_admin_2026',
        // 注意事项
        notes: '• 避免使用默认的 admin\n• 不要使用容易猜测的用户名\n• 建议结合应用名称，如：fuyuan_admin\n• 记住设置的用户名，方便后续登录'
      },

      ADMIN_PASSWORD: {
        label: '管理员密码',
        description: '设置系统管理员账号的登录密码，必须设置足够复杂的密码',
        type: 'password',
        required: true,
        defaultValue: 'admin123',
        // 详细提示
        hint: '密码要求：\n• 长度：至少8位，建议12位以上\n• 字符：包含大小写字母、数字、特殊字符\n• 复杂度：避免常见密码和连续字符\n• 安全性：生产环境必须修改默认密码',
        // 配置步骤
        steps: [
          '步骤1：设计一个强密码',
          '步骤2：包含：大写字母（A-Z）',
          '步骤3：包含：小写字母（a-z）',
          '步骤4：包含：数字（0-9）',
          '步骤5：包含：特殊字符（!@#$%^&*）',
          '步骤6：长度至少8位，建议12位以上',
          '步骤7：避免：连续字符（123abc）和常见单词',
          '步骤8：填写到输入框并确认',
          '步骤9：使用新密码重新登录'
        ],
        // 示例
        example: 'Secure@Pass2026!',
        // 不推荐的密码
        badExamples: ['123456', 'password', 'admin123', 'abc123', '12345678'],
        // 注意事项
        notes: '⚠️ 重要：\n• 生产环境必须修改默认密码\n• 不要使用生日、手机号等个人信息\n• 定期更换密码（建议每3-6个月）\n• 不要在其他网站使用相同密码\n• 妥善保管，不要泄露给他人'
      }
    }
  },

  // ====================================
  // 安全配置
  // ====================================
  security: {
    title: '安全配置',
    description: '配置应用的安全相关参数，包括CORS、限流和安全头',
    icon: '🛡️',
    items: {
      ALLOWED_ORIGINS: {
        label: '允许的跨域来源',
        description: '设置允许跨域访问应用的前端地址，多个地址用逗号分隔',
        type: 'textarea',
        required: true,
        defaultValue: '*',
        // 详细提示
        hint: '跨域说明：\n• 开发环境：使用 * 允许所有来源\n• 生产环境：指定具体域名\n• 多个域名：用英文逗号分隔\n• 协议：必须包含 http:// 或 https://',
        // 配置步骤
        steps: [
          '步骤1：确定前端访问地址（开发环境或生产环境）',
          '步骤2：如果是开发环境，使用 * 允许所有来源',
          '步骤3：如果是生产环境，列出所有可能的域名',
          '步骤4：格式：协议 + 域名 + 端口（可选）',
          '步骤5：多个域名用英文逗号分隔',
          '示例：https://example.com,https://www.example.com,https://api.example.com'
        ],
        // 示例
        examples: {
          development: '*',
          single_domain: 'https://example.com',
          multiple_domains: 'https://example.com,https://www.example.com,https://api.example.com',
          with_port: 'https://example.com:3000,http://localhost:3000'
        },
        // 注意事项
        notes: '• 生产环境不建议使用 *，会有安全风险\n• 确保包含所有可能的域名（包括www）\n• 如果有多个域名，全部列出\n• 协议（http/https）必须匹配'
      },

      RATE_LIMIT_MAX_REQUESTS: {
        label: '限流最大请求数',
        description: '设置单个IP在限流时间窗口内允许的最大请求数',
        type: 'number',
        required: true,
        defaultValue: 100,
        // 详细提示
        hint: '限流说明：\n• 防止恶意请求和DDoS攻击\n• 保护服务器资源\n• 超过限制将返回429状态码\n• 合理设置避免影响正常用户',
        // 配置步骤
        steps: [
          '步骤1：评估应用的正常访问量',
          '步骤2：个人应用：50-100请求/窗口',
          '步骤3：中小型应用：100-500请求/窗口',
          '步骤4：大型应用：500-1000请求/窗口',
          '步骤5：监控限流触发频率，调整数值',
          '步骤6：过高会影响用户体验，过低无法防护'
        ],
        // 示例
        example: '100',
        // 推荐值
        recommendations: {
          personal_app: '50-100',
          small_medium_app: '100-500',
          large_app: '500-1000',
          api_only: '1000-5000'
        },
        // 注意事项
        notes: '• 限流是基于IP地址的\n• API接口通常需要更高的限流值\n• 监控限流日志，评估是否合理\n• 可以为不同接口设置不同的限流值'
      },

      RATE_LIMIT_WINDOW_MS: {
        label: '限流时间窗口（毫秒）',
        description: '设置限流的时间窗口长度，超过此时间后请求计数重置',
        type: 'number',
        required: true,
        defaultValue: 900000,
        // 详细提示
        hint: '时间窗口说明：\n• 单位：毫秒（1000ms = 1秒）\n• 窗口内请求数超过限制会被限流\n• 时间窗口结束后计数重置\n• 合理的时间窗口很重要',
        // 配置步骤
        steps: [
          '步骤1：根据应用性质选择时间窗口',
          '步骤2：高频率操作：1-5分钟',
          '步骤3：普通操作：10-15分钟（推荐）',
          '步骤4：低频率操作：30-60分钟',
          '步骤5：填写时间窗口（毫秒）',
          '示例：15分钟 = 15 × 60 × 1000 = 900000ms'
        ],
        // 示例
        examples: {
          one_minute: '60000',
          five_minutes: '300000',
          fifteen_minutes: '900000',
          thirty_minutes: '1800000',
          one_hour: '3600000'
        },
        // 推荐值
        recommendations: {
          high_frequency: '60000-300000',
          normal: '900000-1800000',
          low_frequency: '3600000-7200000'
        },
        // 注意事项
        notes: '• 时间窗口过短会导致正常用户被限流\n• 时间窗口过长无法有效防护\n• 建议设置为 10-15 分钟\n• 根据实际监控数据调整'
      }
    }
  },

  // ====================================
  // 上传配置
  // ====================================
  upload: {
    title: '上传配置',
    description: '配置文件上传的大小限制、允许的文件类型等参数',
    icon: '📤',
    items: {
      MAX_FILE_SIZE: {
        label: '最大文件大小（字节）',
        description: '设置允许上传的单个文件的最大大小，超过此大小的文件会被拒绝',
        type: 'number',
        required: true,
        defaultValue: 10485760,
        // 详细提示
        hint: '文件大小说明：\n• 单位：字节（Byte）\n• 换算：1KB=1024B, 1MB=1024KB, 1GB=1024MB\n• 常用值：10MB=10485760\n• 限制文件大小可以节省服务器存储空间',
        // 配置步骤
        steps: [
          '步骤1：确定业务需求的最大文件大小',
          '步骤2：头像上传：1-5MB（1048576-5242880）',
          '步骤3：图片上传：5-10MB（5242880-10485760）',
          '步骤4：视频上传：10-50MB（10485760-52428800）',
          '步骤5：将字节数填写到输入框',
          '计算方法: 10MB × 1024 × 1024 = 10485760字节'
        ],
        // 示例
        examples: {
          one_mb: '1048576',
          five_mb: '5242880',
          ten_mb: '10485760',
          twenty_mb: '20971520',
          fifty_mb: '52428800'
        },
        // 注意事项
        notes: '• 文件大小越大，上传时间越长\n• 文件大小越大，占用存储空间越多\n• 文件大小越大，带宽消耗越大\n• 根据业务需求和服务器配置合理设置'
      }
    }
  }
};

/**
 * 获取配置元数据
 */
function getConfigMeta(groupId: string) {
  return configMeta[groupId] || null;
}

/**
 * 获取配置项元数据
 */
function getConfigItemMeta(groupId: string, itemKey: string) {
  const group = configMeta[groupId];
  if (!group) return null;
  return group.items[itemKey] || null;
}

/**
 * 获取所有配置组
 */
function getAllConfigGroups() {
  return Object.keys(configMeta).map(key => ({
    id: key,
    ...configMeta[key]
  }));
}

module.exports = {
  configMeta,
  getConfigMeta,
  getConfigItemMeta,
  getAllConfigGroups
};

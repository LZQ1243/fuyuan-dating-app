<template>
  <el-container class="config-container">
    <el-header>
      <div class="header-title">
        <el-icon><Setting /></el-icon>
        <span>系统配置中心</span>
      </div>
    </el-header>

    <el-main>
      <el-tabs v-model="activeTab" type="card">
        <!-- API配置 -->
        <el-tab-pane label="API配置" name="api">
          <el-form :model="configForm.api" label-width="150px">
            <el-form-item label="API基础URL">
              <el-input v-model="configForm.api.baseUrl" placeholder="http://localhost:3000" />
              <div class="form-tip">后端API的完整地址，前端将从此地址获取配置</div>
            </el-form-item>
            <el-form-item label="API端口">
              <el-input-number v-model="configForm.api.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('api')">保存API配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 前端配置 -->
        <el-tab-pane label="前端配置" name="frontend">
          <el-form :model="configForm.frontend" label-width="150px">
            <el-form-item label="uni-app地址">
              <el-input v-model="configForm.frontend.uniappUrl" placeholder="http://localhost:8080" />
            </el-form-item>
            <el-form-item label="React前端地址">
              <el-input v-model="configForm.frontend.reactUrl" placeholder="http://localhost:3002" />
            </el-form-item>
            <el-form-item label="管理后台地址">
              <el-input v-model="configForm.frontend.adminUrl" placeholder="http://localhost:3001" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('frontend')">保存前端配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 阿里云配置 -->
        <el-tab-pane label="阿里云服务" name="aliyun">
          <el-form :model="configForm.aliyun" label-width="150px">
            <el-divider content-position="left">语音识别(ASR)</el-divider>
            <el-form-item label="AppKey">
              <el-input v-model="configForm.aliyun.asr.appKey" type="password" show-password />
            </el-form-item>
            <el-form-item label="Token">
              <el-input v-model="configForm.aliyun.asr.token" type="password" show-password />
            </el-form-item>
            <el-form-item label="Endpoint">
              <el-input v-model="configForm.aliyun.asr.endpoint" />
            </el-form-item>

            <el-divider content-position="left">语音合成(TTS)</el-divider>
            <el-form-item label="AppKey">
              <el-input v-model="configForm.aliyun.tts.appKey" type="password" show-password />
            </el-form-item>
            <el-form-item label="Token">
              <el-input v-model="configForm.aliyun.tts.token" type="password" show-password />
            </el-form-item>
            <el-form-item label="Endpoint">
              <el-input v-model="configForm.aliyun.tts.endpoint" />
            </el-form-item>

            <el-divider content-position="left">对象存储(OSS)</el-divider>
            <el-form-item label="AccessKey ID">
              <el-input v-model="configForm.aliyun.oss.accessKeyId" type="password" show-password />
            </el-form-item>
            <el-form-item label="AccessKey Secret">
              <el-input v-model="configForm.aliyun.oss.accessKeySecret" type="password" show-password />
            </el-form-item>
            <el-form-item label="Bucket名称">
              <el-input v-model="configForm.aliyun.oss.bucket" />
            </el-form-item>
            <el-form-item label="Region">
              <el-input v-model="configForm.aliyun.oss.region" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('aliyun')">保存阿里云配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 腾讯云配置 -->
        <el-tab-pane label="腾讯云服务" name="tencent">
          <el-form :model="configForm.tencent" label-width="150px">
            <el-divider content-position="left">人脸识别</el-divider>
            <el-form-item label="Secret ID">
              <el-input v-model="configForm.tencent.face.secretId" type="password" show-password />
            </el-form-item>
            <el-form-item label="Secret Key">
              <el-input v-model="configForm.tencent.face.secretKey" type="password" show-password />
            </el-form-item>
            <el-form-item label="Region">
              <el-input v-model="configForm.tencent.face.region" />
            </el-form-item>
            <el-form-item label="Endpoint">
              <el-input v-model="configForm.tencent.face.endpoint" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('tencent')">保存腾讯云配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 数据库配置 -->
        <el-tab-pane label="数据库配置" name="database">
          <el-form :model="configForm.database" label-width="150px">
            <el-divider content-position="left">MongoDB</el-divider>
            <el-form-item label="连接字符串">
              <el-input v-model="configForm.database.mongoUrl" type="textarea" :rows="2" />
            </el-form-item>

            <el-divider content-position="left">MySQL</el-divider>
            <el-form-item label="Host">
              <el-input v-model="configForm.database.mysqlHost" />
            </el-form-item>
            <el-form-item label="Port">
              <el-input-number v-model="configForm.database.mysqlPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="configForm.database.mysqlUser" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="configForm.database.mysqlPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="数据库名">
              <el-input v-model="configForm.database.mysqlDatabase" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('database')">保存数据库配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Redis配置 -->
        <el-tab-pane label="Redis配置" name="redis">
          <el-form :model="configForm.redis" label-width="150px">
            <el-form-item label="Host">
              <el-input v-model="configForm.redis.host" />
            </el-form-item>
            <el-form-item label="Port">
              <el-input-number v-model="configForm.redis.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="configForm.redis.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('redis')">保存Redis配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- WebSocket配置 -->
        <el-tab-pane label="WebSocket配置" name="websocket">
          <el-form :model="configForm.websocket" label-width="150px">
            <el-form-item label="端口">
              <el-input-number v-model="configForm.websocket.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="Path">
              <el-input v-model="configForm.websocket.path" />
            </el-form-item>
            <el-form-item label="CORS Origin">
              <el-input v-model="configForm.websocket.cors.origin" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('websocket')">保存WebSocket配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 短信/邮件配置 -->
        <el-tab-pane label="短信/邮件" name="thirdParty">
          <el-form :model="configForm.thirdParty" label-width="150px">
            <el-divider content-position="left">短信服务</el-divider>
            <el-form-item label="服务商">
              <el-select v-model="configForm.thirdParty.sms.provider">
                <el-option label="阿里云" value="aliyun" />
                <el-option label="腾讯云" value="tencent" />
              </el-select>
            </el-form-item>
            <el-form-item label="AccessKey ID">
              <el-input v-model="configForm.thirdParty.sms.accessKeyId" type="password" show-password />
            </el-form-item>
            <el-form-item label="AccessKey Secret">
              <el-input v-model="configForm.thirdParty.sms.accessKeySecret" type="password" show-password />
            </el-form-item>
            <el-form-item label="签名">
              <el-input v-model="configForm.thirdParty.sms.signName" />
            </el-form-item>
            <el-form-item label="模板代码">
              <el-input v-model="configForm.thirdParty.sms.templateCode" />
            </el-form-item>

            <el-divider content-position="left">邮件服务</el-divider>
            <el-form-item label="SMTP Host">
              <el-input v-model="configForm.thirdParty.email.host" />
            </el-form-item>
            <el-form-item label="Port">
              <el-input v-model="configForm.thirdParty.email.port" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="configForm.thirdParty.email.user" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="configForm.thirdParty.email.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="发件人">
              <el-input v-model="configForm.thirdParty.email.from" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('thirdParty')">保存第三方配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 功能开关 -->
        <el-tab-pane label="功能开关" name="features">
          <el-form :model="configForm.features" label-width="200px">
            <el-divider content-position="left">注册流程</el-divider>
            <el-form-item label="强制实名认证">
              <el-switch v-model="configForm.features.registration.enforceRealName" />
            </el-form-item>
            <el-form-item label="强制身份证认证">
              <el-switch v-model="configForm.features.registration.enforceIdCard" />
            </el-form-item>
            <el-form-item label="强制残疾证认证">
              <el-switch v-model="configForm.features.registration.enforceDisabilityCert" />
            </el-form-item>
            <el-form-item label="强制婚姻认证">
              <el-switch v-model="configForm.features.registration.enforceMarriageCert" />
            </el-form-item>
            <el-form-item label="强制人脸识别">
              <el-switch v-model="configForm.features.registration.enforceFaceRecognition" />
            </el-form-item>

            <el-divider content-position="left">智能匹配</el-divider>
            <el-form-item label="启用匹配功能">
              <el-switch v-model="configForm.features.match.enabled" />
            </el-form-item>
            <el-form-item label="匹配算法">
              <el-select v-model="configForm.features.match.algorithm">
                <el-option label="加权算法" value="weighted" />
                <el-option label="简单匹配" value="simple" />
                <el-option label="随机推荐" value="random" />
              </el-select>
            </el-form-item>
            <el-form-item label="最大推荐数">
              <el-input-number v-model="configForm.features.match.maxRecommendations" :min="1" :max="100" />
            </el-form-item>

            <el-divider content-position="left">聊天功能</el-divider>
            <el-form-item label="启用聊天">
              <el-switch v-model="configForm.features.chat.enabled" />
            </el-form-item>
            <el-form-item label="最大消息长度">
              <el-input-number v-model="configForm.features.chat.maxMessageLength" :min="1" :max="10000" />
            </el-form-item>

            <el-divider content-position="left">动态功能</el-divider>
            <el-form-item label="启用动态">
              <el-switch v-model="configForm.features.posts.enabled" />
            </el-form-item>
            <el-form-item label="最大动态长度">
              <el-input-number v-model="configForm.features.posts.maxPostLength" :min="1" :max="2000" />
            </el-form-item>
            <el-form-item label="最大图片数">
              <el-input-number v-model="configForm.features.posts.maxImages" :min="1" :max="20" />
            </el-form-item>

            <el-divider content-position="left">短视频功能</el-divider>
            <el-form-item label="启用短视频">
              <el-switch v-model="configForm.features.shortVideo.enabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('features')">保存功能配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全配置 -->
        <el-tab-pane label="安全配置" name="security">
          <el-form :model="configForm.security" label-width="150px">
            <el-form-item label="JWT密钥">
              <el-input v-model="configForm.security.jwtSecret" type="password" show-password />
              <div class="form-tip">修改后所有用户需要重新登录</div>
            </el-form-item>
            <el-form-item label="JWT过期时间">
              <el-input v-model="configForm.security.jwtExpire" />
            </el-form-item>
            <el-form-item label="Bcrypt盐值">
              <el-input-number v-model="configForm.security.bcryptSalt" :min="4" :max="12" />
            </el-form-item>

            <el-divider content-position="left">限流配置</el-divider>
            <el-form-item label="时间窗口(毫秒)">
              <el-input-number v-model="configForm.security.rateLimit.windowMs" :min="1000" />
            </el-form-item>
            <el-form-item label="最大请求数">
              <el-input-number v-model="configForm.security.rateLimit.max" :min="1" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig('security')">保存安全配置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { getConfig, updateConfig } from '@/api/config'

const activeTab = ref('api')
const configForm = ref({
  api: {
    baseUrl: 'http://localhost:3000',
    port: 3000,
  },
  frontend: {
    uniappUrl: 'http://localhost:8080',
    reactUrl: 'http://localhost:3002',
    adminUrl: 'http://localhost:3001',
  },
  aliyun: {
    asr: {
      appKey: '',
      token: '',
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
    },
    tts: {
      appKey: '',
      token: '',
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
    },
    oss: {
      accessKeyId: '',
      accessKeySecret: '',
      bucket: '',
      region: 'oss-cn-shanghai',
      endpoint: 'https://oss-cn-shanghai.aliyuncs.com',
    },
  },
  tencent: {
    face: {
      secretId: '',
      secretKey: '',
      region: 'ap-guangzhou',
      endpoint: 'faceid.tencentcloudapi.com',
    },
  },
  database: {
    mongoUrl: 'mongodb://localhost:27017/fuyuan',
    mysqlHost: 'localhost',
    mysqlPort: 3306,
    mysqlUser: 'root',
    mysqlPassword: '',
    mysqlDatabase: 'fuyuan',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: '',
  },
  websocket: {
    port: 3000,
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  },
  thirdParty: {
    sms: {
      provider: 'aliyun',
      accessKeyId: '',
      accessKeySecret: '',
      signName: '赴缘',
      templateCode: '',
    },
    email: {
      host: '',
      port: '587',
      user: '',
      password: '',
      from: 'noreply@fuyuan.com',
    },
  },
  features: {
    registration: {
      required: true,
      steps: 5,
      enforceRealName: true,
      enforceIdCard: true,
      enforceDisabilityCert: true,
      enforceMarriageCert: true,
      enforceFaceRecognition: true,
    },
    match: {
      enabled: true,
      algorithm: 'weighted',
      maxRecommendations: 20,
    },
    chat: {
      enabled: true,
      maxMessageLength: 1000,
      messageRetentionDays: 90,
    },
    posts: {
      enabled: true,
      maxPostLength: 500,
      maxImages: 9,
      maxVideoDuration: 60,
    },
    shortVideo: {
      enabled: true,
      maxPackagePrice: 999,
    },
  },
  security: {
    jwtSecret: 'fuyuan-secret-key-2024',
    jwtExpire: '7d',
    bcryptSalt: 10,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },
})

const loadConfig = async () => {
  try {
    const res = await getConfig()
    if (res.code === 200 && res.data) {
      // 合并配置数据
      const mergedConfig = { ...configForm.value, ...res.data }
      configForm.value = mergedConfig
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

const saveConfig = async (category) => {
  try {
    const updates = { [category]: configForm.value[category] }
    const res = await updateConfig(updates)
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.config-container {
  height: 100vh;
  background: #f5f5f5;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  
  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: bold;
  }
}

.el-main {
  padding: 30px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.el-divider {
  margin: 30px 0 20px;
}
</style>

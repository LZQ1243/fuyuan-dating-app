<template>
  <div class="login-container">
    <!-- 左侧品牌区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo">
          <div class="logo-text">赴缘</div>
        </div>
        <h1 class="brand-title">残疾人婚恋相亲平台</h1>
        <p class="brand-slogan">无"碍"交流，有"缘"相守</p>
        <div class="brand-decoration">
          <div class="deco-circle"></div>
          <div class="deco-line"></div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="login-section">
      <div class="login-content">
        <h2 class="login-title">欢迎登录</h2>

        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            账号密码
          </div>
          <div class="tab-divider"></div>
          <div
            class="tab-item"
            :class="{ active: loginType === 'wechat' }"
            @click="loginType = 'wechat'"
          >
            微信扫码
          </div>
        </div>

        <!-- 账号密码登录表单 -->
        <el-form
          v-if="loginType === 'password'"
          :model="form"
          :rules="rules"
          ref="formRef"
          class="login-form"
        >
          <el-form-item prop="username">
            <div class="input-wrapper">
              <span class="input-label">账号</span>
              <el-input
                v-model="form.username"
                placeholder="请输入管理员账号"
                size="large"
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <span class="input-label">密码</span>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                class="custom-input"
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>

          <!-- 第三方登录 -->
          <div class="third-party-login">
            <div class="divider">
              <span class="divider-text">其他登录方式</span>
            </div>
            <div class="third-party-icons">
              <div class="icon-item wechat" @click="handleWechatLogin">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M8.5,13.5A1.5,1.5 0 1,1 7,12A1.5,1.5 0 0,1 8.5,13.5M12.5,13.5A1.5,1.5 0 1,1 11,12A1.5,1.5 0 0,1 12.5,13.5M15,9.5A1.5,1.5 0 1,1 13.5,8A1.5,1.5 0 0,1 15,9.5M18.5,13.5A1.5,1.5 0 1,1 17,12A1.5,1.5 0 0,1 18.5,13.5M12,4.5A7.5,7.5 0 0,0 4.5,12A7.5,7.5 0 0,0 12,19.5A7.5,7.5 0 0,0 19.5,12A7.5,7.5 0 0,0 12,4.5Z"/>
                </svg>
              </div>
              <div class="icon-item qq" @click="handleQQLogin">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M15.5,7.5A1.5,1.5 0 1,1 14,6A1.5,1.5 0 0,1 15.5,7.5M8.5,7.5A1.5,1.5 0 1,1 7,6A1.5,1.5 0 0,1 8.5,7.5Z"/>
                </svg>
              </div>
            </div>
          </div>
        </el-form>

        <!-- 微信扫码登录 -->
        <div v-if="loginType === 'wechat'" class="wechat-login">
          <div class="qr-code-container">
            <div class="qr-placeholder">
              <svg viewBox="0 0 24 24" width="80" height="80" class="qr-icon">
                <path fill="currentColor" d="M3,3H21V21H3V3M5,5V19H19V5H5M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z"/>
              </svg>
              <p class="qr-text">请使用微信扫码登录</p>
              <p class="qr-tip">打开微信扫一扫</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const loginType = ref('password')

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    await userStore.login(form.value)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    if (error !== false) {
      ElMessage.error(error.message || '登录失败，请检查账号密码')
    }
  } finally {
    loading.value = false
  }
}

const handleWechatLogin = () => {
  ElMessage.info('微信登录功能开发中')
}

const handleQQLogin = () => {
  ElMessage.info('QQ登录功能开发中')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
}

.brand-content {
  color: #fff;
  position: relative;
  z-index: 1;
}

.logo {
  margin-bottom: 30px;
}

.logo-text {
  font-size: 72px;
  font-weight: bold;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 8px;
}

.brand-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.brand-slogan {
  font-size: 20px;
  font-weight: 300;
  opacity: 0.95;
  margin-bottom: 50px;
  letter-spacing: 2px;
}

.brand-decoration {
  display: flex;
  align-items: center;
  gap: 20px;
}

.deco-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: pulse 2s infinite;
}

.deco-line {
  width: 80px;
  height: 2px;
  background: rgba(255, 255, 255, 0.4);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 右侧登录区 */
.login-section {
  width: 500px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
}

.login-content {
  width: 380px;
  padding: 40px 0;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 40px;
  text-align: center;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  transition: all 0.3s;
  position: relative;
}

.tab-item.active {
  color: #FF6B6B;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #FF6B6B;
  border-radius: 2px;
}

.tab-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

/* 表单样式 */
.login-form {
  margin-top: 20px;
}

.input-wrapper {
  margin-bottom: 10px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
}

.custom-input {
  width: 100%;
}

:deep(.custom-input .el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: none;
  transition: all 0.3s;
}

:deep(.custom-input .el-input__wrapper:hover) {
  border-color: #FF8E8C;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  border-color: #FF6B6B;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.login-button {
  width: 100%;
  height: 48px;
  margin-top: 10px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 第三方登录 */
.third-party-login {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider-text {
  padding: 0 15px;
  font-size: 13px;
  color: #999;
}

.third-party-icons {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f5f5;
}

.icon-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-item.wechat {
  color: #07c160;
}

.icon-item.wechat:hover {
  background: #07c160;
  color: #fff;
}

.icon-item.qq {
  color: #12b7f5;
}

.icon-item.qq:hover {
  background: #12b7f5;
  color: #fff;
}

/* 微信扫码登录 */
.wechat-login {
  text-align: center;
  padding: 20px 0;
}

.qr-code-container {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #eee;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-icon {
  color: #07c160;
  opacity: 0.3;
}

.qr-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.qr-tip {
  font-size: 14px;
  color: #999;
}

/* 响应式 */
@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .login-section {
    width: 100%;
  }

  .login-content {
    width: 400px;
  }
}

@media (max-width: 480px) {
  .login-content {
    width: 100%;
    padding: 20px;
  }

  .logo-text {
    font-size: 48px;
  }
}
</style>

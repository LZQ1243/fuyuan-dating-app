<template>
  <div class="chat-communication">
    <div class="page-header">
      <h2 class="page-title">用户沟通</h2>
      <p class="page-desc">红娘与用户相互聊天沟通</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧: 用户列表 -->
      <el-col :xs="24" :md="8">
        <el-card class="user-list-card">
          <template #header>
            <div class="card-header">
              <span>我的用户</span>
            </div>
          </template>

          <!-- 搜索用户 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户昵称"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 用户列表 -->
          <div class="user-list">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="user-item"
              :class="{ active: currentChatUser?.id === user.id }"
              @click="handleSelectUser(user)"
            >
              <div class="user-avatar">
                <el-avatar :size="50" :src="user.avatar" />
                <div v-if="user.unreadCount > 0" class="unread-badge">
                  {{ user.unreadCount }}
                </div>
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.nickname }}</div>
                <div class="user-last-message">
                  {{ user.lastMessage }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧: 聊天界面 -->
      <el-col :xs="24" :md="16" v-if="currentChatUser">
        <el-card class="chat-card">
          <template #header>
            <div class="chat-header">
              <div class="user-info">
                <el-avatar :size="40" :src="currentChatUser.avatar" />
                <div class="user-detail">
                  <div class="user-name">{{ currentChatUser.nickname }}</div>
                  <div class="user-status">
                    <el-tag :type="currentChatUser.online ? 'success' : 'info'" size="small">
                      {{ currentChatUser.online ? '在线' : '离线' }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="header-actions">
                <el-button type="success" size="small" @click="handleVideoCall">
                  <el-icon><VideoCamera /></el-icon>
                  视频通话
                </el-button>
                <el-button type="primary" size="small" @click="handleVoiceCall">
                  <el-icon><Phone /></el-icon>
                  语音通话
                </el-button>
              </div>
            </div>
          </template>

          <!-- 聊天记录 -->
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="message in messageList"
              :key="message.id"
              class="message-item"
              :class="message.senderId === currentMatchmakerId ? 'message-right' : 'message-left'"
            >
              <el-avatar
                :size="40"
                :src="message.senderId === currentMatchmakerId ? currentMatchmakerAvatar : currentChatUser.avatar"
                class="message-avatar"
              />
              <div class="message-content">
                <div class="message-info">
                  <span class="sender-name">
                    {{ message.senderId === currentMatchmakerId ? '我' : currentChatUser.nickname }}
                  </span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <!-- 文本消息 -->
                <div v-if="message.type === 'text'" class="message-text">
                  {{ message.content }}
                </div>
                <!-- 图片消息 -->
                <div v-else-if="message.type === 'image'" class="message-image">
                  <el-image
                    :src="message.content"
                    :preview-src-list="[message.content]"
                    fit="cover"
                    style="max-width: 200px; max-height: 200px;"
                  />
                </div>
                <!-- 手机号消息 -->
                <div v-else-if="message.type === 'phone'" class="message-phone">
                  <el-icon><Phone /></el-icon>
                  <span>手机号: {{ message.content }}</span>
                </div>
                <!-- 地址消息 -->
                <div v-else-if="message.type === 'address'" class="message-address">
                  <el-icon><Location /></el-icon>
                  <span>地址: {{ message.content }}</span>
                </div>
                <!-- 语音通话消息 -->
                <div v-else-if="message.type === 'voice-call'" class="message-voice-call">
                  <el-icon><Phone /></el-icon>
                  <span class="call-text">语音通话</span>
                  <span class="call-duration">{{ message.duration }}</span>
                </div>
                <!-- 视频通话消息 -->
                <div v-else-if="message.type === 'video-call'" class="message-video-call">
                  <el-icon><VideoCamera /></el-icon>
                  <span class="call-text">视频通话</span>
                  <span class="call-duration">{{ message.duration }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 发送消息区域 -->
          <div class="message-input-area">
            <!-- 快捷操作 -->
            <div class="quick-actions">
              <el-upload
                :show-file-list="false"
                :on-success="handleImageSuccess"
                :before-upload="beforeImageUpload"
                accept="image/*"
              >
                <el-button circle>
                  <el-icon><Picture /></el-icon>
                </el-button>
              </el-upload>
              <el-tooltip content="发送手机号">
                <el-button circle @click="showPhoneDialog = true">
                  <el-icon><Phone /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="发送地址">
                <el-button circle @click="showAddressDialog = true">
                  <el-icon><Location /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="语音通话">
                <el-button circle @click="handleVoiceCall">
                  <el-icon><Microphone /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="视频通话">
                <el-button circle @click="handleVideoCall">
                  <el-icon><VideoCamera /></el-icon>
                </el-button>
              </el-tooltip>
            </div>

            <!-- 文本输入 -->
            <div class="input-wrapper">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="3"
                placeholder="输入消息内容..."
                @keydown.ctrl.enter="handleSendMessage"
                class="message-input"
              />
              <el-button type="primary" @click="handleSendMessage" :disabled="!messageInput.trim()">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发送手机号对话框 -->
    <el-dialog v-model="showPhoneDialog" title="发送手机号" width="500px">
      <el-form :model="phoneForm" label-width="80px">
        <el-form-item label="手机号">
          <el-input
            v-model="phoneForm.number"
            placeholder="请输入手机号"
            maxlength="11"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSendPhone">确定</el-button>
      </template>
    </el-dialog>

    <!-- 发送地址对话框 -->
    <el-dialog v-model="showAddressDialog" title="发送地址" width="600px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="省份">
          <el-select v-model="addressForm.province" placeholder="请选择省份" style="width: 100%">
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="天津市" value="天津市" />
            <el-option label="重庆市" value="重庆市" />
            <el-option label="广东省" value="广东省" />
            <el-option label="江苏省" value="江苏省" />
            <el-option label="浙江省" value="浙江省" />
            <el-option label="山东省" value="山东省" />
            <el-option label="河南省" value="河南省" />
            <el-option label="四川省" value="四川省" />
            <el-option label="湖北省" value="湖北省" />
            <el-option label="湖南省" value="湖南省" />
            <el-option label="河北省" value="河北省" />
            <el-option label="福建省" value="福建省" />
            <el-option label="陕西省" value="陕西省" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="addressForm.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSendAddress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 视频通话对话框 -->
    <el-dialog
      v-model="showVideoCallDialog"
      :title="currentChatUser ? `正在与${currentChatUser.nickname}视频通话` : '视频通话'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="video-call-content">
        <el-icon class="video-icon"><VideoCamera /></el-icon>
        <p class="call-status">视频通话中...</p>
        <p class="call-time">通话时长: {{ callDuration }}</p>
        <el-button type="danger" @click="handleEndCall">结束通话</el-button>
      </div>
    </el-dialog>

    <!-- 语音通话对话框 -->
    <el-dialog
      v-model="showVoiceCallDialog"
      :title="currentChatUser ? `正在与${currentChatUser.nickname}语音通话` : '语音通话'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="voice-call-content">
        <el-icon class="voice-icon"><Phone /></el-icon>
        <p class="call-status">语音通话中...</p>
        <p class="call-time">通话时长: {{ callDuration }}</p>
        <el-button type="danger" @click="handleEndCall">结束通话</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Phone, Location, Picture, Microphone, VideoCamera } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const messageInput = ref('')
const currentChatUser = ref(null)
const showPhoneDialog = ref(false)
const showAddressDialog = ref(false)
const showVideoCallDialog = ref(false)
const showVoiceCallDialog = ref(false)
const callDuration = ref('00:00')
const messagesContainer = ref(null)
let callTimer = null

// 当前红娘信息
const currentMatchmakerId = ref(1)
const currentMatchmakerAvatar = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=matchmaker')

// 用户列表
const users = ref([
  {
    id: 1,
    nickname: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    online: true,
    lastMessage: '你好,很高兴认识你',
    unreadCount: 2
  },
  {
    id: 2,
    nickname: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    online: false,
    lastMessage: '我们可以聊聊吗?',
    unreadCount: 0
  },
  {
    id: 3,
    nickname: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    online: true,
    lastMessage: '我看到了你的资料',
    unreadCount: 5
  }
])

// 聊天记录
const messageList = ref([
  {
    id: 1,
    senderId: 2,
    type: 'text',
    content: '你好,很高兴认识你',
    time: '10:30:00'
  },
  {
    id: 2,
    senderId: 1,
    type: 'text',
    content: '你好,我是红娘,有什么可以帮助你的吗?',
    time: '10:35:00'
  },
  {
    id: 3,
    senderId: 2,
    type: 'text',
    content: '我们可以聊聊吗?',
    time: '11:00:00'
  }
])

const phoneForm = ref({
  number: ''
})

const addressForm = ref({
  province: '',
  city: '',
  detail: ''
})

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  return users.value.filter(user =>
    user.nickname.includes(searchKeyword.value)
  )
})

const handleSelectUser = (user) => {
  currentChatUser.value = user
  user.unreadCount = 0
  scrollToBottom()
}

const handleSendMessage = async () => {
  if (!messageInput.value.trim()) return

  const message = {
    id: Date.now(),
    senderId: currentMatchmakerId.value,
    type: 'text',
    content: messageInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  messageList.value.push(message)
  messageInput.value = ''

  await nextTick()
  scrollToBottom()
}

const handleImageSuccess = (response) => {
  ElMessage.success('图片上传成功')

  const message = {
    id: Date.now(),
    senderId: currentMatchmakerId.value,
    type: 'image',
    content: response.url,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  messageList.value.push(message)

  nextTick(() => {
    scrollToBottom()
  })
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }

  return true
}

const handleSendPhone = () => {
  if (!phoneForm.value.number) {
    ElMessage.warning('请输入手机号')
    return
  }

  const message = {
    id: Date.now(),
    senderId: currentMatchmakerId.value,
    type: 'phone',
    content: phoneForm.value.number,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  messageList.value.push(message)
  showPhoneDialog.value = false
  phoneForm.value.number = ''

  nextTick(() => {
    scrollToBottom()
  })
}

const handleSendAddress = () => {
  if (!addressForm.value.province || !addressForm.value.detail) {
    ElMessage.warning('请填写完整地址信息')
    return
  }

  const fullAddress = `${addressForm.value.province}${addressForm.value.city}${addressForm.value.detail}`

  const message = {
    id: Date.now(),
    senderId: currentMatchmakerId.value,
    type: 'address',
    content: fullAddress,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  messageList.value.push(message)
  showAddressDialog.value = false
  addressForm.value = { province: '', city: '', detail: '' }

  nextTick(() => {
    scrollToBottom()
  })
}

const handleVoiceCall = async () => {
  try {
    await ElMessageBox.confirm('确定要发起语音通话吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    showVoiceCallDialog.value = true
    startCallTimer('voice')
  } catch {
    // 用户取消
  }
}

const handleVideoCall = async () => {
  try {
    await ElMessageBox.confirm('确定要发起视频通话吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    showVideoCallDialog.value = true
    startCallTimer('video')
  } catch {
    // 用户取消
  }
}

const handleEndCall = () => {
  if (callTimer) {
    clearInterval(callTimer)
    callTimer = null
  }

  const duration = callDuration.value
  const callType = showVideoCallDialog.value ? 'video' : 'voice'

  const message = {
    id: Date.now(),
    senderId: currentMatchmakerId.value,
    type: callType === 'video' ? 'video-call' : 'voice-call',
    content: callType === 'video' ? '视频通话' : '语音通话',
    duration: duration,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  messageList.value.push(message)

  showVideoCallDialog.value = false
  showVoiceCallDialog.value = false
  callDuration.value = '00:00'

  nextTick(() => {
    scrollToBottom()
  })
}

const startCallTimer = (type) => {
  callDuration.value = '00:00'
  let seconds = 0

  callTimer = setInterval(() => {
    seconds++
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    callDuration.value = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onUnmounted(() => {
  if (callTimer) {
    clearInterval(callTimer)
  }
})
</script>

<style scoped>
.chat-communication {
  padding: 20px;
  height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 14px;
  color: #999;
}

/* 用户列表卡片 */
.user-list-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  margin-bottom: 16px;
}

.user-list {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.user-item:hover {
  background: #f5f5f5;
}

.user-item.active {
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
}

.user-item.active .user-name {
  color: #fff;
}

.user-avatar {
  position: relative;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-last-message {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 聊天卡片 */
.chat-card {
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-detail {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-status {
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 聊天记录 */
.chat-messages {
  height: calc(100% - 200px);
  overflow-y: auto;
  padding: 20px;
  background: #f9f9f9;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-left {
  flex-direction: row;
}

.message-right {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 60%;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #999;
}

.message-left .message-info {
  flex-direction: row;
}

.message-right .message-info {
  flex-direction: row-reverse;
}

.message-text {
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-break: break-word;
}

.message-right .message-text {
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
  color: #fff;
}

.message-image {
  background: #fff;
  padding: 8px;
  border-radius: 12px;
}

.message-phone,
.message-address,
.message-voice-call,
.message-video-call {
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-right .message-phone,
.message-right .message-address,
.message-right .message-voice-call,
.message-right .message-video-call {
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
  color: #fff;
}

.call-text {
  font-weight: 500;
}

.call-duration {
  font-size: 12px;
  opacity: 0.8;
}

/* 消息输入区域 */
.message-input-area {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
}

/* 通话对话框 */
.video-call-content,
.voice-call-content {
  text-align: center;
  padding: 40px 0;
}

.video-icon,
.voice-icon {
  font-size: 80px;
  color: #FF6B6B;
  margin-bottom: 20px;
}

.call-status {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.call-time {
  font-size: 24px;
  font-weight: bold;
  color: #FF6B6B;
  margin-bottom: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-communication {
    padding: 10px;
  }

  .message-content {
    max-width: 70%;
  }

  .header-actions {
    flex-direction: column;
  }

  .quick-actions {
    flex-wrap: wrap;
  }
}
</style>

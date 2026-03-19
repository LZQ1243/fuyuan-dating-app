<template>
  <div class="messages">
    <div class="page-header">
      <h2 class="page-title">消息管理</h2>
      <p class="page-desc">查看和管理用户聊天消息</p>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户昵称">
          <el-input
            v-model="searchForm.nickname"
            placeholder="请输入用户昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="文本" value="text" />
            <el-option label="图片" value="image" />
            <el-option label="语音" value="voice" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消息列表 -->
    <el-card class="table-card">
      <el-table :data="messageList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="发送者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.sender.avatar" />
              <div>
                <div class="user-name">{{ row.sender.name }}</div>
                <div class="user-id">ID: {{ row.sender.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="接收者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.receiver.avatar" />
              <div>
                <div class="user-name">{{ row.receiver.name }}</div>
                <div class="user-id">ID: {{ row.receiver.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getMessageTypeColor(row.type)">
              {{ getMessageTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="消息内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'read' ? 'success' : 'info'">
              {{ row.status === 'read' ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发送时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'unread'"
              type="success"
              link
              @click="handleMarkRead(row)"
            >
              标记已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="消息详情" width="600px">
      <el-descriptions :column="1" border v-if="currentMessage">
        <el-descriptions-item label="发送者">
          <div class="user-info">
            <el-avatar :size="40" :src="currentMessage.sender.avatar" />
            <span style="margin-left: 12px">{{ currentMessage.sender.name }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="接收者">
          <div class="user-info">
            <el-avatar :size="40" :src="currentMessage.receiver.avatar" />
            <span style="margin-left: 12px">{{ currentMessage.receiver.name }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <el-tag :type="getMessageTypeColor(currentMessage.type)">
            {{ getMessageTypeText(currentMessage.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="消息内容">
          <div class="message-content">{{ currentMessage.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ currentMessage.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentMessage.status === 'read' ? 'success' : 'info'">
            {{ currentMessage.status === 'read' ? '已读' : '未读' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const searchForm = reactive({
  nickname: '',
  type: '',
  dateRange: []
})

const messageList = ref([
  {
    id: 1,
    sender: {
      id: 1,
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    receiver: {
      id: 2,
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    type: 'text',
    content: '你好,很高兴认识你',
    status: 'read',
    createdAt: '2026-03-19 10:30:00'
  },
  {
    id: 2,
    sender: {
      id: 2,
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    receiver: {
      id: 1,
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    type: 'text',
    content: '我也很高兴认识你',
    status: 'read',
    createdAt: '2026-03-19 10:35:00'
  },
  {
    id: 3,
    sender: {
      id: 1,
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    receiver: {
      id: 2,
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    type: 'image',
    content: '[图片消息]',
    status: 'unread',
    createdAt: '2026-03-19 10:40:00'
  },
  {
    id: 4,
    sender: {
      id: 3,
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    },
    receiver: {
      id: 4,
      name: '赵六',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
    },
    type: 'voice',
    content: '[语音消息]',
    status: 'unread',
    createdAt: '2026-03-19 11:00:00'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4
})

const detailDialogVisible = ref(false)
const currentMessage = ref(null)

const getMessageTypeColor = (type) => {
  const colorMap = {
    text: '',
    image: 'success',
    voice: 'warning'
  }
  return colorMap[type] || 'info'
}

const getMessageTypeText = (type) => {
  const textMap = {
    text: '文本',
    image: '图片',
    voice: '语音'
  }
  return textMap[type] || type
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const handleReset = () => {
  searchForm.nickname = ''
  searchForm.type = ''
  searchForm.dateRange = []
  ElMessage.info('已重置搜索条件')
}

const handleView = (row) => {
  currentMessage.value = row
  detailDialogVisible.value = true
}

const handleMarkRead = (row) => {
  row.status = 'read'
  ElMessage.success('已标记为已读')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  ElMessage.info(`每页显示 ${val} 条`)
}

const handleCurrentChange = (val) => {
  pagination.current = val
  ElMessage.info(`当前第 ${val} 页`)
}
</script>

<style scoped>
.messages {
  padding: 0;
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

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.message-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  white-space: pre-wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

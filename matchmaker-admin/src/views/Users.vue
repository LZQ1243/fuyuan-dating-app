<template>
  <div class="users">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <p class="page-desc">管理和查看所有用户信息</p>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户昵称">
          <el-input
            v-model="searchForm.nickname"
            placeholder="请输入用户昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="残疾类型">
          <el-select v-model="searchForm.disabilityType" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="肢体残疾" value="肢体残疾" />
            <el-option label="听力残疾" value="听力残疾" />
            <el-option label="视力残疾" value="视力残疾" />
            <el-option label="言语残疾" value="言语残疾" />
            <el-option label="智力残疾" value="智力残疾" />
            <el-option label="精神残疾" value="精神残疾" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.verified" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="已认证" :value="true" />
            <el-option label="未认证" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'">{{ row.gender }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="disabilityType" label="残疾类型" width="100" />
        <el-table-column prop="disabilityLevel" label="残疾等级" width="100" />
        <el-table-column prop="verified" label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.verified ? 'success' : 'info'">
              {{ row.verified ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="handleMatch(row)">推荐</el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="头像">
          <el-avatar :size="80" :src="currentUser.avatar" />
        </el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentUser.age }}岁</el-descriptions-item>
        <el-descriptions-item label="残疾类型">{{ currentUser.disabilityType }}</el-descriptions-item>
        <el-descriptions-item label="残疾等级">{{ currentUser.disabilityLevel }}</el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag :type="currentUser.verified ? 'success' : 'info'">
            {{ currentUser.verified ? '已认证' : '未认证' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 推荐匹配对话框 -->
    <el-dialog v-model="matchDialogVisible" title="推荐匹配" width="800px">
      <div v-if="matchUsers.length > 0">
        <el-radio-group v-model="selectedMatchUser">
          <el-space direction="vertical" :size="16">
            <el-radio
              v-for="user in matchUsers"
              :key="user.id"
              :label="user.id"
              class="match-item"
            >
              <div class="match-content">
                <el-avatar :size="50" :src="user.avatar" />
                <div class="match-info">
                  <div class="match-name">{{ user.nickname }}</div>
                  <div class="match-detail">{{ user.gender }} | {{ user.age }}岁 | {{ user.disabilityType }}</div>
                </div>
                <el-tag type="success" size="small">匹配度: {{ user.matchRate }}%</el-tag>
              </div>
            </el-radio>
          </el-space>
        </el-radio-group>
      </div>
      <el-empty v-else description="暂无匹配推荐" />
      <template #footer>
        <el-button @click="matchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmMatch">确认推荐</el-button>
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
  disabilityType: '',
  verified: ''
})

const userList = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    nickname: '张三',
    gender: '男',
    age: 28,
    disabilityType: '肢体残疾',
    disabilityLevel: '四级',
    verified: true,
    createdAt: '2026-03-15 10:00:00'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    nickname: '李四',
    gender: '女',
    age: 26,
    disabilityType: '听力残疾',
    disabilityLevel: '三级',
    verified: true,
    createdAt: '2026-03-16 11:30:00'
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    nickname: '王五',
    gender: '男',
    age: 30,
    disabilityType: '视力残疾',
    disabilityLevel: '二级',
    verified: false,
    createdAt: '2026-03-17 09:15:00'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

const detailDialogVisible = ref(false)
const matchDialogVisible = ref(false)
const currentUser = ref(null)
const matchUsers = ref([])
const selectedMatchUser = ref(null)

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const handleReset = () => {
  searchForm.nickname = ''
  searchForm.disabilityType = ''
  searchForm.verified = ''
  ElMessage.info('已重置搜索条件')
}

const handleView = (row) => {
  currentUser.value = row
  detailDialogVisible.value = true
}

const handleMatch = (row) => {
  currentUser.value = row
  matchUsers.value = [
    {
      id: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      nickname: '赵六',
      gender: '女',
      age: 25,
      disabilityType: '肢体残疾',
      matchRate: 92
    },
    {
      id: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      nickname: '孙七',
      gender: '女',
      age: 27,
      disabilityType: '言语残疾',
      matchRate: 85
    }
  ]
  selectedMatchUser.value = null
  matchDialogVisible.value = true
}

const handleConfirmMatch = () => {
  if (!selectedMatchUser.value) {
    ElMessage.warning('请选择推荐对象')
    return
  }
  ElMessage.success('推荐成功')
  matchDialogVisible.value = false
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
.users {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.match-item {
  width: 100%;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.match-item:hover {
  border-color: #FF6B6B;
  background: #f9f9f9;
}

.match-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.match-info {
  flex: 1;
}

.match-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.match-detail {
  font-size: 14px;
  color: #999;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }
}
</style>

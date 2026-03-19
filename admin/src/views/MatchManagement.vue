<template>
  <div class="match-management-container">
    <div class="page-header">
      <h2 class="page-title">人工匹配</h2>
      <p class="page-desc">总管理后台人工匹配功能</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ matchStats.success }}</div>
            <div class="stat-label">匹配成功</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ matchStats.pending }}</div>
            <div class="stat-label">待确认</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon manual">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ matchStats.manual }}</div>
            <div class="stat-label">人工匹配</div>
          </div>
        </div>
      </el-col>
    </el-row>

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
        <el-form-item label="匹配状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="待确认" value="pending" />
            <el-option label="已成功" value="success" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreateMatch">人工匹配</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 匹配列表 -->
    <el-card class="table-card">
      <el-table :data="matchList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户A" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.userA.avatar" />
              <div>
                <div class="user-name">{{ row.userA.name }}</div>
                <div class="user-gender-age">{{ row.userA.gender }} | {{ row.userA.age }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户B" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.userB.avatar" />
              <div>
                <div class="user-name">{{ row.userB.name }}</div>
                <div class="user-gender-age">{{ row.userB.gender }} | {{ row.userB.age }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="matchRate" label="匹配度" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.matchRate"
              :color="getMatchRateColor(row.matchRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="matchType" label="匹配类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.matchType === 'manual' ? 'warning' : 'success'">
              {{ row.matchType === 'manual' ? '人工匹配' : '系统推荐' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="匹配时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleConfirm(row)"
            >
              确认
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              link
              @click="handleReject(row)"
            >
              拒绝
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

    <!-- 人工匹配对话框 -->
    <el-dialog v-model="matchDialogVisible" title="人工匹配" width="800px">
      <el-form :model="matchForm" :rules="matchRules" ref="matchFormRef" label-width="100px">
        <el-form-item label="选择用户A" prop="userA">
          <el-select
            v-model="matchForm.userA"
            placeholder="请选择用户A"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.name} (${user.gender}, ${user.age}岁)`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择用户B" prop="userB">
          <el-select
            v-model="matchForm.userB"
            placeholder="请选择用户B"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.name} (${user.gender}, ${user.age}岁)`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="匹配原因" prop="reason">
          <el-input
            v-model="matchForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入匹配原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="matchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMatchSubmit">确认匹配</el-button>
      </template>
    </el-dialog>

    <!-- 匹配详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="匹配详情" width="700px">
      <el-descriptions :column="2" border v-if="currentMatch">
        <el-descriptions-item label="匹配ID">{{ currentMatch.id }}</el-descriptions-item>
        <el-descriptions-item label="匹配时间">{{ currentMatch.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="匹配类型">
          <el-tag :type="currentMatch.matchType === 'manual' ? 'warning' : 'success'">
            {{ currentMatch.matchType === 'manual' ? '人工匹配' : '系统推荐' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="匹配度">{{ currentMatch.matchRate }}%</el-descriptions-item>
        <el-descriptions-item label="匹配状态">
          <el-tag :type="getStatusType(currentMatch.status)">
            {{ getStatusText(currentMatch.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentMatch.operator || '系统' }}</el-descriptions-item>
        <el-descriptions-item label="用户A">
          <div class="user-info">
            <el-avatar :size="50" :src="currentMatch.userA.avatar" />
            <div style="margin-left: 10px">
              <div class="user-name">{{ currentMatch.userA.name }}</div>
              <div class="user-detail">{{ currentMatch.userA.gender }} | {{ currentMatch.userA.age }}岁 | {{ currentMatch.userA.disabilityType }}</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="用户B">
          <div class="user-info">
            <el-avatar :size="50" :src="currentMatch.userB.avatar" />
            <div style="margin-left: 10px">
              <div class="user-name">{{ currentMatch.userB.name }}</div>
              <div class="user-detail">{{ currentMatch.userB.gender }} | {{ currentMatch.userB.age }}岁 | {{ currentMatch.userB.disabilityType }}</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="匹配原因" :span="2">{{ currentMatch.reason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2" v-if="currentMatch.reviewNote">{{ currentMatch.reviewNote }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SuccessFilled, Clock, Connection } from '@element-plus/icons-vue'

const loading = ref(false)
const searchForm = reactive({
  nickname: '',
  status: ''
})

const matchStats = ref({
  success: 245,
  pending: 18,
  manual: 56
})

const matchList = ref([
  {
    id: 1,
    userA: {
      name: '张三',
      gender: '男',
      age: 28,
      disabilityType: '肢体残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    userB: {
      name: '李四',
      gender: '女',
      age: 26,
      disabilityType: '听力残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    matchRate: 92,
    matchType: 'system',
    status: 'success',
    operator: '系统',
    createdAt: '2026-03-19 10:30:00'
  },
  {
    id: 2,
    userA: {
      name: '王五',
      gender: '男',
      age: 30,
      disabilityType: '视力残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    },
    userB: {
      name: '赵六',
      gender: '女',
      age: 25,
      disabilityType: '肢体残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
    },
    matchRate: 88,
    matchType: 'manual',
    status: 'pending',
    operator: '管理员A',
    reason: '性格互补,兴趣爱好相似',
    createdAt: '2026-03-19 11:45:00'
  },
  {
    id: 3,
    userA: {
      name: '孙七',
      gender: '男',
      age: 32,
      disabilityType: '言语残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
    },
    userB: {
      name: '周八',
      gender: '女',
      age: 28,
      disabilityType: '智力残疾',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6'
    },
    matchRate: 85,
    matchType: 'system',
    status: 'rejected',
    operator: '系统',
    createdAt: '2026-03-18 15:20:00',
    reviewNote: '用户反馈不合适'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

const matchDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentMatch = ref(null)
const matchFormRef = ref(null)

const matchForm = reactive({
  userA: null,
  userB: null,
  reason: ''
})

const matchRules = {
  userA: [
    { required: true, message: '请选择用户A', trigger: 'change' }
  ],
  userB: [
    { required: true, message: '请选择用户B', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入匹配原因', trigger: 'blur' }
  ]
}

const userOptions = ref([
  { id: 1, name: '张三', gender: '男', age: 28, disabilityType: '肢体残疾' },
  { id: 2, name: '李四', gender: '女', age: 26, disabilityType: '听力残疾' },
  { id: 3, name: '王五', gender: '男', age: 30, disabilityType: '视力残疾' },
  { id: 4, name: '赵六', gender: '女', age: 25, disabilityType: '肢体残疾' },
  { id: 5, name: '孙七', gender: '男', age: 32, disabilityType: '言语残疾' },
  { id: 6, name: '周八', gender: '女', age: 28, disabilityType: '智力残疾' }
])

const getMatchRateColor = (rate) => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 80) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status) => {
  const typeMap = {
    success: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    success: '匹配成功',
    pending: '待确认',
    rejected: '已拒绝'
  }
  return textMap[status] || status
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
  searchForm.status = ''
  ElMessage.info('已重置搜索条件')
}

const handleCreateMatch = () => {
  matchForm.userA = null
  matchForm.userB = null
  matchForm.reason = ''
  matchDialogVisible.value = true
}

const handleView = (row) => {
  currentMatch.value = row
  detailDialogVisible.value = true
}

const handleConfirm = (row) => {
  ElMessage.success('已确认匹配')
  row.status = 'success'
  row.operator = '当前用户'
}

const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝匹配', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })

    row.status = 'rejected'
    row.reviewNote = value
    row.operator = '当前用户'
    ElMessage.success('已拒绝匹配')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝匹配失败:', error)
    }
  }
}

const handleMatchSubmit = async () => {
  try {
    await matchFormRef.value.validate()
    if (matchForm.userA === matchForm.userB) {
      ElMessage.error('不能选择相同的用户')
      return
    }
    ElMessage.success('人工匹配成功')
    matchDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
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
.match-management-container {
  padding: 20px;
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

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  color: #fff;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #e6a23c 0%, #d99e26 100%);
  color: #fff;
}

.stat-icon.manual {
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

/* 表格卡片 */
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

.user-gender-age {
  font-size: 12px;
  color: #999;
}

.user-detail {
  font-size: 13px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

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

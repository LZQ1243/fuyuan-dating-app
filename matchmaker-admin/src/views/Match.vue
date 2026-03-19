<template>
  <div class="match">
    <div class="page-header">
      <h2 class="page-title">匹配管理</h2>
      <p class="page-desc">智能匹配推荐和人工干预</p>
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
          <div class="stat-icon rate">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ matchStats.rate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 匹配列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>匹配记录</span>
          <el-button type="primary" @click="handleCreateMatch">人工匹配</el-button>
        </div>
      </template>

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
              @click="handleCancel(row)"
            >
              取消
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
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="matchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMatchSubmit">确认匹配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, Clock, TrendCharts } from '@element-plus/icons-vue'

const loading = ref(false)
const matchDialogVisible = ref(false)
const matchFormRef = ref(null)

const matchStats = ref({
  success: 156,
  pending: 23,
  rate: 87
})

const matchList = ref([
  {
    id: 1,
    userA: {
      name: '张三',
      gender: '男',
      age: 28,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    userB: {
      name: '李四',
      gender: '女',
      age: 26,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    matchRate: 92,
    status: 'success',
    createdAt: '2026-03-19 10:30:00'
  },
  {
    id: 2,
    userA: {
      name: '王五',
      gender: '男',
      age: 30,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    },
    userB: {
      name: '赵六',
      gender: '女',
      age: 25,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
    },
    matchRate: 88,
    status: 'pending',
    createdAt: '2026-03-19 11:45:00'
  },
  {
    id: 3,
    userA: {
      name: '孙七',
      gender: '男',
      age: 32,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
    },
    userB: {
      name: '周八',
      gender: '女',
      age: 28,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6'
    },
    matchRate: 85,
    status: 'failed',
    createdAt: '2026-03-18 15:20:00'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

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
  { id: 1, name: '张三', gender: '男', age: 28 },
  { id: 2, name: '李四', gender: '女', age: 26 },
  { id: 3, name: '王五', gender: '男', age: 30 },
  { id: 4, name: '赵六', gender: '女', age: 25 },
  { id: 5, name: '孙七', gender: '男', age: 32 },
  { id: 6, name: '周八', gender: '女', age: 28 }
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
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    success: '匹配成功',
    pending: '待确认',
    failed: '已拒绝'
  }
  return textMap[status] || status
}

const handleCreateMatch = () => {
  matchForm.userA = null
  matchForm.userB = null
  matchForm.reason = ''
  matchDialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info(`查看匹配详情: ${row.userA.name} - ${row.userB.name}`)
}

const handleConfirm = (row) => {
  ElMessage.success('已确认匹配')
  row.status = 'success'
}

const handleCancel = (row) => {
  ElMessage.warning('已取消匹配')
  row.status = 'failed'
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
    console.error('验证失败:', error)
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
.match {
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

.stat-icon.rate {
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

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  .user-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

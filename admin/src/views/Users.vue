<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="手机号/昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="queryForm.certification_status" clearable>
            <el-option label="未认证" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="queryForm.is_banned" clearable>
            <el-option label="正常" :value="false" />
            <el-option label="已封禁" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? 'primary' : 'danger'">
              {{ row.gender === 1 ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="disability_type" label="残疾类型" width="100" />
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getCertStatusType(row.certification_status)">
              {{ getCertStatusText(row.certification_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_banned ? 'danger' : 'success'">
              {{ row.is_banned ? '已封禁' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="!row.is_banned"
              type="danger"
              size="small"
              @click="handleBan(row)"
            >
              封禁
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="handleUnban(row)"
            >
              解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="1" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.user_id }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender === 1 ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="残疾类型">{{ currentUser.disability_type }}</el-descriptions-item>
        <el-descriptions-item label="残疾等级">{{ currentUser.disability_level }}级</el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag :type="getCertStatusType(currentUser.certification_status)">
            {{ getCertStatusText(currentUser.certification_status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所在城市">
          {{ currentUser.location?.province }}{{ currentUser.location?.city }}{{ currentUser.location?.district }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.created_at }}</el-descriptions-item>
        <el-descriptions-item label="封禁原因">{{ currentUser.ban_reason || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 封禁弹窗 -->
    <el-dialog v-model="banDialogVisible" title="封禁用户" width="500px">
      <el-form :model="banForm" label-width="80px">
        <el-form-item label="封禁原因">
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入封禁原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBan">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, getUserDetail, banUser, unbanUser } from '@/api/admin'

const loading = ref(false)
const tableData = ref([])
const detailDialogVisible = ref(false)
const banDialogVisible = ref(false)
const currentUser = ref(null)
const banUserItem = ref(null)

const queryForm = ref({
  keyword: '',
  certification_status: '',
  is_banned: ''
})

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

const banForm = ref({
  reason: ''
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...queryForm.value
    })
    tableData.value = res.data.users
    pagination.value.total = res.data.pagination.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const handleReset = () => {
  queryForm.value = {
    keyword: '',
    certification_status: '',
    is_banned: ''
  }
  handleSearch()
}

const handleRefresh = () => {
  loadData()
}

const handleView = async (row) => {
  try {
    const res = await getUserDetail(row.user_id)
    currentUser.value = res.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}

const handleBan = (row) => {
  banUserItem.value = row
  banForm.value.reason = ''
  banDialogVisible.value = true
}

const confirmBan = async () => {
  if (!banForm.value.reason.trim()) {
    ElMessage.warning('请输入封禁原因')
    return
  }

  try {
    await banUser(banUserItem.value.user_id, { reason: banForm.value.reason })
    ElMessage.success('封禁成功')
    banDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('封禁失败:', error)
  }
}

const handleUnban = async (row) => {
  try {
    await ElMessageBox.confirm('确定要解封该用户吗？', '提示', {
      type: 'warning'
    })

    await unbanUser(row.user_id)
    ElMessage.success('解封成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解封失败:', error)
    }
  }
}

const getCertStatusText = (status) => {
  const map = { 0: '未认证', 1: '待审核', 2: '已通过', 3: '已拒绝' }
  return map[status] || '未知'
}

const getCertStatusType = (status) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

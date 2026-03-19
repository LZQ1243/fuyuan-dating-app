<template>
  <div class="certifications">
    <div class="page-header">
      <h2 class="page-title">认证审核</h2>
      <p class="page-desc">审核用户实名认证申请</p>
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
        <el-form-item label="认证状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 认证列表 -->
    <el-card class="table-card">
      <el-table :data="certificationList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="disabilityType" label="残疾类型" width="100" />
        <el-table-column prop="disabilityLevel" label="残疾等级" width="100" />
        <el-table-column label="认证图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.certImages && row.certImages[0]"
              :src="row.certImages[0]"
              :preview-src-list="row.certImages"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 8px; cursor: pointer"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleApprove(row)"
            >
              通过
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

    <!-- 认证详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="认证详情" width="700px">
      <el-descriptions :column="2" border v-if="currentCert">
        <el-descriptions-item label="头像">
          <el-avatar :size="80" :src="currentCert.avatar" />
        </el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentCert.nickname }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentCert.gender }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentCert.phone }}</el-descriptions-item>
        <el-descriptions-item label="残疾类型">{{ currentCert.disabilityType }}</el-descriptions-item>
        <el-descriptions-item label="残疾等级">{{ currentCert.disabilityLevel }}级</el-descriptions-item>
        <el-descriptions-item label="认证状态">
          <el-tag :type="getStatusType(currentCert.status)">
            {{ getStatusText(currentCert.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentCert.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="认证图片" :span="2">
          <div class="cert-images">
            <el-image
              v-for="(img, index) in currentCert.certImages"
              :key="index"
              :src="img"
              :preview-src-list="currentCert.certImages"
              fit="cover"
              style="width: 100px; height: 100px; border-radius: 8px; margin-right: 10px; cursor: pointer"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2" v-if="currentCert.reviewNote">
          {{ currentCert.reviewNote }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentCert?.status === 'pending'"
          type="success"
          @click="handleApprove(currentCert)"
        >
          通过
        </el-button>
        <el-button
          v-if="currentCert?.status === 'pending'"
          type="danger"
          @click="handleReject(currentCert)"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝认证" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const searchForm = reactive({
  nickname: '',
  status: ''
})

const certificationList = ref([
  {
    id: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    nickname: '张三',
    phone: '138****1234',
    gender: '男',
    disabilityType: '肢体残疾',
    disabilityLevel: '四级',
    certImages: [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150'
    ],
    status: 'pending',
    createdAt: '2026-03-19 10:00:00'
  },
  {
    id: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    nickname: '李四',
    phone: '139****5678',
    gender: '女',
    disabilityType: '听力残疾',
    disabilityLevel: '三级',
    certImages: [
      'https://via.placeholder.com/150'
    ],
    status: 'approved',
    createdAt: '2026-03-18 15:30:00',
    reviewNote: '认证材料齐全,审核通过'
  },
  {
    id: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    nickname: '王五',
    phone: '137****9012',
    gender: '男',
    disabilityType: '视力残疾',
    disabilityLevel: '二级',
    certImages: [
      'https://via.placeholder.com/150'
    ],
    status: 'rejected',
    createdAt: '2026-03-17 09:15:00',
    reviewNote: '认证材料不清晰,请重新提交'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentCert = ref(null)
const rejectForm = reactive({
  reason: ''
})

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
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

const handleView = (row) => {
  currentCert.value = row
  detailDialogVisible.value = true
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定要通过该用户的认证吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    ElMessage.success('认证已通过')
    row.status = 'approved'
    row.reviewNote = '认证通过'
    if (detailDialogVisible.value) {
      detailDialogVisible.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('通过认证失败:', error)
    }
  }
}

const handleReject = (row) => {
  currentCert.value = row
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    ElMessage.success('认证已拒绝')
    if (currentCert.value) {
      currentCert.value.status = 'rejected'
      currentCert.value.reviewNote = rejectForm.reason
    }
    rejectDialogVisible.value = false
    if (detailDialogVisible.value) {
      detailDialogVisible.value = false
    }
  } catch (error) {
    console.error('拒绝认证失败:', error)
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
.certifications {
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

.cert-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }

  .cert-images {
    :deep(.el-image) {
      width: 80px !important;
      height: 80px !important;
    }
  }
}
</style>

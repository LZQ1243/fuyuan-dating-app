<template>
  <div class="certifications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>认证审核</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

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
        <el-table-column prop="disability_level" label="残疾等级" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.disability_level }}级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="认证图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.certification_images && row.certification_images[0]"
              :src="getImageUrl(row.certification_images[0])"
              :preview-src-list="getPreviewUrls(row.certification_images)"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="提交时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝认证" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingCertifications, approveCertification, rejectCertification } from '@/api/admin'

const loading = ref(false)
const tableData = ref([])
const rejectDialogVisible = ref(false)
const rejectUser = ref(null)

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
})

const rejectForm = ref({
  reason: ''
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPendingCertifications({
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    tableData.value = res.data.users
    pagination.value.total = res.data.pagination.total
  } catch (error) {
    console.error('获取待审核认证失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadData()
}

const getImageUrl = (url) => {
  return url.startsWith('http') ? url : `http://localhost:3000${url}`
}

const getPreviewUrls = (urls) => {
  return urls.map(url => getImageUrl(url))
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定要通过该用户的认证吗？', '提示', {
      type: 'success'
    })

    await approveCertification(row.user_id)
    ElMessage.success('认证已通过')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('通过认证失败:', error)
    }
  }
}

const handleReject = (row) => {
  rejectUser.value = row
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    await rejectCertification(rejectUser.value.user_id, { reason: rejectForm.value.reason })
    ElMessage.success('认证已拒绝')
    rejectDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('拒绝认证失败:', error)
  }
}
</script>

<style scoped>
.certifications-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

<template>
  <el-container class="api-endpoints-container">
    <el-header>
      <div class="header-title">
        <el-icon><Connection /></el-icon>
        <span>API端点管理</span>
      </div>
      <div class="header-actions">
        <el-button @click="handleAdd" type="primary" :icon="Plus">新增API</el-button>
        <el-button @click="handleImport" :icon="Upload">导入API</el-button>
        <el-button @click="handleExport" :icon="Download">导出API</el-button>
        <el-button @click="loadData" :icon="Refresh">刷新</el-button>
      </div>
    </el-header>

    <el-main>
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-label">总数</div>
              <div class="stat-value">{{ stats.total || 0 }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-enabled">
            <div class="stat-content">
              <div class="stat-label">已启用</div>
              <div class="stat-value">{{ stats.enabled || 0 }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-disabled">
            <div class="stat-content">
              <div class="stat-label">已禁用</div>
              <div class="stat-value">{{ stats.disabled || 0 }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-tested">
            <div class="stat-content">
              <div class="stat-label">已测试</div>
              <div class="stat-value">{{ stats.testSuccess || 0 }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="模块">
          <el-select v-model="queryParams.module" placeholder="选择模块" clearable @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="认证模块" value="auth" />
            <el-option label="用户模块" value="user" />
            <el-option label="管理员模块" value="admin" />
            <el-option label="匹配模块" value="match" />
            <el-option label="聊天模块" value="chat" />
            <el-option label="动态模块" value="post" />
            <el-option label="配置中心" value="config" />
            <el-option label="上传模块" value="upload" />
            <el-option label="直播间" value="liveRooms" />
            <el-option label="注册流程" value="registration" />
            <el-option label="无障碍功能" value="accessibility" />
            <el-option label="敏感词管理" value="sensitiveWords" />
            <el-option label="短视频" value="shortVideo" />
          </el-select>
        </el-form-item>
        <el-form-item label="HTTP方法">
          <el-select v-model="queryParams.method" placeholder="选择方法" clearable @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.enabled" placeholder="选择状态" clearable @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="已启用" :value="true" />
            <el-option label="已禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.search"
            placeholder="搜索名称、描述或路径"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        class="api-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="接口名称" min-width="150" />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            {{ getModuleName(row.module) }}
          </template>
        </el-table-column>
        <el-table-column prop="requiresAuth" label="需认证" width="80">
          <template #default="{ row }">
            <el-tag :type="row.requiresAuth ? 'success' : 'info'" size="small">
              {{ row.requiresAuth ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requiresAdmin" label="需管理员" width="90">
          <template #default="{ row }">
            <el-tag :type="row.requiresAdmin ? 'warning' : 'info'" size="small">
              {{ row.requiresAdmin ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleToggle(row)"
              :active-text="'启用'"
              :inactive-text="'禁用'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="testResult.status" label="测试状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.testResult.status === 'success'" type="success" size="small">成功</el-tag>
            <el-tag v-else-if="row.testResult.status === 'failed'" type="danger" size="small">失败</el-tag>
            <el-tag v-else type="info" size="small">未测试</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastTestedAt" label="最后测试" width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastTestedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleTest(row)">测试</el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedRows.length > 0">
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button size="small" @click="handleBatchTest">批量测试</el-button>
        <el-button size="small" @click="handleBatchEnable">批量启用</el-button>
        <el-button size="small" @click="handleBatchDisable">批量禁用</el-button>
        <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-main>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="接口名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入接口名称" />
        </el-form-item>
        <el-form-item label="接口描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入接口描述" />
        </el-form-item>
        <el-form-item label="HTTP方法" prop="method">
          <el-select v-model="form.method" placeholder="选择HTTP方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="API路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入API路径,如: /api/users" />
        </el-form-item>
        <el-form-item label="所属模块" prop="module">
          <el-select v-model="form.module" placeholder="选择所属模块">
            <el-option label="认证模块" value="auth" />
            <el-option label="用户模块" value="user" />
            <el-option label="管理员模块" value="admin" />
            <el-option label="匹配模块" value="match" />
            <el-option label="聊天模块" value="chat" />
            <el-option label="动态模块" value="post" />
            <el-option label="配置中心" value="config" />
            <el-option label="上传模块" value="upload" />
            <el-option label="直播间" value="liveRooms" />
            <el-option label="注册流程" value="registration" />
            <el-option label="无障碍功能" value="accessibility" />
            <el-option label="敏感词管理" value="sensitiveWords" />
            <el-option label="短视频" value="shortVideo" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="是否需要认证">
          <el-switch v-model="form.requiresAuth" />
        </el-form-item>
        <el-form-item label="是否需要管理员">
          <el-switch v-model="form.requiresAdmin" />
        </el-form-item>
        <el-form-item label="测试端点">
          <el-input v-model="form.testEndpoint" placeholder="请输入测试端点地址(可选)" />
        </el-form-item>
        <el-form-item label="文档链接">
          <el-input v-model="form.documentation" placeholder="请输入文档链接(可选)" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="请输入标签">
            <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注信息(可选)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 测试结果对话框 -->
    <el-dialog v-model="testDialogVisible" title="API测试结果" width="600px">
      <div class="test-result">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="状态">
            <el-tag :type="testResult.status === 'success' ? 'success' : 'danger'">
              {{ testResult.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态码">
            {{ testResult.statusCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="响应时间">
            {{ testResult.responseTime ? `${testResult.responseTime}ms` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="错误信息" v-if="testResult.error">
            {{ testResult.error || testResult.errorMessage }}
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="testResult.data" class="test-data">
          <h4>响应数据</h4>
          <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 导入API对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入API端点" width="600px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".json"
        :limit="1"
      >
        <el-button :icon="Upload">选择JSON文件</el-button>
        <template #tip>
          <div class="el-upload__tip">支持从其他系统导出的API配置文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportConfirm" :loading="importing">导入</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Plus, Upload, Download, Refresh } from '@element-plus/icons-vue'
import {
  getAPIEndpoints,
  getAPIStats,
  createAPIEndpoint,
  updateAPIEndpoint,
  deleteAPIEndpoint,
  batchDeleteAPIEndpoints,
  batchToggleAPIEndpoints,
  testAPIEndpoint,
  batchTestAPIEndpoints,
  exportAPIEndpoints,
  importAPIEndpoints
} from '@/api/apiEndpoints'

// 数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const stats = ref({})
const dialogVisible = ref(false)
const dialogTitle = ref('新增API端点')
const testDialogVisible = ref(false)
const importDialogVisible = ref(false)
const submitting = ref(false)
const importing = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const uploadRef = ref(null)
const uploadFile = ref(null)
const formRef = ref(null)

// 查询参数
const queryParams = ref({
  module: '',
  method: '',
  enabled: '',
  search: '',
  page: 1,
  limit: 20
})

// 分页
const pagination = ref({
  total: 0,
  page: 1,
  limit: 20
})

// 表单数据
const form = ref({
  name: '',
  description: '',
  method: 'GET',
  path: '',
  module: '',
  category: '',
  requiresAuth: true,
  requiresAdmin: false,
  testEndpoint: '',
  documentation: '',
  tags: [],
  notes: ''
})

// 测试结果
const testResult = ref({
  status: '',
  statusCode: null,
  responseTime: null,
  error: null
})

// 常用标签
const commonTags = ['用户', '认证', '配置', '聊天', '匹配', '动态', '上传', '管理', '公开', '内部']

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入接口名称', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择HTTP方法', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入API路径', trigger: 'blur' }
  ],
  module: [
    { required: true, message: '请选择所属模块', trigger: 'change' }
  ]
}

// 获取方法类型
const getMethodType = (method) => {
  const typeMap = {
    'GET': '',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return typeMap[method] || ''
}

// 获取模块名称
const getModuleName = (module) => {
  const nameMap = {
    'auth': '认证',
    'user': '用户',
    'admin': '管理员',
    'match': '匹配',
    'chat': '聊天',
    'post': '动态',
    'config': '配置',
    'upload': '上传',
    'liveRooms': '直播间',
    'registration': '注册',
    'accessibility': '无障碍',
    'sensitiveWords': '敏感词',
    'shortVideo': '短视频'
  }
  return nameMap[module] || module
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getAPIEndpoints(queryParams.value)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.value.total = res.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载统计
const loadStats = async () => {
  try {
    const res = await getAPIStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增API端点'
  form.value = {
    name: '',
    description: '',
    method: 'GET',
    path: '',
    module: '',
    category: '',
    requiresAuth: true,
    requiresAdmin: false,
    testEndpoint: '',
    documentation: '',
    tags: [],
    notes: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑API端点'
  currentId.value = row._id
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除API端点"${row.name}"吗?`, '确认删除', {
      type: 'warning'
    })

    const res = await deleteAPIEndpoint(row._id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadData()
      await loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个API端点吗?`, '确认删除', {
      type: 'warning'
    })

    const ids = selectedRows.value.map(row => row._id)
    const res = await batchDeleteAPIEndpoints(ids)
    if (res.code === 200) {
      ElMessage.success(`成功删除 ${res.data.deletedCount} 个API端点`)
      await loadData()
      await loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量启用
const handleBatchEnable = async () => {
  const ids = selectedRows.value.map(row => row._id)
  const res = await batchToggleAPIEndpoints(ids, true)
  if (res.code === 200) {
    ElMessage.success(`成功启用 ${res.data.modifiedCount} 个API端点`)
    await loadData()
    await loadStats()
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  const ids = selectedRows.value.map(row => row._id)
  const res = await batchToggleAPIEndpoints(ids, false)
  if (res.code === 200) {
    ElMessage.success(`成功禁用 ${res.data.modifiedCount} 个API端点`)
    await loadData()
    await loadStats()
  }
}

// 批量测试
const handleBatchTest = async () => {
  const ids = selectedRows.value.map(row => row._id)
  const res = await batchTestAPIEndpoints(ids)
  if (res.code === 200) {
    ElMessage.success(`批量测试完成:成功 ${res.data.success}个,失败 ${res.data.failed}个`)
    await loadData()
    await loadStats()
  }
}

// 测试单个API
const handleTest = async (row) => {
  try {
    const res = await testAPIEndpoint(row._id)
    if (res.code === 200) {
      testResult.value = res.data
      testDialogVisible.value = true
      await loadData()
    }
  } catch (error) {
    ElMessage.error('测试失败')
  }
}

// 切换启用/禁用
const handleToggle = async (row) => {
  const res = await batchToggleAPIEndpoints([row._id], row.enabled)
  if (res.code === 200) {
    ElMessage.success(row.enabled ? '已启用' : '已禁用')
    await loadStats()
  }
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      let res
      if (isEdit.value) {
        res = await updateAPIEndpoint(currentId.value, form.value)
      } else {
        res = await createAPIEndpoint(form.value)
      }

      if (res.code === 200 || res.code === 201) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        await loadData()
        await loadStats()
      }
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 导出
const handleExport = async () => {
  try {
    const blob = await exportAPIEndpoints(queryParams.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-endpoints-${Date.now()}.json`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 文件变化
const handleFileChange = (file) => {
  uploadFile.value = file.raw
}

// 确认导入
const handleImportConfirm = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  importing.value = true
  try {
    const text = await uploadFile.value.text()
    const data = JSON.parse(text)

    const res = await importAPIEndpoints(data)
    if (res.code === 200) {
      ElMessage.success(`导入成功:创建${res.data.created}个,更新${res.data.updated}个`)
      importDialogVisible.value = false
      await loadData()
      await loadStats()
    }
  } catch (error) {
    ElMessage.error('导入失败,请检查文件格式')
  } finally {
    importing.value = false
  }
}

// 分页变化
const handleSizeChange = (size) => {
  queryParams.value.limit = size
  queryParams.value.page = 1
  loadData()
}

const handlePageChange = (page) => {
  queryParams.value.page = page
  loadData()
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style lang="scss" scoped>
.api-endpoints-container {
  height: 100vh;
  background: #f5f5f5;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: bold;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.el-main {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    text-align: center;

    .stat-content {
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #333;
      }
    }

    &.stat-enabled .stat-value {
      color: #67c23a;
    }

    &.stat-disabled .stat-value {
      color: #f56c6c;
    }

    &.stat-tested .stat-value {
      color: #409eff;
    }
  }
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 4px;
}

.api-table {
  margin-bottom: 20px;
}

.batch-actions {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.test-result {
  .test-data {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
    }

    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>

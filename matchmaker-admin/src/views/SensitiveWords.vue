<template>
  <div class="sensitive-words">
    <div class="page-header">
      <h2 class="page-title">敏感词管理</h2>
      <p class="page-desc">管理系统敏感词库</p>
    </div>

    <!-- 搜索和操作 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="敏感词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入敏感词"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="违禁词" value="banned" />
            <el-option label="广告词" value="ad" />
            <el-option label="脏话" value="profanity" />
            <el-option label="政治词" value="political" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd">添加敏感词</el-button>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        <el-button @click="handleImport">批量导入</el-button>
        <el-button @click="handleExport">批量导出</el-button>
      </div>
    </el-card>

    <!-- 敏感词列表 -->
    <el-card class="table-card">
      <el-table
        :data="wordList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="word" label="敏感词" width="200">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.word }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addedBy" label="添加人" width="120" />
        <el-table-column prop="createdAt" label="添加时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="wordDialogVisible"
      :title="dialogMode === 'add' ? '添加敏感词' : '编辑敏感词'"
      width="500px"
    >
      <el-form :model="wordForm" :rules="wordRules" ref="wordFormRef" label-width="80px">
        <el-form-item label="敏感词" prop="word">
          <el-input
            v-model="wordForm.word"
            placeholder="请输入敏感词"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="wordForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="违禁词" value="banned" />
            <el-option label="广告词" value="ad" />
            <el-option label="脏话" value="profanity" />
            <el-option label="政治词" value="political" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="wordForm.level" placeholder="请选择级别" style="width: 100%">
            <el-option label="一般" value="low" />
            <el-option label="严重" value="high" />
            <el-option label="紧急" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="wordForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="wordForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="wordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleWordSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入敏感词" width="600px">
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        每行一个敏感词,格式: 敏感词,分类,级别<br />
        示例: 违禁词,banned,high
      </el-alert>
      <el-input
        v-model="importContent"
        type="textarea"
        :rows="10"
        placeholder="请输入敏感词,每行一个"
      />
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const searchForm = reactive({
  keyword: '',
  category: ''
})

const wordList = ref([
  {
    id: 1,
    word: '刷单',
    category: 'ad',
    level: 'high',
    addedBy: '管理员',
    createdAt: '2026-03-19 10:00:00',
    status: 'active'
  },
  {
    id: 2,
    word: '加微信',
    category: 'ad',
    level: 'low',
    addedBy: '管理员',
    createdAt: '2026-03-18 15:30:00',
    status: 'active'
  },
  {
    id: 3,
    word: '免费领取',
    category: 'ad',
    level: 'high',
    addedBy: '管理员',
    createdAt: '2026-03-17 09:15:00',
    status: 'active'
  },
  {
    id: 4,
    word: '骗子',
    category: 'profanity',
    level: 'critical',
    addedBy: '管理员',
    createdAt: '2026-03-16 14:20:00',
    status: 'active'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4
})

const wordDialogVisible = ref(false)
const importDialogVisible = ref(false)
const dialogMode = ref('add')
const wordFormRef = ref(null)
const selectedWords = ref([])
const importContent = ref('')

const wordForm = reactive({
  id: null,
  word: '',
  category: 'banned',
  level: 'low',
  status: 'active',
  note: ''
})

const wordRules = {
  word: [
    { required: true, message: '请输入敏感词', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择级别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const getCategoryType = (category) => {
  const typeMap = {
    banned: 'danger',
    ad: 'warning',
    profanity: 'info',
    political: 'primary'
  }
  return typeMap[category] || 'info'
}

const getCategoryText = (category) => {
  const textMap = {
    banned: '违禁词',
    ad: '广告词',
    profanity: '脏话',
    political: '政治词'
  }
  return textMap[category] || category
}

const getLevelType = (level) => {
  const typeMap = {
    low: 'info',
    high: 'warning',
    critical: 'danger'
  }
  return typeMap[level] || 'info'
}

const getLevelText = (level) => {
  const textMap = {
    low: '一般',
    high: '严重',
    critical: '紧急'
  }
  return textMap[level] || level
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  ElMessage.info('已重置搜索条件')
}

const handleSelectionChange = (selection) => {
  selectedWords.value = selection
}

const handleAdd = () => {
  dialogMode.value = 'add'
  wordForm.id = null
  wordForm.word = ''
  wordForm.category = 'banned'
  wordForm.level = 'low'
  wordForm.status = 'active'
  wordForm.note = ''
  wordDialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  wordForm.id = row.id
  wordForm.word = row.word
  wordForm.category = row.category
  wordForm.level = row.level
  wordForm.status = row.status
  wordForm.note = row.note || ''
  wordDialogVisible.value = true
}

const handleWordSubmit = async () => {
  try {
    await wordFormRef.value.validate()

    if (dialogMode.value === 'add') {
      ElMessage.success('添加成功')
      wordList.value.unshift({
        ...wordForm,
        id: Date.now(),
        addedBy: '当前用户',
        createdAt: new Date().toLocaleString('zh-CN')
      })
    } else {
      ElMessage.success('编辑成功')
      const index = wordList.value.findIndex(item => item.id === wordForm.id)
      if (index !== -1) {
        wordList.value[index] = { ...wordForm }
      }
    }

    wordDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleToggleStatus = (row) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success(row.status === 'active' ? '已启用' : '已禁用')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该敏感词吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = wordList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      wordList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedWords.value.length === 0) {
    ElMessage.warning('请先选择要删除的敏感词')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedWords.value.length} 个敏感词吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const selectedIds = selectedWords.value.map(item => item.id)
    wordList.value = wordList.value.filter(item => !selectedIds.includes(item.id))
    ElMessage.success(`成功删除 ${selectedWords.value.length} 个敏感词`)
    selectedWords.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

const handleImport = () => {
  importContent.value = ''
  importDialogVisible.value = true
}

const handleImportSubmit = () => {
  if (!importContent.value.trim()) {
    ElMessage.warning('请输入敏感词内容')
    return
  }

  const lines = importContent.value.split('\n').filter(line => line.trim())
  let successCount = 0

  lines.forEach(line => {
    const parts = line.split(',')
    if (parts.length >= 1) {
      const word = parts[0].trim()
      if (word) {
        wordList.value.unshift({
          id: Date.now() + Math.random(),
          word: word,
          category: parts[1]?.trim() || 'banned',
          level: parts[2]?.trim() || 'low',
          addedBy: '导入',
          createdAt: new Date().toLocaleString('zh-CN'),
          status: 'active'
        })
        successCount++
      }
    }
  })

  ElMessage.success(`成功导入 ${successCount} 个敏感词`)
  importDialogVisible.value = false
}

const handleExport = () => {
  const content = wordList.value
    .map(item => `${item.word},${item.category},${item.level}`)
    .join('\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sensitive-words-${new Date().getTime()}.txt`
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
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
.sensitive-words {
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
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.table-card {
  margin-bottom: 20px;
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

  .action-bar {
    flex-wrap: wrap;
  }
}
</style>

<template>
  <div class="sensitive-words-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>敏感词管理</span>
          <el-button type="primary" @click="handleAdd">添加敏感词</el-button>
        </div>
      </template>

      <el-input
        v-model="searchKeyword"
        placeholder="搜索敏感词"
        clearable
        style="margin-bottom: 20px; width: 300px"
        @clear="loadData"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-table :data="filteredWords" v-loading="loading" border>
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="word" label="敏感词" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row.word)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredWords.length === 0 && !loading" class="empty">
        <el-empty description="暂无敏感词" />
      </div>
    </el-card>

    <!-- 添加弹窗 -->
    <el-dialog v-model="addDialogVisible" title="添加敏感词" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="敏感词" prop="word">
          <el-input
            v-model="addForm.word"
            placeholder="请输入敏感词"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd" :loading="addLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSensitiveWords, addSensitiveWord, deleteSensitiveWord } from '@/api/admin'

const loading = ref(false)
const addLoading = ref(false)
const allWords = ref([])
const searchKeyword = ref('')
const addDialogVisible = ref(false)
const addFormRef = ref(null)

const addForm = ref({
  word: ''
})

const addRules = {
  word: [
    { required: true, message: '请输入敏感词', trigger: 'blur' },
    { min: 1, max: 50, message: '敏感词长度为1-50个字符', trigger: 'blur' }
  ]
}

const filteredWords = computed(() => {
  if (!searchKeyword.value) {
    return allWords.value.map((word, index) => ({ word, index: index + 1 }))
  }
  return allWords.value
    .filter(word => word.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    .map((word, index) => ({ word, index: index + 1 }))
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSensitiveWords()
    allWords.value = res.data.words || []
  } catch (error) {
    console.error('获取敏感词列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  addForm.value.word = ''
  addDialogVisible.value = true
}

const confirmAdd = async () => {
  try {
    await addFormRef.value.validate()
    addLoading.value = true

    await addSensitiveWord({ word: addForm.value.word })
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      console.error('添加敏感词失败:', error)
    }
  } finally {
    addLoading.value = false
  }
}

const handleDelete = async (word) => {
  try {
    await ElMessageBox.confirm(`确定要删除敏感词"${word}"吗？`, '提示', {
      type: 'warning'
    })

    await deleteSensitiveWord(word)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除敏感词失败:', error)
    }
  }
}
</script>

<style scoped>
.sensitive-words-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty {
  padding: 60px 0;
}
</style>

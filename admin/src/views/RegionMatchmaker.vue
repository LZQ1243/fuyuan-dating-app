<template>
  <div class="region-matchmaker-container">
    <div class="page-header">
      <h2 class="page-title">地区红娘分配</h2>
      <p class="page-desc">按用户地区自动分配到对应红娘后台</p>
    </div>

    <!-- 功能开关 -->
    <el-card class="switch-card">
      <template #header>
        <div class="card-header">
          <span>功能开关</span>
        </div>
      </template>
      <el-form :model="switchConfig" label-width="180px">
        <el-form-item label="自动分配功能">
          <el-switch
            v-model="switchConfig.autoAssign"
            active-text="开启"
            inactive-text="关闭"
          />
          <el-text style="margin-left: 10px; color: #999">
            开启后新注册用户将自动分配到对应地区红娘
          </el-text>
        </el-form-item>
        <el-form-item label="地区优先分配">
          <el-switch
            v-model="switchConfig.regionPriority"
            active-text="开启"
            inactive-text="关闭"
          />
          <el-text style="margin-left: 10px; color: #999">
            开启后优先按地区分配,无对应地区则随机分配
          </el-text>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleSaveSwitches">保存开关</el-button>
    </el-card>

    <!-- 红娘地区管理 -->
    <el-card class="matchmaker-card">
      <template #header>
        <div class="card-header">
          <span>红娘地区管理</span>
          <el-button type="primary" @click="handleAddMatchmaker">添加红娘</el-button>
        </div>
      </template>

      <el-table :data="matchmakerList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="红娘名称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="regions" label="负责地区" width="200">
          <template #default="{ row }">
            <el-space wrap :size="8">
              <el-tag
                v-for="(region, index) in row.regions"
                :key="index"
                type="success"
              >
                {{ region }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.userCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户自动分配记录 -->
    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <span>自动分配记录</span>
          <div class="header-actions">
            <el-button @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户昵称">
          <el-input
            v-model="searchForm.nickname"
            placeholder="请输入用户昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="分配时间">
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

      <el-table :data="assignRecords" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user" label="用户信息" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.user.avatar" />
              <div>
                <div class="user-name">{{ row.user.name }}</div>
                <div class="user-region">{{ row.user.region }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="matchmaker" label="分配红娘" width="150">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.matchmaker.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignType" label="分配类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.assignType === 'auto' ? 'success' : 'warning'">
              {{ row.assignType === 'auto' ? '自动分配' : '手动分配' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignTime" label="分配时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleReassign(row)">重新分配</el-button>
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

    <!-- 添加/编辑红娘对话框 -->
    <el-dialog
      v-model="matchmakerDialogVisible"
      :title="dialogMode === 'add' ? '添加红娘' : '编辑红娘'"
      width="600px"
    >
      <el-form :model="matchmakerForm" :rules="matchmakerRules" ref="matchmakerFormRef" label-width="100px">
        <el-form-item label="红娘名称" prop="name">
          <el-input v-model="matchmakerForm.name" placeholder="请输入红娘名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="matchmakerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="负责地区" prop="regions">
          <el-select
            v-model="matchmakerForm.regions"
            multiple
            placeholder="请选择负责地区"
            style="width: 100%"
          >
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="天津市" value="天津市" />
            <el-option label="重庆市" value="重庆市" />
            <el-option label="广东省" value="广东省" />
            <el-option label="江苏省" value="江苏省" />
            <el-option label="浙江省" value="浙江省" />
            <el-option label="山东省" value="山东省" />
            <el-option label="河南省" value="河南省" />
            <el-option label="四川省" value="四川省" />
            <el-option label="湖北省" value="湖北省" />
            <el-option label="湖南省" value="湖南省" />
            <el-option label="河北省" value="河北省" />
            <el-option label="福建省" value="福建省" />
            <el-option label="陕西省" value="陕西省" />
            <el-option label="辽宁省" value="辽宁省" />
            <el-option label="黑龙江省" value="黑龙江省" />
            <el-option label="山西省" value="山西省" />
            <el-option label="吉林省" value="吉林省" />
            <el-option label="安徽省" value="安徽省" />
            <el-option label="江西省" value="江西省" />
            <el-option label="云南省" value="云南省" />
            <el-option label="贵州省" value="贵州省" />
            <el-option label="甘肃省" value="甘肃省" />
            <el-option label="青海省" value="青海省" />
            <el-option label="海南省" value="海南省" />
            <el-option label="内蒙古自治区" value="内蒙古自治区" />
            <el-option label="广西壮族自治区" value="广西壮族自治区" />
            <el-option label="西藏自治区" value="西藏自治区" />
            <el-option label="宁夏回族自治区" value="宁夏回族自治区" />
            <el-option label="新疆维吾尔自治区" value="新疆维吾尔自治区" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="matchmakerForm.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="matchmakerForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="matchmakerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMatchmakerSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重新分配对话框 -->
    <el-dialog v-model="reassignDialogVisible" title="重新分配用户" width="500px">
      <el-form :model="reassignForm" label-width="100px">
        <el-form-item label="用户信息">
          <div class="user-info">
            <el-avatar :size="50" :src="currentAssignUser?.user?.avatar" />
            <div style="margin-left: 12px">
              <div class="user-name">{{ currentAssignUser?.user?.name }}</div>
              <div class="user-region">地区: {{ currentAssignUser?.user?.region }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="当前红娘">
          <el-tag type="primary">{{ currentAssignUser?.matchmaker?.name }}</el-tag>
        </el-form-item>
        <el-form-item label="选择红娘">
          <el-select
            v-model="reassignForm.matchmakerId"
            placeholder="请选择红娘"
            style="width: 100%"
          >
            <el-option
              v-for="m in activeMatchmakers"
              :key="m.id"
              :label="`${m.name} (${m.regions.join('、')})`"
              :value="m.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分配原因">
          <el-input
            v-model="reassignForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入重新分配原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reassignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReassignSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)

// 功能开关
const switchConfig = reactive({
  autoAssign: true,
  regionPriority: true
})

// 红娘列表
const matchmakerList = ref([
  {
    id: 1,
    name: '红娘A',
    phone: '138****1234',
    regions: ['北京市', '天津市', '河北省'],
    userCount: 156,
    status: 'active',
    createdAt: '2026-03-15 10:00:00'
  },
  {
    id: 2,
    name: '红娘B',
    phone: '139****5678',
    regions: ['上海市', '江苏省', '浙江省'],
    userCount: 234,
    status: 'active',
    createdAt: '2026-03-16 11:30:00'
  },
  {
    id: 3,
    name: '红娘C',
    phone: '137****9012',
    regions: ['广东省', '福建省', '海南省'],
    userCount: 189,
    status: 'active',
    createdAt: '2026-03-17 09:15:00'
  },
  {
    id: 4,
    name: '红娘D',
    phone: '136****3456',
    regions: ['四川省', '云南省', '贵州省'],
    userCount: 178,
    status: 'disabled',
    createdAt: '2026-03-18 14:20:00'
  }
])

// 搜索表单
const searchForm = reactive({
  nickname: '',
  dateRange: []
})

// 分配记录
const assignRecords = ref([
  {
    id: 1,
    user: {
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      region: '北京市'
    },
    matchmaker: { name: '红娘A' },
    assignType: 'auto',
    assignTime: '2026-03-19 10:30:00'
  },
  {
    id: 2,
    user: {
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      region: '上海市'
    },
    matchmaker: { name: '红娘B' },
    assignType: 'auto',
    assignTime: '2026-03-19 11:45:00'
  },
  {
    id: 3,
    user: {
      name: '王五',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      region: '广东省'
    },
    matchmaker: { name: '红娘C' },
    assignType: 'manual',
    assignTime: '2026-03-18 15:20:00'
  }
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3
})

// 对话框
const matchmakerDialogVisible = ref(false)
const reassignDialogVisible = ref(false)
const dialogMode = ref('add')
const matchmakerFormRef = ref(null)

const currentAssignUser = ref(null)

// 红娘表单
const matchmakerForm = reactive({
  id: null,
  name: '',
  phone: '',
  regions: [],
  status: 'active',
  note: ''
})

const matchmakerRules = {
  name: [
    { required: true, message: '请输入红娘名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  regions: [
    { type: 'array', required: true, message: '请选择至少一个地区', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重新分配表单
const reassignForm = reactive({
  matchmakerId: null,
  reason: ''
})

// 可用的红娘
const activeMatchmakers = computed(() => {
  return matchmakerList.value.filter(m => m.status === 'active')
})

const handleSaveSwitches = () => {
  ElMessage.success('开关配置保存成功')
}

const handleAdd = () => {
  dialogMode.value = 'add'
  matchmakerForm.id = null
  matchmakerForm.name = ''
  matchmakerForm.phone = ''
  matchmakerForm.regions = []
  matchmakerForm.status = 'active'
  matchmakerForm.note = ''
  matchmakerDialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  matchmakerForm.id = row.id
  matchmakerForm.name = row.name
  matchmakerForm.phone = row.phone
  matchmakerForm.regions = [...row.regions]
  matchmakerForm.status = row.status
  matchmakerForm.note = row.note || ''
  matchmakerDialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info(`查看红娘详情: ${row.name}`)
}

const handleToggleStatus = (row) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success(row.status === 'active' ? '已启用' : '已禁用')
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该红娘吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = matchmakerList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      matchmakerList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleMatchmakerSubmit = async () => {
  try {
    await matchmakerFormRef.value.validate()

    if (dialogMode.value === 'add') {
      ElMessage.success('红娘添加成功')
      matchmakerList.value.unshift({
        ...matchmakerForm,
        id: Date.now(),
        userCount: 0,
        createdAt: new Date().toLocaleString('zh-CN')
      })
    } else {
      ElMessage.success('红娘编辑成功')
      const index = matchmakerList.value.findIndex(item => item.id === matchmakerForm.id)
      if (index !== -1) {
        matchmakerList.value[index] = { ...matchmakerForm, userCount: matchmakerList.value[index].userCount }
      }
    }

    matchmakerDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
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
  searchForm.dateRange = []
  ElMessage.info('已重置搜索条件')
}

const handleRefresh = () => {
  ElMessage.info('刷新成功')
}

const handleReassign = (row) => {
  currentAssignUser.value = row
  reassignForm.matchmakerId = null
  reassignForm.reason = ''
  reassignDialogVisible.value = true
}

const handleReassignSubmit = () => {
  if (!reassignForm.matchmakerId) {
    ElMessage.warning('请选择红娘')
    return
  }

  const matchmaker = activeMatchmakers.value.value.find(m => m.id === reassignForm.matchmakerId)
  if (currentAssignUser.value) {
    currentAssignUser.value.matchmaker = { name: matchmaker.name }
    currentAssignUser.value.assignType = 'manual'
    currentAssignUser.value.assignTime = new Date().toLocaleString('zh-CN')
  }

  ElMessage.success('重新分配成功')
  reassignDialogVisible.value = false
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
.region-matchmaker-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.switch-card {
  margin-bottom: 20px;
}

.matchmaker-card {
  margin-bottom: 20px;
}

.records-card {
  margin-bottom: 20px;
}

.search-form {
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

.user-region {
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
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-right: 0;
    }
  }
}
</style>

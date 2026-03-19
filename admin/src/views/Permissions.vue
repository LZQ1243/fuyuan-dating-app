<template>
  <div class="permissions-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="handleAdd">添加角色</el-button>
        </div>
      </template>

      <!-- 权限开关 -->
      <div class="permissions-switch">
        <el-alert
          title="功能开关"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-form :model="featureSwitches" label-width="200px">
          <el-form-item label="红娘认证审核权限">
            <el-switch
              v-model="featureSwitches.matchmakerCertification"
              active-text="开启"
              inactive-text="关闭"
            />
            <el-text style="margin-left: 10px; color: #999">
              开启后红娘可以审核用户认证
            </el-text>
          </el-form-item>
          <el-form-item label="红娘敏感词管理权限">
            <el-switch
              v-model="featureSwitches.matchmakerSensitiveWords"
              active-text="开启"
              inactive-text="关闭"
            />
            <el-text style="margin-left: 10px; color: #999">
              开启后红娘可以管理敏感词
            </el-text>
          </el-form-item>
          <el-form-item label="总后台人工匹配权限">
            <el-switch
              v-model="featureSwitches.adminManualMatch"
              active-text="开启"
              inactive-text="关闭"
            />
            <el-text style="margin-left: 10px; color: #999">
              开启后总后台可以进行人工匹配
            </el-text>
          </el-form-item>
          <el-form-item label="总后台消息监控权限">
            <el-switch
              v-model="featureSwitches.adminMessageMonitor"
              active-text="开启"
              inactive-text="关闭"
            />
            <el-text style="margin-left: 10px; color: #999">
              开启后总后台可以监控所有用户消息
            </el-text>
          </el-form-item>
          <el-form-item label="总后台标记已读权限">
            <el-switch
              v-model="featureSwitches.adminMarkAsRead"
              active-text="开启"
              inactive-text="关闭"
            />
            <el-text style="margin-left: 10px; color: #999">
              开启后总后台可以标记消息已读
            </el-text>
          </el-form-item>
        </el-form>

        <el-divider style="margin: 30px 0" />

        <el-form-item>
          <el-button type="primary" @click="handleSaveSwitches">
            保存开关配置
          </el-button>
        </el-form-item>
      </div>
    </el-card>

    <!-- 角色管理 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
        </div>
      </template>

      <el-table :data="roles" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="角色描述" width="250" />
        <el-table-column label="权限数量" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.permissions.length }}个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看权限</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看权限对话框 -->
    <el-dialog v-model="viewDialogVisible" title="角色权限" width="800px">
      <el-descriptions :column="2" border v-if="currentRole">
        <el-descriptions-item label="角色名称">{{ currentRole.name }}</el-descriptions-item>
        <el-descriptions-item label="角色描述">{{ currentRole.description }}</el-descriptions-item>
        <el-descriptions-item label="权限列表" :span="2">
          <el-space wrap :size="10">
            <el-tag
              v-for="(perm, index) in currentRole.permissions"
              :key="index"
              type="success"
            >
              {{ perm }}
            </el-tag>
          </el-space>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="dialogMode === 'add' ? '添加角色' : '编辑角色'"
      width="700px"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="权限配置" prop="permissions">
          <el-checkbox-group v-model="roleForm.permissions">
            <el-row :gutter="10">
              <el-col :span="8" v-for="(perm, index) in allPermissions" :key="index">
                <el-checkbox :label="perm.value">{{ perm.label }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)

// 功能开关
const featureSwitches = reactive({
  matchmakerCertification: true,
  matchmakerSensitiveWords: true,
  adminManualMatch: true,
  adminMessageMonitor: true,
  adminMarkAsRead: true
})

// 角色列表
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['用户管理', '认证审核', '敏感词管理', '人工匹配', '消息监控', '标记已读', '系统配置', '数据统计'],
    createdAt: '2026-03-15 10:00:00'
  },
  {
    id: 2,
    name: '红娘管理员',
    description: '负责用户匹配和消息管理',
    permissions: ['用户管理', '人工匹配', '消息监控', '标记已读'],
    createdAt: '2026-03-16 11:30:00'
  },
  {
    id: 3,
    name: '审核管理员',
    description: '负责认证审核和内容管理',
    permissions: ['认证审核', '敏感词管理', '用户管理'],
    createdAt: '2026-03-17 09:15:00'
  },
  {
    id: 4,
    name: '普通管理员',
    description: '基础管理权限',
    permissions: ['数据统计', '用户查看'],
    createdAt: '2026-03-18 14:20:00'
  }
])

// 所有权限列表
const allPermissions = [
  { label: '用户管理', value: '用户管理' },
  { label: '认证审核', value: '认证审核' },
  { label: '敏感词管理', value: '敏感词管理' },
  { label: '人工匹配', value: '人工匹配' },
  { label: '消息监控', value: '消息监控' },
  { label: '标记已读', value: '标记已读' },
  { label: '系统配置', value: '系统配置' },
  { label: '数据统计', value: '数据统计' },
  { label: '用户查看', value: '用户查看' }
]

const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const dialogMode = ref('add')
const currentRole = ref(null)
const roleFormRef = ref(null)

const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  permissions: []
})

const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ],
  permissions: [
    { type: 'array', required: true, message: '请选择至少一个权限', trigger: 'change' }
  ]
}

const handleSaveSwitches = () => {
  ElMessage.success('开关配置保存成功')
}

const handleView = (row) => {
  currentRole.value = row
  viewDialogVisible.value = true
}

const handleAdd = () => {
  dialogMode.value = 'add'
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissions = []
  editDialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  roleForm.id = row.id
  roleForm.name = row.name
  roleForm.description = row.description
  roleForm.permissions = [...row.permissions]
  editDialogVisible.value = true
}

const handleRoleSubmit = async () => {
  try {
    await roleFormRef.value.validate()

    if (dialogMode.value === 'add') {
      ElMessage.success('角色添加成功')
      roles.value.push({
        ...roleForm,
        id: Date.now(),
        createdAt: new Date().toLocaleString('zh-CN')
      })
    } else {
      ElMessage.success('角色编辑成功')
      const index = roles.value.findIndex(item => item.id === roleForm.id)
      if (index !== -1) {
        roles.value[index] = { ...roleForm }
      }
    }

    editDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = roles.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped>
.permissions-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permissions-switch {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}
</style>

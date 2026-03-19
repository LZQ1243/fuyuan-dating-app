<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside">
      <div class="logo">赴缘后台</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/certifications">
          <el-icon><Document /></el-icon>
          <span>认证审核</span>
        </el-menu-item>
        <el-menu-item index="/sensitive-words">
          <el-icon><Edit /></el-icon>
          <span>敏感词管理</span>
        </el-menu-item>
        <el-menu-item index="/permissions">
          <el-icon><Lock /></el-icon>
          <span>权限管理</span>
        </el-menu-item>
        <el-menu-item index="/match-management">
          <el-icon><Connection /></el-icon>
          <span>人工匹配</span>
        </el-menu-item>
        <el-menu-item index="/message-monitor">
          <el-icon><ChatDotRound /></el-icon>
          <span>消息监控</span>
        </el-menu-item>
        <el-menu-item index="/region-matchmaker">
          <el-icon><Location /></el-icon>
          <span>地区红娘分配</span>
        </el-menu-item>
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
        <el-menu-item index="/api-endpoints">
          <el-icon><Connection /></el-icon>
          <span>API管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left"></div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      userStore.logout()
      router.push('/login')
    } catch (error) {
      // 取消操作
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.menu {
  border-right: none;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.main {
  background: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
</style>

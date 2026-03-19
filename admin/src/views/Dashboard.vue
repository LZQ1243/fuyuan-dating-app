<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in userStats" :key="stat.key">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>残疾类型分布</span>
            </div>
          </template>
          <div ref="disabilityChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据统计</span>
            </div>
          </template>
          <div class="content-stats">
            <div class="content-stat-item">
              <span class="label">动态总数</span>
              <span class="value">{{ contentStats.posts }}</span>
            </div>
            <div class="content-stat-item">
              <span class="label">消息总数</span>
              <span class="value">{{ contentStats.messages }}</span>
            </div>
            <div class="content-stat-item">
              <span class="label">待审核认证</span>
              <span class="value warning">{{ contentStats.pending }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { getStatistics } from '@/api/admin'

const disabilityChartRef = ref(null)
const statistics = ref(null)

const contentStats = computed(() => ({
  posts: statistics.value?.content?.posts || 0,
  messages: statistics.value?.content?.messages || 0,
  pending: statistics.value?.certifications?.pending || 0
}))

const userStats = computed(() => [
  {
    key: 'total',
    label: '总用户数',
    value: statistics.value?.users?.total || 0,
    icon: 'User',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'active',
    label: '在线用户',
    value: statistics.value?.users?.active || 0,
    icon: 'Connection',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    key: 'certified',
    label: '已认证',
    value: statistics.value?.users?.certified || 0,
    icon: 'Select',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    key: 'banned',
    label: '已封禁',
    value: statistics.value?.users?.banned || 0,
    icon: 'CircleClose',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

onMounted(async () => {
  await loadStatistics()
  initChart()
})

const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const initChart = () => {
  if (!disabilityChartRef.value) return

  const chart = echarts.init(disabilityChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '残疾类型',
        type: 'pie',
        radius: '50%',
        data: statistics.value?.disability?.map(item => ({
          value: item.count,
          name: item._id || '未设置'
        })) || [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-row {
  margin-top: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.content-stats {
  padding: 20px 0;
}

.content-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.content-stat-item:last-child {
  border-bottom: none;
}

.content-stat-item .label {
  font-size: 14px;
  color: #666;
}

.content-stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.content-stat-item .value.warning {
  color: #e6a23c;
}
</style>

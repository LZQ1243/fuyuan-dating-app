<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">数据概览</h2>
      <p class="page-desc">欢迎回来,红娘管理员</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon user">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon match">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalMatches }}</div>
            <div class="stat-label">匹配成功</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon message">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalMessages }}</div>
            <div class="stat-label">消息总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon today">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayActive }}</div>
            <div class="stat-label">今日活跃</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <h3 class="chart-title">用户增长趋势</h3>
          <div ref="userGrowthChart" class="chart"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <h3 class="chart-title">匹配成功率</h3>
          <div ref="matchRateChart" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <div class="recent-activity">
      <h3 class="section-title">最新动态</h3>
      <el-table :data="recentActivities" style="width: 100%">
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'match' ? 'success' : row.type === 'message' ? 'primary' : 'info'">
              {{ row.type === 'match' ? '匹配成功' : row.type === 'message' ? '发送消息' : '注册用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { User, Connection, ChatDotRound, Calendar } from '@element-plus/icons-vue'

const stats = ref({
  totalUsers: 1256,
  totalMatches: 342,
  totalMessages: 8923,
  todayActive: 156
})

const recentActivities = ref([
  { type: 'match', content: '用户 张三 和 李四 匹配成功', time: '2026-03-19 14:30:00' },
  { type: 'message', content: '用户 王五 给 赵六 发送了消息', time: '2026-03-19 14:25:00' },
  { type: 'register', content: '新用户 孙七 注册成功', time: '2026-03-19 14:20:00' },
  { type: 'match', content: '用户 周八 和 吴九 匹配成功', time: '2026-03-19 14:15:00' },
  { type: 'message', content: '用户 郑十 给 王二 发送了消息', time: '2026-03-19 14:10:00' }
])

const userGrowthChart = ref(null)
const matchRateChart = ref(null)
let userChartInstance = null
let matchChartInstance = null

const initUserGrowthChart = () => {
  if (!userGrowthChart.value) return

  userChartInstance = echarts.init(userGrowthChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#FF6B6B'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0.05)' }
            ]
          }
        }
      }
    ]
  }

  userChartInstance.setOption(option)
}

const initMatchRateChart = () => {
  if (!matchRateChart.value) return

  matchChartInstance = echarts.init(matchRateChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '匹配成功率',
        type: 'bar',
        data: [65, 72, 68, 75, 80, 85, 82],
        itemStyle: {
          color: '#FF8E8C'
        }
      }
    ]
  }

  matchChartInstance.setOption(option)
}

const handleResize = () => {
  userChartInstance?.resize()
  matchChartInstance?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initUserGrowthChart()
    initMatchRateChart()
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  userChartInstance?.dispose()
  matchChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-header {
  margin-bottom: 30px;
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

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.match {
  background: linear-gradient(135deg, #FF8E8C 0%, #FF6B6B 100%);
  color: #fff;
}

.stat-icon.message {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  color: #fff;
}

.stat-icon.today {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 最新动态 */
.recent-activity {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart {
    height: 250px;
  }
}
</style>

import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 配置中心地址
const CONFIG_API_URL = '/api/config/public'

// 获取配置中心的API地址
const fetchConfig = async () => {
  try {
    const response = await axios.get(CONFIG_API_URL)
    if (response.data.code === 200 && response.data.data?.api?.baseUrl) {
      const baseUrl = response.data.data.api.baseUrl
      // 更新axios实例的baseURL
      request.defaults.baseURL = baseUrl + '/api'
      console.log('配置已更新:', request.defaults.baseURL)
    }
  } catch (error) {
    console.warn('获取配置失败，使用默认地址', error)
  }
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 初始化配置
fetchConfig()

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code === 200) {
      return res
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request

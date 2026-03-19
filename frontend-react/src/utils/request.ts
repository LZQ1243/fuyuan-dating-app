import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../store/auth';

// 配置中心地址
const CONFIG_API_URL = '/api/config/public';

// 获取配置中心的API地址
const fetchConfig = async () => {
  try {
    const response = await axios.get(CONFIG_API_URL);
    if (response.data.code === 200 && response.data.data?.api?.baseUrl) {
      const baseUrl = response.data.data.api.baseUrl;
      // 更新axios实例的baseURL
      request.defaults.baseURL = baseUrl + '/api';
      console.log('配置已更新:', request.defaults.baseURL);
    }
  } catch (error) {
    console.warn('获取配置失败，使用默认地址', error);
  }
};

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 初始化配置
fetchConfig();

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData?.state?.token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('解析token失败:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token过期，清除认证信息
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    // 统一错误处理
    const message = (error.response?.data as any)?.message || error.message || '请求失败';
    console.error('请求错误:', message);
    
    return Promise.reject(error);
  }
);

export default request;

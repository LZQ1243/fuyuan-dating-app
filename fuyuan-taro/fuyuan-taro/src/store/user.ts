import create from 'zustand/vanilla'
import Taro from '@tarojs/taro'
import { getUserInfo } from '@/services/user'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone: string
  age?: number
  gender?: 'male' | 'female'
  disabilityLevel?: number
  disabilityType?: string
  location?: {
    province: string
    city: string
  }
  verified?: boolean
  verificationStatus?: 'pending' | 'approved' | 'rejected'
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean
  isLoading: boolean

  // Actions
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  clearUser: () => void
  login: (token: string, userInfo: UserInfo) => void
  logout: () => void
  refreshUserInfo: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  userInfo: null,
  isLoggedIn: false,
  isLoading: false,

  // 设置Token
  setToken: (token) => {
    set({ token })
    // 持久化到本地
    Taro.setStorageSync('token', token)
  },

  // 设置用户信息
  setUserInfo: (userInfo) => {
    set({ userInfo, isLoggedIn: !!userInfo })
    Taro.setStorageSync('userInfo', userInfo)
  },

  // 设置加载状态
  setLoading: (isLoading) => {
    set({ isLoading })
  },

  // 登录
  login: (token, userInfo) => {
    set({
      token,
      userInfo,
      isLoggedIn: true
    })
    Taro.setStorageSync('token', token)
    Taro.setStorageSync('userInfo', userInfo)
  },

  // 登出
  logout: () => {
    set({
      token: null,
      userInfo: null,
      isLoggedIn: false
    })
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  },

  // 清除用户信息
  clearUser: () => {
    set({
      token: null,
      userInfo: null,
      isLoggedIn: false
    })
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  },

  // 刷新用户信息
  refreshUserInfo: async () => {
    const { token } = get()

    if (!token) {
      return
    }

    set({ isLoading: true })

    try {
      const res = await getUserInfo()
      if (res.data) {
        const userInfo = res.data
        set({
          userInfo,
          isLoggedIn: true
        })
        Taro.setStorageSync('userInfo', userInfo)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    } finally {
      set({ isLoading: false })
    }
  }
}))

// 初始化时从本地存储加载
const initStore = () => {
  try {
    const token = Taro.getStorageSync('token')
    const userInfo = Taro.getStorageSync('userInfo')

    if (token) {
      useUserStore.setState({
        token,
        isLoggedIn: true
      })
    }

    if (userInfo) {
      useUserStore.setState({
        userInfo,
        isLoggedIn: true
      })
    }
  } catch (error) {
    console.error('初始化用户状态失败:', error)
  }
}

// 初始化Store
initStore()

// 导出辅助函数
export const getIsLoggedIn = () => useUserStore.getState().isLoggedIn
export const getToken = () => useUserStore.getState().token
export const getUserInfo = () => useUserStore.getState().userInfo
export const getUserId = () => useUserStore.getState().userInfo?.id

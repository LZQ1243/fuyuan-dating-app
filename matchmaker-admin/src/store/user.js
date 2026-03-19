import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('matchmaker_token') || '')
  const userInfo = ref(null)

  const login = async (data) => {
    try {
      const res = await loginApi(data)
      token.value = res.data.token
      userInfo.value = res.data.user
      localStorage.setItem('matchmaker_token', token.value)
      return res
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('matchmaker_token')
  }

  return {
    token,
    userInfo,
    login,
    logout
  }
})

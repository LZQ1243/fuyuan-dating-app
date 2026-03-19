import request from './request'

/**
 * 用户登录
 */
export const login = (data: {
  phone: string
  password: string
}) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 微信登录
 */
export const wechatLogin = (data: {
  code: string
}) => {
  return request({
    url: '/auth/wechat-login',
    method: 'POST',
    data
  })
}

/**
 * 手机号登录（验证码）
 */
export const phoneLogin = (data: {
  phone: string
  code: string
}) => {
  return request({
    url: '/auth/phone-login',
    method: 'POST',
    data
  })
}

/**
 * 发送验证码
 */
export const sendCode = (data: {
  phone: string
  type?: 'login' | 'register' | 'reset'
}) => {
  return request({
    url: '/auth/send-code',
    method: 'POST',
    data
  })
}

/**
 * 验证验证码
 */
export const verifyCode = (data: {
  phone: string
  code: string
}) => {
  return request({
    url: '/auth/verify-code',
    method: 'POST',
    data
  })
}

/**
 * 用户注册
 */
export const register = (data: {
  phone: string
  password: string
  code?: string
}) => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'GET'
  })
}

/**
 * 获取用户详情
 */
export const getUserDetail = (userId: string) => {
  return request({
    url: `/user/${userId}`,
    method: 'GET'
  })
}

/**
 * 更新用户资料
 */
export const updateProfile = (data: any) => {
  return request({
    url: '/user/profile',
    method: 'PUT',
    data
  })
}

/**
 * 上传头像
 */
export const uploadAvatar = (filePath: string) => {
  const token = Taro.getStorageSync('token')
  return Taro.uploadFile({
    url: 'http://localhost:3000/api/user/avatar',
    filePath,
    name: 'avatar',
    header: {
      'Authorization': `Bearer ${token}`
    }
  }) as Promise<any>
}

/**
 * 提交实名认证
 */
export const submitVerification = (data: {
  realName: string
  idCard: string
  idCardFront: string
  idCardBack: string
  disabilityType?: string
  disabilityLevel?: string
  disabilityCertificate?: string
}) => {
  return request({
    url: '/user/verification',
    method: 'POST',
    data
  })
}

/**
 * 获取认证状态
 */
export const getVerificationStatus = () => {
  return request({
    url: '/user/verification/status',
    method: 'GET'
  })
}

/**
 * 退出登录
 */
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

/**
 * 修改密码
 */
export const changePassword = (data: {
  oldPassword: string
  newPassword: string
}) => {
  return request({
    url: '/user/change-password',
    method: 'PUT',
    data
  })
}

/**
 * 重置密码
 */
export const resetPassword = (data: {
  phone: string
  code: string
  newPassword: string
}) => {
  return request({
    url: '/user/reset-password',
    method: 'POST',
    data
  })
}

/**
 * 举报用户
 */
export const reportUser = (data: {
  userId: string
  reason: string
  description?: string
}) => {
  return request({
    url: '/user/report',
    method: 'POST',
    data
  })
}

/**
 * 拉黑用户
 */
export const blockUser = (userId: string) => {
  return request({
    url: '/user/block',
    method: 'POST',
    data: { userId }
  })
}

/**
 * 取消拉黑
 */
export const unblockUser = (userId: string) => {
  return request({
    url: '/user/unblock',
    method: 'POST',
    data: { userId }
  })
}

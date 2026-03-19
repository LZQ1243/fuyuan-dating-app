App({
  globalData: {
    userInfo: null,
    token: null,
    isLogin: false,
    baseUrl: 'https://api.fuyuan.com/api',
    wsUrl: 'wss://api.fuyuan.com'
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus()
    
    // 连接 WebSocket
    this.connectWebSocket()
  },

  onShow() {
    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.isLogin = true
    }
  },

  // 连接 WebSocket
  connectWebSocket() {
    const token = this.globalData.token
    if (!token) return

    wx.connectSocket({
      url: `${this.globalData.wsUrl}?token=${token}`,
      success: () => {
        console.log('WebSocket 连接成功')
      }
    })

    wx.onSocketMessage((res) => {
      console.log('收到 WebSocket 消息:', res.data)
      const data = JSON.parse(res.data)
      
      // 处理不同类型的消息
      switch (data.type) {
        case 'new_message':
          // 新消息通知
          wx.showToast({
            title: '收到新消息',
            icon: 'none'
          })
          break
        case 'new_match':
          // 新匹配通知
          wx.showToast({
            title: '有新的匹配',
            icon: 'none'
          })
          break
        case 'like_notification':
          // 点赞通知
          wx.showToast({
            title: '有人喜欢你',
            icon: 'none'
          })
          break
      }
    })

    wx.onSocketError(() => {
      console.log('WebSocket 连接错误')
    })

    wx.onSocketClose(() => {
      console.log('WebSocket 连接关闭')
      // 3秒后重连
      setTimeout(() => {
        this.connectWebSocket()
      }, 3000)
    })
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 设置 Token
  setToken(token) {
    this.globalData.token = token
    this.globalData.isLogin = true
    wx.setStorageSync('token', token)
  },

  // 清除登录信息
  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.isLogin = false
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  }
})

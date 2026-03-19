const app = getApp()
const request = require('../../utils/request')
const util = require('../../utils/util')

Page({
  data: {},

  onLoad() {
    // 检查登录状态
    if (app.globalData.isLogin) {
      wx.switchTab({
        url: '/pages/match/index'
      })
    }
  },

  // 微信一键登录
  handleWechatLogin(e) {
    const { userInfo } = e.detail

    if (!userInfo) {
      util.showError('请授权获取用户信息')
      return
    }

    util.showLoading('登录中...')

    // 获取微信登录 code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口
          request.post('/auth/wechat-login', {
            code: res.code,
            userInfo: userInfo
          }).then((data) => {
            util.hideLoading()
            
            // 保存登录信息
            app.setToken(data.token)
            app.setUserInfo(data.userInfo)

            util.showSuccess('登录成功', () => {
              wx.switchTab({
                url: '/pages/match/index'
              })
            })
          }).catch(() => {
            util.hideLoading()
          })
        } else {
          util.hideLoading()
          util.showError('登录失败')
        }
      },
      fail: () => {
        util.hideLoading()
        util.showError('获取登录信息失败')
      }
    })
  },

  // 手机号登录
  goToPhoneLogin() {
    wx.navigateTo({
      url: '/pages/login/phone'
    })
  }
})

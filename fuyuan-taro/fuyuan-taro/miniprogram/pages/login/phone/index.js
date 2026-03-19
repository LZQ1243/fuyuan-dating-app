const app = getApp()
const request = require('../../../utils/request')
const util = require('../../../utils/util')

Page({
  data: {
    phone: '',
    code: '',
    canSend: true,
    codeText: '获取验证码',
    countdown: 0
  },

  // 手机号输入
  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 验证码输入
  handleCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 发送验证码
  sendCode() {
    const { phone, canSend } = this.data

    if (!canSend) return

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      util.showError('请输入正确的手机号')
      return
    }

    util.showLoading('发送中...')

    request.post('/auth/send-code', { phone })
      .then(() => {
        util.hideLoading()
        util.showSuccess('验证码已发送')

        // 开始倒计时
        this.startCountdown()
      })
      .catch(() => {
        util.hideLoading()
      })
  },

  // 开始倒计时
  startCountdown() {
    let countdown = 60
    this.setData({
      canSend: false,
      codeText: `${countdown}s`,
      countdown
    })

    const timer = setInterval(() => {
      countdown--
      if (countdown <= 0) {
        clearInterval(timer)
        this.setData({
          canSend: true,
          codeText: '获取验证码',
          countdown: 0
        })
      } else {
        this.setData({
          codeText: `${countdown}s`,
          countdown
        })
      }
    }, 1000)
  },

  // 登录
  handleLogin() {
    const { phone, code } = this.data

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      util.showError('请输入正确的手机号')
      return
    }

    // 验证验证码
    if (!code || code.length !== 6) {
      util.showError('请输入6位验证码')
      return
    }

    util.showLoading('登录中...')

    request.post('/auth/phone-login', { phone, code })
      .then((data) => {
        util.hideLoading()

        // 保存登录信息
        app.setToken(data.token)
        app.setUserInfo(data.userInfo)

        util.showSuccess('登录成功', () => {
          wx.switchTab({
            url: '/pages/match/index'
          })
        })
      })
      .catch(() => {
        util.hideLoading()
      })
  },

  // 跳转注册
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/index'
    })
  },

  // 返回首页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})

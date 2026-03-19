// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 格式化相对时间
function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

// 防抖
function debounce(fn, delay = 500) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流
function throttle(fn, delay = 500) {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

// 深度拷贝
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const cloneObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloneObj[key] = deepClone(obj[key])
      }
    }
    return cloneObj
  }
}

// 获取年龄
function getAge(birthday) {
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// 获取星座
function getZodiac(birthday) {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const zodiacList = [
    { start: '01-01', end: '01-19', name: '摩羯座' },
    { start: '01-20', end: '02-18', name: '水瓶座' },
    { start: '02-19', end: '03-20', name: '双鱼座' },
    { start: '03-21', end: '04-19', name: '白羊座' },
    { start: '04-20', end: '05-20', name: '金牛座' },
    { start: '05-21', end: '06-21', name: '双子座' },
    { start: '06-22', end: '07-22', name: '巨蟹座' },
    { start: '07-23', end: '08-22', name: '狮子座' },
    { start: '08-23', end: '09-22', name: '处女座' },
    { start: '09-23', end: '10-23', name: '天秤座' },
    { start: '10-24', end: '11-22', name: '天蝎座' },
    { start: '11-23', end: '12-21', name: '射手座' },
    { start: '12-22', end: '12-31', name: '摩羯座' }
  ]

  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  for (const zodiac of zodiacList) {
    if (dateStr >= zodiac.start && dateStr <= zodiac.end) {
      return zodiac.name
    }
  }
  return '未知'
}

// 检查登录状态
function checkLogin() {
  const app = getApp()
  const token = wx.getStorageSync('token') || app.globalData.token
  if (!token) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    })
    wx.navigateTo({
      url: '/pages/login/index'
    })
    return false
  }
  return true
}

// 显示 loading
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

// 隐藏 loading
function hideLoading() {
  wx.hideLoading()
}

// 显示成功提示
function showSuccess(message, callback) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000,
    success: () => {
      if (callback) setTimeout(callback, 2000)
    }
  })
}

// 显示错误提示
function showError(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// 确认对话框
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 存储数据
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('存储数据失败:', e)
    return false
  }
}

// 获取数据
function getStorage(key) {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    console.error('获取数据失败:', e)
    return null
  }
}

// 删除数据
function removeStorage(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败:', e)
    return false
  }
}

module.exports = {
  formatTime,
  formatRelativeTime,
  debounce,
  throttle,
  deepClone,
  getAge,
  getZodiac,
  checkLogin,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  setStorage,
  getStorage,
  removeStorage
}

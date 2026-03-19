// 网络请求封装
const app = getApp()

// 请求拦截器
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync('token') || app.globalData.token

    // 合并请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 添加 token
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    // 完整的请求地址
    const url = options.url.startsWith('http') ? options.url : `${app.globalData.baseUrl}${options.url}`

    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            // 成功
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            // 未登录，跳转到登录页
            app.clearUserInfo()
            wx.redirectTo({
              url: '/pages/login/index'
            })
            reject(new Error(res.data.message || '请先登录'))
          } else {
            // 业务错误
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(res.data.message || '请求失败'))
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET 请求
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

// POST 请求
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

// PUT 请求
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

// DELETE 请求
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

// 上传文件
function upload(url, filePath, formData = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || app.globalData.token

    wx.uploadFile({
      url: url.startsWith('http') ? url : `${app.globalData.baseUrl}${url}`,
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data.data)
        } else {
          wx.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload
}

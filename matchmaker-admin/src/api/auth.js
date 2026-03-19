import request from './request'

export const login = (data) => {
  return request({
    url: '/matchmaker/login',
    method: 'POST',
    data
  })
}

export const logout = () => {
  return request({
    url: '/matchmaker/logout',
    method: 'POST'
  })
}

import request from '@/utils/request'

export const userApi = {
  // 获取用户列表
  getUsers() {
    return request.get('/users')
  },

  // 创建用户
  createUser(data) {
    return request.post('/users', data)
  },

  // 更新用户
  updateUser(id, data) {
    return request.put(`/users/${id}`, data)
  },

  // 删除用户
  deleteUser(id) {
    return request.delete(`/users/${id}`)
  },

  // 激活用户
  activateUser(id) {
    return request.put(`/users/${id}/activate`)
  },

  // 禁用用户
  deactivateUser(id) {
    return request.put(`/users/${id}/deactivate`)
  }
} 
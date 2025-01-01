import axios from 'axios'
import { ElMessage } from 'element-plus'

// 定义结果码枚举
export const ResultCodeEnum = {
  Success: 200,           // 成功
  BadRequest: 400,      // 请求错误
  NotFound: 404,        // 未找到
  Conflict: 409,        // 冲突
  ServerError: 500      // 服务器错误
}

const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    console.log(res)
    // 判断业务状态码
    if (res.code === ResultCodeEnum.Success) {
      return res.data
    } else {
      // 业务错误处理
      const errorMsg = res.message || '操作失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
  },
  error => {
    // HTTP 错误处理
    const message = error.response?.data?.message || '网络请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request 
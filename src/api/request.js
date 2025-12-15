import axios from 'axios'
import { Message } from 'element-ui'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://172.20.10.5:8080', // 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // console.log('发送请求:', config)
    
    // 如果有token，添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    // console.log('响应数据:', response)
    
    const { data, status } = response
    
    // 根据业务需求处理响应
    if (status === 200) {
      // 如果后端返回的数据结构是 { code, data, msg }
      if (data.code !== undefined) {
        if (data.code === 1) {
          return data.data||data
        } else {
          // 业务错误
          Message.error(data.msg || '请求失败')
          return Promise.reject(new Error(data.msg || '请求失败'))
        }
      }
      // 如果后端直接返回数据
      return data
    } else {
      Message.error('请求失败')
      return Promise.reject(new Error('请求失败'))
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    const { response } = error
    
    if (response) {
      // 服务器返回了错误状态码
      const { status, data } = response
      
      switch (status) {
        case 401:
          Message.error('未授权，请重新登录')
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          // 这里可以使用Vue Router跳转，但需要传入router实例
          // router.push('/login')
          break
        case 403:
          Message.error('拒绝访问')
          break
        case 404:
          Message.error('请求的资源不存在')
          break
        case 500:
          Message.error('服务器内部错误')
          break
        default:
          Message.error(data?.message || `请求失败，状态码: ${status}`)
      }
    } else {
      // 网络错误或其他错误
      if (error.code === 'ECONNABORTED') {
        Message.error('请求超时')
      } else {
        Message.error('网络错误，请检查网络连接')
      }
    }
    
    return Promise.reject(error)
  }
)

export default request

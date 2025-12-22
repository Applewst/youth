import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store' // 引入Vuex，获取用户身份

// 创建axios实例
const request = axios.create({
  baseURL: 'http://172.20.10.5:8080', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      // 从Vuex获取用户身份（role），动态设置请求头字段名
      const userRole = store.getters['user/userInfo'].role || '';
      let tokenHeaderKey = 'token'; // 默认管理员

      // 匹配不同身份的请求头字段
      switch (userRole.toLowerCase()) {
        case 'teacher':
          tokenHeaderKey = 'TeachAuthentication';
          break;
        case 'student':
          tokenHeaderKey = 'StuAuthentication';
          break;
        case 'emp':
        case 'admin':
          tokenHeaderKey = 'token';
          break;
        default:
          console.warn('未知用户身份，默认使用token字段');
      }

      // 动态设置请求头
      config.headers[tokenHeaderKey] = token;
      // console.log(`请求头字段：${tokenHeaderKey}，值：${token}`);
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器（保留原有逻辑，仅优化401提示）
request.interceptors.response.use(
  response => {
    const { data, status } = response
    if (status === 200) {
      if (data.code !== undefined) {
        if (data.code === 1) {
          return data.data||data
        } else {
          Message.error(data.msg || '请求失败')
          return Promise.reject(new Error(data.msg || '请求失败'))
        }
      }
      return data
    } else {
      Message.error('请求失败')
      return Promise.reject(new Error('请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    const { response } = error
    if (response) {
      const { status, data } = response
      switch (status) {
        case 401:
          Message.error('身份验证失败，请重新登录（可能是token过期/请求头字段不匹配）')
          // 仅token过期时清空，注释临时保留token排查
          // localStorage.removeItem('token')
          // router.push('/login')
          break
        case 403:
          Message.error('拒绝访问（权限不足）')
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
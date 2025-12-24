import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store' // 引入Vuex，获取用户身份
import router from '@/router' // 新增：引入路由，用于401跳转

// 修复1：兜底处理 Message 组件（防止引入失败）
const $message = Message || {
  error: (msg) => console.error('提示：', msg),
  success: (msg) => console.log('提示：', msg)
};

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
    console.log(token);
      
    if (token) {    
      const userInfo = store.getters['user/userInfo'] || {};
      const userRole = (userInfo.role || '').toLowerCase(); // 统一转小写，避免匹配失败
      let tokenHeaderKey = 'token'; // 默认管理员

      // 匹配不同身份的请求头字段
      switch (userRole) {
        case 'teacher':
          tokenHeaderKey = 'teachauthentication'
          // tokenHeaderKey = 'token';
          break;
        case 'student':
          tokenHeaderKey = 'stuauthentication';
          // tokenHeaderKey = 'token';
          break;
        case 'emp':
        case 'admin':
          tokenHeaderKey = 'token';
          break;
        default:
          console.warn(`未知用户身份：${userRole}，默认使用token字段`);
      }

      // 动态设置请求头
      config.headers[tokenHeaderKey] = token;
      console.log(`请求头字段：${tokenHeaderKey}，值：${token}`);
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    // 修复3：使用兜底的 $message 替代 Message
    $message.error('请求发送失败，请检查网络或参数');
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
          return data.data || data
        } else {
          // 修复4：统一使用 $message
          $message.error(data.msg || '请求失败')
          return Promise.reject(new Error(data.msg || '请求失败'))
        }
      }
      return data
    } else {
      $message.error('请求失败')
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
          $message.error('身份验证失败，请重新登录（可能是token过期/请求头字段不匹配）')
          // 仅token过期时清空，注释临时保留token排查
          // localStorage.removeItem('token')
          // 修复5：路由跳转兜底（防止 router 未引入）
          if (router) {
            // router.push('/login').catch(err => console.error('跳转登录页失败：', err));
          }
          break
        case 403:
          $message.error('拒绝访问（权限不足）')
          break
        case 404:
          $message.error('请求的资源不存在')
          break
        case 500:
          $message.error('服务器内部错误')
          break
        default:
          $message.error(data?.message || `请求失败，状态码: ${status}`)
      }
    } else {
      if (error.code === 'ECONNABORTED') {
        $message.error('请求超时')
      } else {
        $message.error('网络错误，请检查网络连接')
      }
    }
    return Promise.reject(error)
  }
)

export default request
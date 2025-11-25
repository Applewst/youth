import request from './request'

// 用户注册
export function registerUser(userData) {
  return request({
    url: '/user/register',
    method: 'post',
    data: userData
  })
}

// 用户登录
export function loginUser(loginData) {
  return request({
    url: '/admin/employee/login',
    method: 'post',
    data: loginData
  })
}

// 用户登出
export function logoutUser() {
  return request({
    url: '/admin/employee/logout',
    method: 'post'
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 刷新token
export function refreshToken() {
  return request({
    url: '/user/refresh',
    method: 'post'
  })
}

// ========== 管理员管理相关接口 ==========

// 获取管理员列表
export function getAdminList(params) {  
  // 暂时使用模拟数据，实际项目中应该发送真实API请求
  return new Promise((resolve) => {
    // 模拟API调用延迟
    setTimeout(() => {
      // 模拟管理员数据
      const mockData = [
        {
          id: 1,
          username: 'admin001',
          name: '张三',
          idNumber: '110101199001011234',
          phone: '13800138001',
          sex: '男',
          status: 1,
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          username: 'admin002',
          name: '李四',
          idNumber: '110101199002021234',
          phone: '13800138002',
          sex: '女',
          status: 1,
          createTime: '2024-01-16 14:20:00'
        },
        {
          id: 3,
          username: 'admin003',
          name: '王五',
          idNumber: '110101199003031234',
          phone: '13800138003',
          sex: '男',
          status: 0,
          createTime: '2024-01-17 09:15:00'
        },
        {
          id: 4,
          username: 'admin004',
          name: '赵六',
          idNumber: '110101199004041234',
          phone: '13800138004',
          sex: '女',
          status: 1,
          createTime: '2024-01-18 16:45:00'
        },
        {
          id: 5,
          username: 'admin005',
          name: '钱七',
          idNumber: '110101199005051234',
          phone: '13800138005',
          sex: '男',
          status: 0,
          createTime: '2024-01-19 11:30:00'
        },
        {
          id: 6,
          username: 'admin005',
          name: '钱七',
          idNumber: '110101199005051234',
          phone: '13800138005',
          sex: '男',
          status: 0,
          createTime: '2024-01-19 11:30:00'
        },
      ]
      
      // 模拟搜索过滤
      let filteredList = [...mockData]
      if (params && (params.username || params.name)) {
        const kw = params.username || params.name
        filteredList = filteredList.filter(item =>
          (item.username && item.username.includes(kw)) ||
          (item.name && item.name.includes(kw))
        )
      }
      if (params && params.status !== undefined && params.status !== '') {
        filteredList = filteredList.filter(item => item.status === parseInt(params.status))
      }
      
      // 模拟分页
      const page = (params && params.page) || 1
      const size = (params && (params.size || params.pageSize)) || 10
      const start = (page - 1) * size
      const end = start + size
      const records = filteredList.slice(start, end)
      
      resolve({
        records: records,
        total: filteredList.length,
        current: page,
        size: size
      })
    }, 500) // 模拟网络延迟
  })
  
  // 实际API调用代码（暂时注释）
  /*
  return request({
    url: '/admin/employee/page',
    method: 'get',
    params
  })
  */
}

// 添加管理员
// adminData 格式: { id: 0, idNumber: "", name: "", phone: "", sex: "", username: "" }
export function addAdmin(adminData) {
  return request({
    url: '/admin/employee',
    method: 'post',
    data: adminData
  })
}

// 修改管理员信息
export function updateAdmin(adminData) {
  return request({
    url: '/admin/employee',
    method: 'put',
    data: adminData
  })
}

// 删除管理员
export function deleteAdmin(id) {
  return request({
    url: `/admin/delete/${id}`,
    method: 'delete'
  })
}

// 修改管理员状态（启用/禁用）
export function updateAdminStatus(id, status) {
  return request({
    url: `/admin/employee/status/${status}`,
    method: 'post',
    params: { id }
  })
}

// 获取管理员详情
export function getAdminDetail(id) {
  return request({
    url: `/admin/employee/${id}`,
    method: 'get'
  })
}

// 提升为超级管理员
export function promoteToSuperAdmin(id) {
  return request({
    url: `/admin/employee/role/super`,
    method: 'post',
    params: { id }
  })
}
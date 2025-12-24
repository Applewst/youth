import request from '@/utils/request'
import { getFullApiPath } from '@/utils/requestPath';

// 用户注册
export function registerUser(userData) {
  return request({
    url: '/user/student/register',
    method: 'post',
    data: userData
  })
}

// 用户登录
export function adminLogin(loginData) {
  return request({
    url: '/admin/employee/login',
    method: 'post',
    data: loginData
  })
}

export function teacherLogin(loginData) {
  return request({
    url: '/teacher/teacher/login',
    method: 'post',
    data: loginData
  })
}

export function studentLogin(loginData) {
  return request({
    url: '/user/student/login',
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

// ========== 管理员管理相关接口 ==========

// 获取管理员列表
export function getAdminList(params) {  
  return request({
    url: getFullApiPath('/teacher/page'),
    method: 'get',
    params
  })
}

// 添加管理员
// adminData 格式: { id: 0, idNumber: "", name: "", phone: "", sex: "", username: "" }
export function addAdmin(adminData) {
  return request({
    url: getFullApiPath('/teacher'),
    method: 'post',
    data: adminData
  })
}

// 修改管理员信息
export function updateAdmin(adminData) {
  return request({
    url: getFullApiPath('/teacher'),
    method: 'put',
    data: adminData
  })
}

// 删除管理员
export function deleteAdmin(id) {
  return request({
    url: getFullApiPath(`/teacher/${id}`),
    method: 'delete'
  })
}

// 修改管理员状态（启用/禁用）
export function updateAdminStatus(id, status) {
  return request({
    url: getFullApiPath(`/teacher/status/${status}`),
    method: 'post',
    params: { id }
  })
}

// 获取管理员详情
export function getAdminDetail(id) {
  return request({
    url: getFullApiPath(`/teacher/${id}`),
    method: 'get'
  })
}

// 提升为超级管理员
export function promoteToSuperAdmin(id) {
  return request({
    url: getFullApiPath(`/employee/role/super`),
    method: 'post',
    params: { id }
  })
}
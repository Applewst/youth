import request from '@/utils/request';

// 更新学生信息（对应PUT /user/student）
export function updateStudentInfo(data) {
  return request({
    url: '/user/student',
    method: 'put',
    data
  });
}
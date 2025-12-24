import request from '@/utils/request'
import { getFullApiPath } from '@/utils/requestPath';

export function getStudentPage(params) {
  return request({
    url: getFullApiPath("/activity/stupage"),
    method: "get",
    params,
  })
}
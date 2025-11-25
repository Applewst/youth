import request from "./request"

/**
 * 文件上传接口
 * @param {File} file - 文件对象
 * @returns {Promise}
 */
export function uploadFile(file) {
  const formData = new FormData()
  formData.append("file", file)

  return request({
    url: "/admin/common/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}


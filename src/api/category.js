// ==================== 配置开关 ====================

/**
 * 是否使用模拟数据
 * true: 使用本地模拟数据
 * false: 使用真实API接口
 */
const USE_MOCK_DATA = true

// ==================== 导入依赖 ====================

import  request  from "./request"

// ==================== 模拟数据 ====================

/**
 * 模拟分类列表数据
 * 注意：type 字段表示不同的分类类型，每条数据可以有不同的type值（字符串类型）
 */
const mockCategoryList = [
  {
    id: 1,
    name: "周年庆典",
    type: "线上活动",
    sort: 1,
    status: 1,
    createTime: "2024-01-15 10:30:00",
    createUser: 1,
    updateTime: "2024-03-20 14:22:00",
    updateUser: 1,
  },
  {
    id: 2,
    name: "新品发布会",
    type: "线下活动",
    sort: 2,
    status: 1,
    createTime: "2024-01-15 10:35:00",
    createUser: 1,
    updateTime: "2024-03-18 09:15:00",
    updateUser: 1,
  },
  {
    id: 3,
    name: "粉丝见面会",
    type: "混合活动",
    sort: 3,
    status: 1,
    createTime: "2024-01-16 11:20:00",
    createUser: 1,
    updateTime: "2024-03-15 16:40:00",
    updateUser: 2,
  },
  {
    id: 4,
    name: "线上直播",
    type: "直播活动",
    sort: 4,
    status: 1,
    createTime: "2024-02-01 09:00:00",
    createUser: 1,
    updateTime: "2024-03-10 11:30:00",
    updateUser: 1,
  },
  {
    id: 5,
    name: "会员日活动",
    type: "促销活动",
    sort: 5,
    status: 0,
    createTime: "2024-02-10 14:20:00",
    createUser: 2,
    updateTime: "2024-03-22 16:45:00",
    updateUser: 2,
  },
  {
    id: 6,
    name: "教育培训",
    type: "培训活动",
    sort: 6,
    status: 1,
    createTime: "2024-02-15 10:00:00",
    createUser: 1,
    updateTime: "2024-03-25 14:20:00",
    updateUser: 1,
  },
  {
    id: 7,
    name: "抽奖活动",
    type: "互动活动",
    sort: 7,
    status: 1,
    createTime: "2024-03-01 08:30:00",
    createUser: 2,
    updateTime: "2024-03-28 09:15:00",
    updateUser: 2,
  },
]

// ==================== 辅助函数 ====================

/**
 * 模拟网络延迟
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== API 接口函数 ====================

/**
 * 获取分类列表（所有类型）
 *
 * @description GET /admin/category/list
 * @param {string} [type] - 可选的类型筛选参数（字符串）
 * @returns {Promise<{code: number, data: Array, msg: string}>}
 */
export async function getCategoryList(type) {
  if (USE_MOCK_DATA) {
    await delay(300)

    const filteredList = type ? mockCategoryList.filter((item) => item.type.includes(type)) : [...mockCategoryList]

    return {
      code: 0,
      data: filteredList,
      msg: "",
    }
  } else {
    return request({
      url: "/admin/category/list",
      method: "get",
      params: { type },
    })
  }
}

/**
 * 分页查询分类列表
 *
 * @description GET /admin/category/page
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 分类名称（模糊搜索）
 * @param {number} [params.page=1] - 当前页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @param {string} [params.type] - 分类类型（字符串模糊搜索）
 * @returns {Promise<{code: number, data: {records: Array, total: number}, msg: string}>}
 */
export async function getCategoryPage(params) {
  if (USE_MOCK_DATA) {
    await delay(300)

    let filteredList = [...mockCategoryList]

    // 按名称筛选（模糊搜索）
    if (params.name) {
      filteredList = filteredList.filter((item) => item.name.includes(params.name))
    }

    if (params.type) {
      filteredList = filteredList.filter((item) => item.type.includes(params.type))
    }

    // 分页处理
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const records = filteredList.slice(start, end)

    return {
      code: 0,
      data: {
        records,
        total: filteredList.length,
      },
      msg: "",
    }
  } else {
    return request({
      url: "/admin/category/page",
      method: "get",
      params,
    })
  }
}

/**
 * 新增分类
 *
 * @description POST /admin/category
 * @param {Object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {string} data.type - 分类类型（字符串）
 * @param {number} [data.sort=0] - 排序值
 * @param {number} [data.status=1] - 状态 (0: 禁用, 1: 启用)
 * @returns {Promise<{code: number, data: null, msg: string}>}
 */
export async function addCategory(data) {
  if (USE_MOCK_DATA) {
    await delay(300)

    const newId = Math.max(...mockCategoryList.map((item) => item.id)) + 1
    const now = new Date().toISOString().replace("T", " ").slice(0, 19)

    mockCategoryList.push({
      id: newId,
      name: data.name,
      type: data.type,
      sort: data.sort || 0,
      status: data.status !== undefined ? data.status : 1,
      createTime: now,
      createUser: 1,
      updateTime: now,
      updateUser: 1,
    })

    return {
      code: 0,
      data: null,
      msg: "新增成功",
    }
  } else {
    return request({
      url: "/admin/category",
      method: "post",
      data,
    })
  }
}

/**
 * 更新分类
 *
 * @description PUT /admin/category
 * @param {Object} data - 分类数据
 * @param {number} data.id - 分类ID（必传）
 * @param {string} data.name - 分类名称
 * @param {string} data.type - 分类类型（字符串）
 * @param {number} [data.sort] - 排序值
 * @param {number} [data.status] - 状态 (0: 禁用, 1: 启用)
 * @returns {Promise<{code: number, data: null, msg: string}>}
 */
export async function updateCategory(data) {
  if (USE_MOCK_DATA) {
    await delay(300)

    const index = mockCategoryList.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const now = new Date().toISOString().replace("T", " ").slice(0, 19)
      mockCategoryList[index] = {
        ...mockCategoryList[index],
        name: data.name,
        type: data.type,
        sort: data.sort !== undefined ? data.sort : mockCategoryList[index].sort,
        status: data.status !== undefined ? data.status : mockCategoryList[index].status,
        updateTime: now,
        updateUser: 1,
      }
    }

    return {
      code: 0,
      data: null,
      msg: "更新成功",
    }
  } else {
    return request({
      url: "/admin/category",
      method: "put",
      data,
    })
  }
}

/**
 * 删除分类
 *
 * @description DELETE /admin/category/{id}
 * @param {number} id - 分类ID
 * @returns {Promise<{code: number, data: null, msg: string}>}
 */
export async function deleteCategory(id) {
  if (USE_MOCK_DATA) {
    await delay(300)

    const index = mockCategoryList.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockCategoryList.splice(index, 1)
    }

    return {
      code: 0,
      data: null,
      msg: "删除成功",
    }
  } else {
    return request({
      url: "/admin/category",
      method: "delete",
      params: { id },
    })
  }
}

/**
 * 修改分类状态
 *
 * @description POST /admin/category/status/{id}
 * @param {number} id - 分类ID
 * @param {number} status - 状态值 (0: 禁用, 1: 启用)
 * @returns {Promise<{code: number, data: null, msg: string}>}
 */
export async function updateCategoryStatus(id, status) {
  if (USE_MOCK_DATA) {
    await delay(300)

    const index = mockCategoryList.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockCategoryList[index].status = status
      mockCategoryList[index].updateTime = new Date().toISOString().replace("T", " ").slice(0, 19)
    }

    return {
      code: 0,
      data: null,
      msg: status === 1 ? "启用成功" : "禁用成功",
    }
  } else {
    const { status: statusValue, id: idValue } = { status, id }
    return request({
      url: `/admin/category/status/${statusValue}`,
      method: "post",
      params: { id: idValue },
    })
  }
}

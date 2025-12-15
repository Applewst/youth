import request from "./request"

// 是否使用模拟数据（开发时设置为true，生产环境设置为false）
const USE_MOCK_DATA = true

// 模拟数据
const mockActivities = [
  {
    id: 1,
    name: "春季踏青活动",
    categoryId: 101,
    categoryName: "户外活动",
    description: "春暖花开，组织员工进行户外踏青活动，放松身心，增进团队凝聚力。",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400",
    status: 1,
    endTime: "2024-03-15 10:30:00",
    participants: [
      { activityId: 1, id: 1, name: "张三", score: "95", value: "优秀" },
      { activityId: 1, id: 2, name: "李四", score: "88", value: "良好" },
    ],
  },
  {
    id: 2,
    name: "技术分享会",
    categoryId: 102,
    categoryName: "学习培训",
    description: "邀请技术大牛分享最新的前端技术趋势和实践经验，提升团队技术水平。",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    status: 1,
    endTime: "2024-03-18 14:20:00",
    participants: [
      { activityId: 2, id: 3, name: "王五", score: "92", value: "优秀" },
      { activityId: 2, id: 4, name: "赵六", score: "85", value: "良好" },
      { activityId: 2, id: 5, name: "孙七", score: "90", value: "优秀" },
    ],
  },
  {
    id: 3,
    name: "员工生日会",
    categoryId: 103,
    categoryName: "团建活动",
    description: "为本月过生日的员工举办温馨的生日派对，营造温暖的企业文化氛围。",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
    status: 1,
    endTime: "2024-03-20 16:45:00",
    participants: [{ activityId: 3, id: 6, name: "周八", score: "100", value: "完美" }],
  },
  {
    id: 4,
    name: "年度运动会",
    categoryId: 101,
    categoryName: "户外活动",
    description: "举办公司年度运动会，包括篮球、羽毛球、接力赛等多个项目，增强员工体质。",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
    status: 0,
    endTime: "2024-03-10 09:15:00",
    participants: [],
  },
  {
    id: 5,
    name: "产品发布会",
    categoryId: 104,
    categoryName: "商务活动",
    description: "新产品线上发布会，邀请客户和媒体参加，展示公司最新研发成果。",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
    status: 1,
    endTime: "2024-03-22 11:00:00",
    participants: [
      { activityId: 5, id: 7, name: "吴九", score: "87", value: "良好" },
      { activityId: 5, id: 8, name: "郑十", score: "91", value: "优秀" },
    ],
  },
  {
    id: 6,
    name: "摄影大赛",
    categoryId: 105,
    categoryName: "文化活动",
    description: "举办员工摄影大赛，鼓励员工发现生活中的美，丰富业余文化生活。",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400",
    status: 1,
    endTime: "2024-03-25 13:30:00",
    participants: [{ activityId: 6, id: 9, name: "钱十一", score: "96", value: "优秀" }],
  },
  {
    id: 7,
    name: "公益志愿活动",
    categoryId: 106,
    categoryName: "公益活动",
    description: "组织员工参加社区公益活动，回馈社会，传递企业正能量。",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400",
    status: 0,
    endTime: "2024-03-08 08:00:00",
    participants: [],
  },
  {
    id: 8,
    name: "中秋晚会",
    categoryId: 103,
    categoryName: "团建活动",
    description: "中秋佳节团圆晚会，精彩节目表演，丰富奖品抽奖，共度美好时光。",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
    status: 1,
    endTime: "2024-03-12 19:00:00",
    participants: [
      { activityId: 8, id: 10, name: "孙十二", score: "89", value: "良好" },
      { activityId: 8, id: 11, name: "李十三", score: "93", value: "优秀" },
    ],
  },
  {
    id: 9,
    name: "编程马拉松",
    categoryId: 102,
    categoryName: "学习培训",
    description: "48小时编程马拉松，挑战极限，开发创新项目，激发团队创造力。",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    status: 1,
    endTime: "2024-03-28 10:00:00",
    participants: [{ activityId: 9, id: 12, name: "周十四", score: "98", value: "卓越" }],
  },
  {
    id: 10,
    name: "客户答谢会",
    categoryId: 104,
    categoryName: "商务活动",
    description: "感谢老客户的长期支持，举办高端答谢晚宴，维护客户关系。",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
    status: 0,
    endTime: "2024-03-05 18:30:00",
    participants: [],
  },
  {
    id: 11,
    name: "读书分享会",
    categoryId: 105,
    categoryName: "文化活动",
    description: "每月一次的读书分享会，分享阅读心得，营造学习型组织氛围。",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    status: 1,
    endTime: "2024-03-30 15:00:00",
    participants: [
      { activityId: 11, id: 13, name: "吴十五", score: "86", value: "良好" },
      { activityId: 11, id: 14, name: "郑十六", score: "91", value: "优秀" },
    ],
  },
  {
    id: 12,
    name: "夏日烧烤派对",
    categoryId: 103,
    categoryName: "团建活动",
    description: "夏日周末烧烤派对，户外烧烤、游戏互动，享受轻松愉快的团队时光。",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    status: 1,
    endTime: "2024-03-27 17:00:00",
    participants: [{ activityId: 12, id: 15, name: "王十七", score: "94", value: "优秀" }],
  },
]

// 模拟分页查询
function mockGetActivityPage(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockActivities]

      // 根据名称过滤
      if (params.name) {
        filteredData = filteredData.filter((item) => item.name.includes(params.name))
      }

      // 根据分类ID过滤
      if (params.categoryId) {
        filteredData = filteredData.filter((item) => item.categoryId === Number(params.categoryId))
      }

      // 根据状态过滤
      if (params.status !== "" && params.status !== null && params.status !== undefined) {
        filteredData = filteredData.filter((item) => item.status === Number(params.status))
      }

      const total = filteredData.length
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize

      resolve({
        code: 0,
        data: {
          records: filteredData.slice(start, end),
          total: total,
          size: pageSize,
          current: page,
          pages: Math.ceil(total / pageSize),
        },
        msg: "",
      })
    }, 300) // 模拟网络延迟
  })
}

// 模拟添加活动
function mockAddActivity(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newActivity = {
        ...data,
        id: mockActivities.length + 1,
        categoryName: "新分类",
        endTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        participants: [],
      }
      mockActivities.unshift(newActivity)
      resolve({
        code: 0,
        data: newActivity,
        msg: "添加成功",
      })
    }, 300)
  })
}

// 模拟更新活动
function mockUpdateActivity(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockActivities.findIndex((item) => item.id === data.id)
      if (index !== -1) {
        mockActivities[index] = {
          ...mockActivities[index],
          ...data,
          endTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        }
        resolve({
          code: 0,
          data: mockActivities[index],
          msg: "更新成功",
        })
      } else {
        resolve({
          code: 1,
          data: null,
          msg: "活动不存在",
        })
      }
    }, 300)
  })
}

// 模拟删除活动
function mockDeleteActivity(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockActivities.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockActivities.splice(index, 1)
        resolve({
          code: 0,
          data: null,
          msg: "删除成功",
        })
      } else {
        resolve({
          code: 1,
          data: null,
          msg: "活动不存在",
        })
      }
    }, 300)
  })
}

// 模拟根据ID查询
function mockGetActivityById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activity = mockActivities.find((item) => item.id === id)
      if (activity) {
        resolve({
          code: 0,
          data: activity,
          msg: "",
        })
      } else {
        resolve({
          code: 1,
          data: null,
          msg: "活动不存在",
        })
      }
    }, 300)
  })
}

// 模拟参与活动数据
const mockJoinActivity = (activityId, userId) => {
  return {
    code: 0,
    msg: "参与活动成功",
    data: {
      activityId,
      userId,
      joinTime: new Date().toISOString().replace("T", " ").slice(0, 19),
    },
  };
};

// 分页查询活动列表
export function getActivityPage(params) {
  if (USE_MOCK_DATA) {
    return mockGetActivityPage(params)
  }
  return request({
    url: "/admin/activity/page",
    method: "get",
    params,
  })
}

// 添加活动
export function addActivity(data) {
  if (USE_MOCK_DATA) {
    return mockAddActivity(data)
  }
  return request({
    url: "/admin/activity",
    method: "post",
    data,
  })
}

// 更新活动
export function updateActivity(data) {
  if (USE_MOCK_DATA) {
    return mockUpdateActivity(data)
  }
  return request({
    url: "/admin/activity",
    method: "put",
    data,
  })
}

// 删除活动
export function deleteActivity(id) {
  if (USE_MOCK_DATA) {
    return mockDeleteActivity(id)
  }
  return request({
    url: `/admin/activity/${id}`,
    method: "delete",
  })
}

// 根据ID查询活动详情
export function getActivityById(id) {
  if (USE_MOCK_DATA) {
    return mockGetActivityById(id)
  }
  return request({
    url: `/admin/activity/${id}`,
    method: "get",
  })
}

// 参与活动
export async function joinActivity(data) {
  if (USE_MOCK_DATA) {
    return mockJoinActivity(data.activityId, data.userId);
  } else {
    return request({
      url: "/activity/join",
      method: "post",
      data,
    });
  }
}
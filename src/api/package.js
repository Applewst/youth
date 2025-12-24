import request from '@/utils/request';
import { getFullApiPath } from '@/utils/requestPath';

const MOCK_ENABLE = false;

// 模拟基础数据列表
const mockList = [
  {
    id: 1,
    categoryId: 101,
    name: "新人专享套餐",
    categoryName: "新人福利",
    description: "新用户注册即可领取的专属套餐，包含50积分+优惠券",
    image: "https://example.com/img1.png",
    score: 50,
    status: 1, // 1-启用 0-禁用
    updateTime: "2025-12-01 10:20:30",
    createTime: "2025-11-30 09:10:20",
    packageActivities: [
      { id: 101, activityId: 1, packageId: 1 },
      { id: 102, activityId: 2, packageId: 1 }
    ]
  },
  {
    id: 2,
    categoryId: 102,
    name: "月度会员套餐",
    categoryName: "会员权益",
    description: "月度会员专享，每月可领取100积分+专属折扣",
    image: "https://example.com/img2.png",
    score: 100,
    status: 1,
    updateTime: "2025-12-05 14:15:22",
    createTime: "2025-12-01 10:00:00",
    packageActivities: [
      { id: 201, activityId: 1, packageId: 2 },
      { id: 202, activityId: 2, packageId: 2 }
    ]
  },
  {
    id: 3,
    categoryId: 102,
    name: "年度会员套餐",
    categoryName: "会员权益",
    description: "年度会员专享，每年可领取1000积分+全年折扣",
    image: "https://example.com/img3.png",
    score: 1000,
    status: 0,
    updateTime: "2025-12-10 09:08:15",
    createTime: "2025-12-02 11:20:30",
    packageActivities: [
      { id: 301, activityId: 1, packageId: 3 },
      { id: 302, activityId: 2, packageId: 3 }
    ]
  },
  {
    id: 4,
    categoryId: 103,
    name: "节日特惠套餐",
    categoryName: "限时活动",
    description: "圣诞节专属套餐，80积分+节日礼品",
    image: "https://example.com/img4.png",
    score: 80,
    status: 1,
    updateTime: "2025-12-15 16:30:45",
    createTime: "2025-12-10 14:00:00",
    packageActivities: [
      { id: 401, activityId: 1, packageId: 4 },
      { id: 402, activityId: 2, packageId: 4 }
    ]},
  {
    id: 5,
    categoryId: 103,
    name: "双旦狂欢套餐",
    categoryName: "限时活动",
    description: "元旦+圣诞双节套餐，150积分+双倍优惠券",
    image: "https://example.com/img5.png",
    score: 150,
    status: 0,
    updateTime: "2025-12-16 11:25:33",
    createTime: "2025-12-12 09:30:00",
    packageActivities: [
      { id: 501, activityId: 1, packageId: 5 },
      { id: 502, activityId: 2, packageId: 5 }
    ]
  }
];

// 模拟请求延迟（模拟真实接口响应）
const mockRequest = (fn, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn(params));
    }, 500); // 模拟500ms接口延迟
  });
};

// 模拟接口方法
const mockApi = {
  // 分页查询套餐（适配分类组件的records字段）
  getPackagePage: (params) => {
    const { page = 1, pageSize = 10, name = "", status = "" } = params;
    // 模拟筛选
    let filterList = [...mockList];
    if (name) filterList = filterList.filter(item => item.name.includes(name));
    if (status !== "") filterList = filterList.filter(item => item.status === Number(status));
    // 模拟分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageList = filterList.slice(start, end);

    // 兼容分类组件的返回格式（records + total）
    return {
      code: 0,
      msg: "success",
      data: { 
        records: pageList,  // 新增records字段，匹配分类组件逻辑
        list: pageList,     // 保留原list字段兼容
        total: filterList.length, 
        page, 
        pageSize 
      }
    };
  },

  // 新增：获取套餐详情（根据ID）
  getPackageDetail: (id) => {
    // 根据ID查找模拟数据    
    const detail = mockList.find(item => item.categoryId === Number(id));
    if (detail) {    
      return {
        code: 0,
        msg: "获取套餐详情成功",
        data: detail
      };
    } else {
      return {
        code: -1,
        msg: "套餐不存在",
        data: null
      };
    }
  },

  // 新增套餐
  addPackage: (data) => {
    const newId = Math.floor(Math.random() * 1000) + 10;
    const now = new Date().toLocaleString();
    // 初始化关联活动（如果没有传则默认空数组）
    const packageActivities = data.packageActivities || [];
    // 给关联活动补充packageId
    const activities = packageActivities.map(item => ({
      ...item,
      packageId: newId,
      id: Math.floor(Math.random() * 10000) + 1000 // 生成活动关联ID
    }));
    const newItem = { 
      id: newId, 
      ...data, 
      packageActivities: activities, // 补充关联活动
      updateTime: now,
      createTime: now,
      status: data.status || 1
    };
    mockList.unshift(newItem);
    return { code: 0, msg: "新增套餐成功", data: newItem };
  },

  // 修改套餐
  updatePackage: (data) => {
    const index = mockList.findIndex(item => item.id === data.id);
    if (index > -1) {
      // 处理关联活动（补充packageId）
      const packageActivities = (data.packageActivities || []).map(item => ({
        ...item,
        packageId: data.id
      }));
      mockList[index] = { 
        ...mockList[index], 
        ...data, 
        packageActivities: packageActivities, // 更新关联活动
        updateTime: new Date().toLocaleString() 
      };
    }
    return { code: 0, msg: "编辑套餐成功", data };
  },

  // 修改：适配批量删除（接收ID数组）
  deletePackage: (ids) => {
    // 如果是单个ID（兼容旧逻辑），转成数组
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    // 批量删除
    deleteIds.forEach(id => {
      const index = mockList.findIndex(item => item.id === Number(id));
      if (index > -1) mockList.splice(index, 1);
    });
    return { 
      code: 0, 
      msg: `成功删除${deleteIds.length}个套餐`, 
      data: { ids: deleteIds } 
    };
  },

  // 切换套餐状态（适配组件传参：id, status分开传）
  changePackageStatus: (id, status) => {
    const index = mockList.findIndex(item => item.id === id);
    if (index > -1) {
      mockList[index].status = status;
      mockList[index].updateTime = new Date().toLocaleString();
    }
    return { 
      code: 0, 
      msg: `已${status === 1 ? '启用' : '禁用'}套餐`, 
      data: { id, status } 
    };
  }
};

// ===================== 真实接口逻辑（占位） =====================
const realApi = {
  // 分页查询套餐
  getPackagePage: (params) => {
    return request({
      url: getFullApiPath('/package/page'),
      method: 'GET',
      params,
    });
  },

  // 新增：真实接口-获取套餐详情
  getPackageDetail: (id) => {
    return request({
      url: getFullApiPath(`/package/${id}`), // 详情接口路径
      method: 'GET',
    });
  },

  // 新增套餐
  addPackage: (data) => {
    return request({ url: getFullApiPath('/package/save'), method: 'POST', data });
  },

  // 修改套餐
  updatePackage: (data) => {
    return request({ url: getFullApiPath('/package'), method: 'PUT', data });
  },

  // 删除套餐（批量）
  deletePackage: (ids) => {
    return request({ url: getFullApiPath('/package'), method: 'DELETE' , params: { ids }});
  },

  // 切换套餐状态
  changePackageStatus: (id, status) => {
    return request({ url: getFullApiPath(`/package/status/${status}`), method: 'POST', data: { id, status } });
  }
};

// ===================== 对外暴露命名导出（核心修改） =====================
// 分页查询套餐
export function getPackagePage(params) {
  if (MOCK_ENABLE) return mockRequest(mockApi.getPackagePage, params);
  return realApi.getPackagePage(params);
}

// 新增：导出获取套餐详情接口
export function getPackageDetail(id) {
  if (MOCK_ENABLE) return mockRequest(mockApi.getPackageDetail, id);
  return realApi.getPackageDetail(id);
}

// 新增套餐
export function addPackage(data) {
  if (MOCK_ENABLE) return mockRequest(mockApi.addPackage, data);
  return realApi.addPackage(data);
}

// 修改套餐
export function updatePackage(data) {
  if (MOCK_ENABLE) return mockRequest(mockApi.updatePackage, data);
  return realApi.updatePackage(data);
}

// 删除套餐
export function deletePackage(ids) {
  if (MOCK_ENABLE) return mockRequest(mockApi.deletePackage, ids);
  return realApi.deletePackage(ids);
}

// 切换套餐状态
export function changePackageStatus(id, status) {
  if (MOCK_ENABLE) {
    // 修复：mockRequest只接收两个参数，调整传参方式
    return mockRequest(() => mockApi.changePackageStatus(id, status), null);
  }
  return realApi.changePackageStatus(id, status);
}

//根据分类id查询套餐
export function getCategoryPackage(categoryId) {
  return request({
    url: getFullApiPath('/package/list'),
    method: 'GET',
    params: { categoryId }
  });
}




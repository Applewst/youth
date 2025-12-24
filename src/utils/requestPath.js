import store from '@/store';

/**
 * 拼接完整请求路径（身份前缀 + 接口路径）
 * @param {string} apiPath 接口相对路径（比如 '/activity/page'）
 * @returns {string} 完整路径（比如 '/student/activity/page'）
 */
export const getFullApiPath = (apiPath) => {
  // 从Vuex获取路径前缀（比如 '/student'）
  const pathPrefix = store.getters['user/pathPrefix']; // 注意namespaced: true，需加模块名
  // 处理接口路径开头的/，避免重复（比如 apiPath是'/activity' → 拼接后/student/activity）
  const normalizedApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  // 拼接完整路径
  return `${pathPrefix}${normalizedApiPath}`;
};
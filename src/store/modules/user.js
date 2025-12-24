import { 
  logoutUser,
  adminLogin,
  teacherLogin,
  studentLogin
} from '@/api/auth'
import wsClient from '@/utils/websocket';
import router from '@/router/index.js';
import {updateStudentInfo} from '@/api/user.js';

// 辅助函数1：从JWT解析身份+ID（仅用于WS路径，不再解析name）
const parseJwtForWsPath = (jwtPayload) => {
  if (!jwtPayload) return null;

  const idFields = Object.keys(jwtPayload).filter(key => key.endsWith('Id'));
  if (idFields.length === 0) {
    console.error('JWT中无xxxId字段', jwtPayload);
    return null;
  }

  const identity = idFields[0].replace('Id', '');
  const validIdentities = ['emp', 'student', 'teacher'];
  if (!validIdentities.includes(identity)) {
    console.error('不支持的身份:', identity);
    return null;
  }

  const userId = jwtPayload[idFields[0]];
  if (!userId || isNaN(Number(userId))) {
    console.error(`JWT中${idFields[0]}不是有效数字`, jwtPayload);
    return null;
  }

  return { identity, id: Number(userId) };
};

const state = {
  token: localStorage.getItem('token') || '',
  // 从localStorage恢复用户信息（不再依赖JWT）
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || { id: null, name: '', userName: '', role: 'emp' },
  isLoggedIn: !!localStorage.getItem('token'),
  wsConnected: false,
  jwtPayload: null,
  wsMessages: []
};

const getters = {
  isLoggedIn: state => !!state.token && state.isLoggedIn,
  userInfo: state => state.userInfo,
  token: state => state.token,
  wsConnected: state => state.wsConnected,
  jwtPayload: state => state.jwtPayload,
  wsPathInfo: state => parseJwtForWsPath(state.jwtPayload),
  isStudent: state => state.userInfo.role === 'student',
  isTeacher: state => state.userInfo.role === 'teacher',
  isEmp: state => state.userInfo.role === 'emp',
  wsMessages: state => state.wsMessages,
  pathPrefix: state => {
    const role = state.userInfo.role?.toLowerCase() || 'emp';
    // 身份→路径前缀映射（可根据后端实际路径调整）
    const prefixMap = {
      student: '/user',
      teacher: '/teacher',
      emp: '/admin',    // 员工/管理员统一用/admin前缀
    };
    // 兜底：默认返回/admin
    return prefixMap[role] || '/admin';
  }
};

const mutations = {
  ADD_WS_MESSAGE(state, message) {
    if (!state.wsMessages) state.wsMessages = [];
    state.wsMessages.push(message);
    if (state.wsMessages.length > 100) {
      state.wsMessages.shift();
    }
  },

  // 登录时存储token + 用户信息到localStorage
  SET_LOGIN_INFO(state, { token, userInfo }) {
    state.token = token;
    state.userInfo = userInfo;
    state.isLoggedIn = true;
    // 把用户信息存到localStorage（刷新后恢复）
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (e) {
      console.error('localStorage存储失败:', e);
    }
    // 仅解析JWT用于WS路径（不再解析name）
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const decoded = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      state.jwtPayload = JSON.parse(decoded);
    } catch (e) {
      state.jwtPayload = null;
      console.error('JWT解析失败（仅影响WS）:', e);
    }
  },

  CLEAR_USER_DATA(state) {
    state.token = '';
    state.userInfo = { id: null, name: '', userName: '', role: null };
    state.isLoggedIn = false;
    state.wsConnected = false;
    state.jwtPayload = null;
    state.wsMessages = [];
    // 清空localStorage
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    } catch (e) {
      console.error('localStorage移除失败:', e);
    }
  },

  SET_WS_CONNECTED(state, status) {
    state.wsConnected = status;
  }
};

const actions = {
async updateUserInfo({ commit, state }, newInfo) {
    try {
      // 根据角色调用对应接口（这里以学生为例，可扩展教师/管理员）
      let response;
      if (state.userInfo.role === 'student') {
        // 合并现有userInfo的id（避免前端传空）
        const params = { ...state.userInfo, ...newInfo };
        response = await updateStudentInfo(params);
      }
      // 可扩展：教师/管理员的接口调用逻辑
      // else if (state.userInfo.role === 'teacher') { ... }

      // 接口成功后，更新Store
      commit('UPDATE_USER_INFO', newInfo);
      return response;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error; // 抛出错误，让组件处理提示
    }
  },

  registerWsMessageListener({ commit }) {
    wsClient.offGlobalMessage(this.wsMessageHandler);
    this.wsMessageHandler = (message) => {
      console.log('收到后端推送消息:', message);
      commit('ADD_WS_MESSAGE', message);
      switch (message.type) {
        case 'SCORE_REMIND':
          window.$message?.warning(`【二课分提醒】${message.content}`);
          break;
        case 'ACTIVITY_APPROVE':
          window.$message?.success(`【活动通知】${message.content}`);
          break;
      }
    };
    wsClient.onGlobalMessage(this.wsMessageHandler);
  },

  async login({ commit, dispatch }, loginData) {
    let { identity, ...baseData } = loginData;
    identity = identity?.toLowerCase() || '';
    let response;

    try {
      switch (identity) {
        case 'student': response = await studentLogin(baseData); break;
        case 'teacher': response = await teacherLogin(baseData); break;
        case 'emp': case 'admin': response = await adminLogin(baseData); break;
        default: throw new Error(`未知身份：${identity}`);
      }

      const resData = response || response;
      console.log(resData);
      
      // 登录成功后，直接用接口返回的data作为userInfo
      const userInfo = {
        id: resData.id,
        name: resData.name, // 直接拿接口返回的name
        userName: resData.userName, // 直接拿接口返回的userName
        role: identity // 或用resData.data.role
      };
      // 存储token + 用户信息
      commit('SET_LOGIN_INFO', {
        token: resData.token,
        userInfo: userInfo
      });

      await dispatch('initWsConnectWithToken');
      return response;
    } catch (error) {
      commit('CLEAR_USER_DATA');
      throw error;
    }
  },

  async initWsConnectWithToken({ commit, dispatch, state }) {
    try {
      if (!state.token || !state.jwtPayload) {
        throw new Error('Token/JWT缺失');
      }
      const wsPathInfo = parseJwtForWsPath(state.jwtPayload);
      if (!wsPathInfo) {
        throw new Error('JWT中无有效身份/ID');
      }
      const { identity, id } = wsPathInfo;
      wsClient.setWsUrlByIdentity(identity, id);
      await wsClient.connect();
      commit('SET_WS_CONNECTED', true);
      await dispatch('registerWsMessageListener');
      console.log(`WS连接成功：${identity}_${id}`);
    } catch (error) {
      commit('SET_WS_CONNECTED', false);
      if (error.message.includes('401') || error.message.includes('过期')) {
        commit('CLEAR_USER_DATA');
        window.$message?.error('Token已过期，请重新登录');
        router.push('/login');
      }
      throw new Error(`WS连接失败：${error.message}`);
    }
  },

  async logout({ commit }) {
    try {
      if (wsClient) {
        wsClient.close();
        commit('SET_WS_CONNECTED', false);
      }
      const res = await logoutUser();
      const resData = res.data || res;
      if (resData.code === 1 || resData.success) {
        window.$message?.success('退出登录成功');
      } else {
        window.$message?.error(`退出失败：${resData.msg || '接口返回错误'}`);
      }
    } catch (error) {
      console.error('登出接口调用失败:', error);
      window.$message?.warning('退出接口调用失败，已强制登出');
    } finally {
      commit('CLEAR_USER_DATA');
      router.push('/login').catch(err => console.error('跳转登录页失败:', err));
    }
  },
  
  clearUserData({ commit }) {
    wsClient.close();
    commit('CLEAR_USER_DATA');
  },

  // 刷新恢复逻辑：直接从localStorage拿userInfo（不再依赖JWT解析name）
  restoreLoginState({dispatch, state }) {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!token || !userInfo) {
      console.log('localStorage中无登录信息，无需恢复');
      return;
    }
    // 恢复状态
    state.token = token;
    state.userInfo = userInfo;
    state.isLoggedIn = true;
    // 解析JWT用于WS（仅WS需要）
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const decoded = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      state.jwtPayload = JSON.parse(decoded);
      // 恢复WS连接
      dispatch('initWsConnectWithToken').catch(wsError => {
        console.warn('WS连接恢复失败（不影响登录状态）:', wsError);
      });
    } catch (e) {
      state.jwtPayload = null;
      console.error('JWT解析失败（仅影响WS）:', e);
    }
    console.log('✅ 刷新后恢复登录状态成功，用户信息:', userInfo);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
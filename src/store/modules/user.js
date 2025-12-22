import { 
  logoutUser,
  adminLogin,
  teacherLogin,
  studentLogin
} from '@/api/auth'
import wsClient from '@/utils/websocket';
import router from '@/router/index.js';

// 辅助函数1：从JWT解析身份+ID（用于WS路径）
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

// 辅助函数2：从JWT解析用户信息（替代getUserInfo接口）
const parseUserInfoFromJwt = (jwtPayload) => {
  if (!jwtPayload) return null;

  // 适配你的JWT字段（根据实际返回的字段调整）
  return {
    id: jwtPayload.id || jwtPayload.empId || jwtPayload.studentId || jwtPayload.teacherId || '',
    name: jwtPayload.name || jwtPayload.nickname || jwtPayload.username || '',
    userName: jwtPayload.userName || jwtPayload.username || '',
    // 从xxxId反推身份，或用JWT中的role字段
    role: jwtPayload.role || (() => {
      const idFields = Object.keys(jwtPayload).filter(key => key.endsWith('Id'));
      return idFields.length > 0 ? idFields[0].replace('Id', '') : 'student';
    })()
  };
};

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: { id: null, name: '', userName: '', role: 'emp' },
  isLoggedIn: false,
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
  wsMessages: state => state.wsMessages
};

const mutations = {

ADD_WS_MESSAGE(state, message) {
    if (!state.wsMessages) state.wsMessages = [];
    state.wsMessages.push(message);
    // 限制消息数量（避免内存溢出）
    if (state.wsMessages.length > 100) {
      state.wsMessages.shift();
    }
  },

  SET_TOKEN(state, token) {
    state.token = token;
    try {
      localStorage.setItem('token', token);
    } catch (e) {
      console.error('localStorage存储token失败:', e);
    }
    // 解析JWT
    try {
      const payload = token.split('.')[1];
      state.jwtPayload = JSON.parse(decodeURIComponent(
        atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
    } catch (e) {
      state.jwtPayload = null;
      console.error('JWT解析失败:', e);
    }
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = {
      id: userInfo.id,
      name: userInfo.name,
      userName: userInfo.userName,
      role: userInfo.role || userInfo.identity || 'student'
    };
    state.isLoggedIn = true;
  },
  CLEAR_USER_DATA(state) {
    state.token = '';
    state.userInfo = { id: null, name: '', userName: '', role: null };
    state.isLoggedIn = false;
    state.wsConnected = false;
    state.jwtPayload = null;
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.error('localStorage移除token失败:', e);
    }
  },
  SET_WS_CONNECTED(state, status) {
    state.wsConnected = status;
  }
};

const actions = {

registerWsMessageListener({ commit }) {
    // 先移除旧监听（避免重复）
    wsClient.offGlobalMessage(this.wsMessageHandler);
    
    // 定义监听回调
    this.wsMessageHandler = (message) => {
      console.log('收到后端推送消息:', message);
      commit('ADD_WS_MESSAGE', message);
      // 可根据消息类型触发不同业务逻辑（如二课分提醒、活动审核通知）
      switch (message.type) {
        case 'SCORE_REMIND': // 二课分提醒
          // 触发全局通知（需引入Element UI的Message）
          window.$message?.warning(`【二课分提醒】${message.content}`);
          break;
        case 'ACTIVITY_APPROVE': // 活动审核通知
          window.$message?.success(`【活动通知】${message.content}`);
          break;
        // 其他消息类型...
      }
    };

    // 注册监听
    wsClient.onGlobalMessage(this.wsMessageHandler);
  },

  async login({ commit, dispatch }, loginData) {
    let { identity, ...baseData } = loginData;
    identity = identity?.toLowerCase() || '';
    let response;

    try {
      // 多身份登录接口映射
      switch (identity) {
        case 'student': response = await studentLogin(baseData); break;
        case 'teacher': response = await teacherLogin(baseData); break;
        case 'emp': case 'admin': response = await adminLogin(baseData); break;
        default: throw new Error(`未知身份：${identity}`);
      }

      // 存储Token和用户信息
      const resData = response.data || response;
      commit('SET_TOKEN', resData.token);
      commit('SET_USER_INFO', {
        id: resData.id,
        name: resData.name,
        userName: resData.userName,
        role: resData.role || identity,
        identity
      });

      // 建立WS连接
      await dispatch('initWsConnectWithToken');
      return response;
    } catch (error) {
      commit('CLEAR_USER_DATA');
      throw error;
    }
  },

  // 核心：从JWT解析身份+ID，拼接WS路径
  async initWsConnectWithToken({ commit, dispatch,state }) {
    try {
      if (!state.token || !state.jwtPayload) {
        throw new Error('Token/JWT缺失');
      }

      // 从JWT提取身份+ID（如empId→emp_1）
      const wsPathInfo = parseJwtForWsPath(state.jwtPayload);
      if (!wsPathInfo) {
        throw new Error('JWT中无有效身份/ID');
      }
      const { identity, id } = wsPathInfo;

      // 设置WS路径（如/ws/emp_1）
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
      // 跳转到登录页（需引入router）
      router.push('/login');
    }
      throw new Error(`WS连接失败：${error.message}`);
    }
  },

  // 移除getUserInfo action（无该接口）
  
  async logout({ commit }) {
    try {
      wsClient.close();
      await logoutUser();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      commit('CLEAR_USER_DATA');
    }
  },
  
  clearUserData({ commit }) {
    wsClient.close();
    commit('CLEAR_USER_DATA');
  },

  async restoreLoginState({ commit, dispatch, state }) {
    // 1. 从localStorage读取token
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 2. 存入token到Vuex（触发JWT解析）
      commit('SET_TOKEN', token);

      // 3. 从JWT Payload解析用户信息（核心改造）
      const userInfo = parseUserInfoFromJwt(state.jwtPayload);
      if (!userInfo) {
        throw new Error('JWT中未解析出用户信息');
      }
      commit('SET_USER_INFO', userInfo);

      // 4. 重新建立WS连接（可选）
      await dispatch('initWsConnectWithToken');

      console.log('✅ 刷新后恢复登录状态成功（从JWT解析）');
    } catch (error) {
      // 恢复失败（token过期/JWT解析失败）
      commit('CLEAR_USER_DATA');
      console.error('❌ 刷新后恢复登录状态失败:', error);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
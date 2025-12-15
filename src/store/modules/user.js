import { 
  getUserInfo, 
  logoutUser,
  adminLogin,
  teacherLogin,
  studentLogin
} from '@/api/auth'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: {
    id: null,
    name: '',
    userName: '',
    role: 'teacher' // 'admin' / 'student' / 'teacher'
  },
  isLoggedIn: false
}

const getters = {
  isLoggedIn: state => !!state.token && state.isLoggedIn,
  userInfo: state => state.userInfo,
  token: state => state.token,
  isAdmin: state => state.userInfo.role === 'admin',
  isStudent: state => state.userInfo.role === 'student',
  isTeacher: state => state.userInfo.role === 'teacher',
  isNormalUser: state => ['student', 'teacher'].includes(state.userInfo.role)
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = {
      id: userInfo.id,
      name: userInfo.name,
      userName: userInfo.userName,
      // 优先使用接口返回的role，否则用identity映射
      role: userInfo.role || userInfo.identity || 'student'
    }
    state.isLoggedIn = true
  },
  CLEAR_USER_DATA(state) {
    state.token = ''
    state.userInfo = {
      id: null,
      name: '',
      userName: '',
      role: null
    }
    state.isLoggedIn = false
    localStorage.removeItem('token')
  }
}

const actions = {
  // 统一登录入口：处理多身份登录
  async login({ commit }, loginData) {
    const { identity, ...baseData } = loginData
    let response

    // 根据身份选择对应登录接口
    try {
      switch (identity) {
        case 'student':
          response = await studentLogin(baseData)
          break
        case 'teacher':
          response = await teacherLogin(baseData)
          break
        case 'admin':
          response = await adminLogin(baseData)
          break
        
      }

      // 统一处理返回数据
      const resData = response.data || response
      const { token, id, name, userName, role } = resData

      // 存储token和用户信息
      commit('SET_TOKEN', token)
      commit('SET_USER_INFO', {
        id,
        name,
        userName,
        role: role || identity, // 接口没返回role则用选择的identity
        identity
      })

      return response
    } catch (error) {
      // 登录失败清空数据
      commit('CLEAR_USER_DATA')
      throw error // 抛出错误给页面处理
    }
  },
  
  // 获取用户信息
  async getUserInfo({ commit, state }) {
    try {
      if (!state.token) {
        throw new Error('No token found')
      }
      
      const response = await getUserInfo()
      const userInfo = response.data || response
      commit('SET_USER_INFO', userInfo)
      
      return response
    } catch (error) {
      commit('CLEAR_USER_DATA')
      throw error
    }
  },
  
  // 登出
  async logout({ commit }) {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      commit('CLEAR_USER_DATA')
    }
  },
  
  // 清除用户数据
  clearUserData({ commit }) {
    commit('CLEAR_USER_DATA')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
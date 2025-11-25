import { loginUser, getUserInfo, logoutUser } from '@/api/auth'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: {
    id: null,
    name: '',
    userName: '',
    role: 'admin' //null 'admin' 或 'student'
  },
  isLoggedIn: false
}

const getters = {
  isLoggedIn: state => !!state.token && state.isLoggedIn,
  userInfo: state => state.userInfo,
  token: state => state.token,
  isAdmin: state => state.userInfo.role === 'admin',
  isStudent: state => state.userInfo.role === 'student'
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
      role: userInfo.role || 'student' // 默认为学生
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
  // 登录
  async login({ commit }, loginData) {
    const response = await loginUser(loginData)
    
    // 根据您提供的数据格式，response.data 包含 { id, name, token, userName, role }
    const { token, id, name, userName, role } = response
    
    commit('SET_TOKEN', token)
    commit('SET_USER_INFO', { id, name, userName, role })
    
    return response
  },
  
  // 获取用户信息
  async getUserInfo({ commit, state }) {
    try {
      if (!state.token) {
        throw new Error('No token found')
      }
      
      const response = await getUserInfo()
      commit('SET_USER_INFO', response)
      
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

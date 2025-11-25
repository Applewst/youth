import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { 
      requiresAuth: false,//先设置不需要登录
      title: '首页'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProFileView.vue'),
    meta: { 
      requiresAuth: false,
      title: '个人中心'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { 
      requiresAuth: false,
      title: '设置'
    }
  },
  {
    path: '/category',
    name: 'category',
    component: () => import('@/views/CategoryView.vue'),
    meta: { 
      requiresAuth: false,
      title: '二课活动'
    }
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/ActivityView.vue'),
    meta: { 
      requiresAuth: false,
      title: '活动管理'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { 
      requiresAuth: false,
      requiresAdmin: true,
      title: '管理员后台'
    }
  },
  {
    path: '*',
    name: '404',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { 
      requiresAuth: false,
      title: '页面不存在'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 控制页面跳转时的滚动位置
    if (savedPosition) {
      return savedPosition// 从历史记录返回时，恢复之前的滚动位置
    } else {
      return { x: 0, y: 0 }// 默认滚动到页面顶部
    }
  }
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 青年之家`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = store.getters['user/token']
    const isLoggedIn = store.getters['user/isLoggedIn']
    
    if (!token || !isLoggedIn) {
      // 没有token或未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 有token但没有用户信息，尝试获取用户信息
    if (!store.getters['user/userInfo'].id) {
      try {
        await store.dispatch('user/getUserInfo')
      } catch (error) {
        // 获取用户信息失败，清除token并跳转到登录页
        store.dispatch('user/clearUserData')
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    const isAdmin = store.getters['user/isAdmin']
    if (!isAdmin) {
      // 不是管理员，跳转到首页并提示
      next('/home')
      return
    }
  }
  
  // 如果已登录用户访问登录页，重定向到首页
  if (to.path === '/login' && store.getters['user/isLoggedIn']) {
    next('/home')
    return
  }
  
  next()
})

// 全局后置钩子
router.afterEach(() => {
  // 清除错误信息
  store.dispatch('clearError')
})

export default router

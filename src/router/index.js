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
    path: '/', 
    component:()=>import('@/components/Header.vue'), 
    children: [
      {
        path: 'home',
        name: 'home',
        component: HomeView,
        meta: { 
          requiresAuth: false, // 所有角色都需要登录
          title: '首页',
          roles: ['student', 'teacher', 'admin'] // 所有角色可访问
        }
      },
      // 管理员专属：活动管理
      {
        path: 'activity',
        name: 'activity',
        component: () => import('@/views/ActivityView.vue'),
        meta: { 
          requiresAuth: false,
          title: '活动管理',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      // 管理员专属：分类管理
      {
        path: 'category',
        name: 'category',
        component: () => import('@/views/CategoryView.vue'),
        meta: { 
          requiresAuth: false,
          title: '分类管理',
          roles: ['admin'] // 仅管理员可访问
        }
      },
      // 管理员专属：成员管理
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/AdminPanel.vue'),
        meta: { 
          requiresAuth: false,
          title: '成员管理',
          roles: ['admin'] // 仅管理员可访问
        }
      }
    ]
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
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
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
        store.dispatch('user/clearUserData')
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 角色权限校验
    const userRole = store.getters['user/userInfo'].role
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      // 无权限访问，跳回首页
      this.$message.error('无权限访问该页面')
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
  // 清除错误信息（如果有）
  if (store.dispatch('clearError')) {
    store.dispatch('clearError')
  }
})

export default router
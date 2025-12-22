import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css' 
import { Message } from 'element-ui';
Vue.prototype.$message = Message;
// 或挂载到window（供Vuex/actions中使用）
window.$message = Message;

Vue.config.productionTip = false
Vue.use(ElementUI) 

new Vue({
  router,
  store,
  // 新增：Vue实例创建时，自动恢复登录状态
  async created() {
    // 调用user模块的restoreLoginState action
    await this.$store.dispatch('user/restoreLoginState');
  },
  render: h => h(App)
}).$mount('#app')
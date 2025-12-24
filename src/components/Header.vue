<template>
  <div>
    <div class="header w">
      <div class="logo">
        <img src="@/img/bases/logo.png" alt="青年之家" />
      </div>
      <div class="nav">
        <ul>
          <!-- 所有角色都显示首页 -->
          <li><router-link to="/home">首页</router-link></li>

          <!-- 仅管理员显示以下管理菜单 -->
          <li v-if="isTeacher">
            <router-link to="/package">套餐活动</router-link>
          </li>
          <li v-if="isTeacher">
            <router-link to="/activity">活动管理</router-link>
          </li>
          <li v-if="isTeacher">
            <router-link to="/category">分类管理</router-link>
          </li>
          <li v-if="isTeacher">
            <router-link to="/admin">成员查看</router-link>
          </li>

          <li v-if="isEmp">
            <router-link to="/admin">成员管理</router-link>
          </li>
        </ul>
      </div>
      <div class="search">
        <input
          type="text"
          placeholder="输入关键词"
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">
          <i class="iconfont icon-sousuo"></i>
        </button>
      </div>
      <div class="user">
        <img src="@/img/bases/user.png" alt="用户头像" />
        <span>{{ userInfo.name || userInfo.userName || "未知用户" }}</span>
        <el-tag v-if="isEmp" type="danger" size="mini">管理员</el-tag>
        <el-tag v-else-if="isTeacher" type="warning" size="mini">老师</el-tag>
        <el-tag v-else-if="isStudent" type="primary" size="mini">学生</el-tag>
        <el-dropdown @command="handleUserCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="profile"
              @click="console.log('个人中心被点击')"
              >个人中心</el-dropdown-item
            >
            <el-dropdown-item command="logout" divided
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 移除发布活动弹窗 -->
    <div class="content-container w">
      <router-view></router-view>
    </div>

    <ProfileDialog
      v-model="profileDialogVisible"
      :user-info="userInfo"
      @update-user-info="updateUserInfo"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import ProfileDialog from "@/components/ProfileDialog.vue";

export default {
  components: { ProfileDialog },
  name: "AppHeader",
  data() {
    return {
      searchKeyword: "",
      logoutLoading: false,
      profileDialogVisible: false,
    };
  },
  computed: {
    ...mapState("user", ["userInfo"]),
    ...mapGetters("user", ["isEmp", "isStudent", "isLoggedIn"]),
    isTeacher() {
      return this.userInfo.role === "teacher";
    },
    // 兜底的用户显示名称
    displayUserName() {
      if (!this.isLoggedIn) return "游客";
      return this.userInfo.name || this.userInfo.userName || "未知用户";
    },
  },
  created() {
    // 移除发布人信息初始化逻辑
  },
  methods: {
    ...mapActions("user", ["logout"]), // 映射Vuex的logout action
    // 搜索处理
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$emit("search", this.searchKeyword);
      }
    },
    // 用户下拉菜单处理
    handleUserCommand(command) {
      switch (command) {
        case "profile":
          this.profileDialogVisible = true; // 打开个人中心弹窗
          break;
        case "logout":
          this.$store.dispatch("user/logout");
          break;
      }
    },
    updateUserInfo(newInfo) {
      this.$store.commit("user/SET_LOGIN_INFO", {
        token: this.$store.getters["user/token"],
        userInfo: { ...this.userInfo, ...newInfo },
      });
    },
    // 退出登录逻辑
    async handleLogout() {
      try {
        this.logoutLoading = true;
        // 确认退出
        await this.$confirm("确定要退出登录吗？", "退出确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        // 调用Vuex的logout action（已包含接口调用+WS关闭+状态清理+跳转）
        await this.logout();
      } catch (error) {
        // 取消退出时的提示
        if (error !== "cancel") {
          console.error("退出登录失败:", error);
          this.$message.error("退出登录失败，请重试");
        }
      } finally {
        this.logoutLoading = false;
      }
    },
    // 移除所有发布活动相关方法（handleAdd/handleUpload/handleSubmit等）
  },
};
</script>

<style scoped>
/* 原有样式保持不变（移除发布活动相关样式） */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  position: fixed;
  left: 0;
  right: 0;
}
.logo img {
  height: 40px;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav li {
  margin: 0 20px;
  cursor: pointer;
}

/* 移除发布活动按钮相关样式 */

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav a:hover,
.nav a.router-link-active {
  color: #409eff;
}

.search {
  display: flex;
  align-items: center;
}

.search input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  outline: none;
  width: 200px;
}

.search button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
  background: #409eff;
  color: white;
  cursor: pointer;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.content-container {
  margin-top: 80px;
  padding: 20px;
  min-height: calc(100vh - 100px);
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 20px;
  }
  .nav {
    width: 100%;
    margin: 10px 0;
  }
  .nav li {
    margin: 0 10px;
  }
  .content-container {
    margin-top: 120px;
  }
}

/* 退出登录加载状态样式 */
.el-dropdown-link {
  cursor: pointer;
}
.logout-loading {
  pointer-events: none;
  opacity: 0.7;
}
</style>
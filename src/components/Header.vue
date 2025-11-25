<template>
  <div class="header w">
    <div class="logo">
      <img src="@/img/bases/logo.png" alt="青年之家" />
    </div>
    <div class="nav">
      <ul>
        <li><router-link to="/home">首页</router-link></li>
        <li><router-link to="/activity">活动管理</router-link></li>
        <li><router-link to="/category">分类管理</router-link></li>
        <li v-if="isAdmin">
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
      <span>{{ userInfo.userName || "游客" }}</span>
      <el-tag v-if="isAdmin" type="danger" size="mini">管理员</el-tag>
      <el-tag v-else-if="isStudent" type="primary" size="mini">学生</el-tag>
      <el-dropdown @command="handleUserCommand">
        <span class="el-dropdown-link">
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="profile">个人中心</el-dropdown-item>
          <el-dropdown-item command="settings">设置</el-dropdown-item>
          <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "AppHeader",
  data() {
    return {
      searchKeyword: "",
    };
  },
  computed: {
    ...mapState("user", ["userInfo"]),
    ...mapGetters("user", ["isAdmin", "isStudent"]),
  },
  methods: {
    ...mapActions("user", ["logout"]),
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$emit("search", this.searchKeyword);
      }
    },
    handleUserCommand(command) {
      switch (command) {
        case "profile":
          this.$router.push("/profile");
          break;
        case "settings":
          this.$router.push("/settings");
          break;
        case "logout":
          this.logout();
          this.$router.push("/login");
          break;
      }
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo img {
  height: 40px;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav li {
  margin: 0 20px;
}

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
</style>

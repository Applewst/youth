<template>
  <div class="login-page">
    <div class="container">
      <div class="form-box" :style="{ transform: formBoxTransform }">
        <div class="register-box" :class="{ hidden: !isRegisterBoxVisible }">
          <h1>register</h1>
          <input
            type="text"
            v-model="registerData.username"
            placeholder="用户名"
          />
          <input type="email" v-model="registerData.email" placeholder="邮箱" />
          <el-select
            v-model="registerData.school"
            class="md-el-select"
            filterable
            clearable
            placeholder="请选择学校"
            :popper-append-to-body="true"
          >
            <el-option
              v-for="s in schools"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
          <input
            type="password"
            v-model="registerData.password"
            placeholder="密码"
          />
          <input
            type="password"
            v-model="registerData.confirmPassword"
            placeholder="确认密码"
          />
          <button type="button" @click="registerUser">注册</button>
        </div>
        <div class="login-box" :class="{ hidden: isRegisterBoxVisible }">
          <h1>login</h1>
          <input
            type="text"
            v-model="loginData.username"
            placeholder="用户名"
          />
          <el-select
            v-model="loginData.school"
            class="md-el-select"
            filterable
            clearable
            placeholder="请选择学校"
            :popper-append-to-body="true"
          >
            <el-option
              v-for="s in schools"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
          <input
            type="password"
            v-model="loginData.password"
            placeholder="密码"
          />
          <button type="button" @click="loginUser">登录</button>
        </div>
      </div>
      <div class="con-box left">
        <h2>欢迎来到<span>青年之家</span></h2>
        <p>快来欣赏你们一代<span>青年的风采</span>吧</p>
        <img src="../img/login/girlSecond.png" alt="" />
        <p>已有账号</p>
        <button @click="goToLogin">去登录</button>
      </div>
      <div class="con-box right">
        <h2>欢迎来到<span>青年之家</span></h2>
        <p>快来看看世界上的最可爱<span>青年</span>吧</p>
        <img src="../img/login/girlFirst.png" alt="" />
        <p>没有账号？</p>
        <button @click="goToRegister">去注册</button>
      </div>
    </div>
  </div>
</template>

<script>
import { registerUser } from "../api/auth";
import { mapActions } from "vuex";
import { fetchSchoolList } from "@/utils/schools";

export default {
  data() {
    return {
      isRegisterBoxVisible: false,
      formBoxTransform: "translateX(0%)",
      loginData: {
        username: "",
        password: "",
        school: "",
      },
      registerData: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        school: "",
      },
      schools: [],
    };
  },
  methods: {
    ...mapActions("user", ["login"]),

    goToRegister() {
      this.formBoxTransform = "translateX(80%)";
      this.isRegisterBoxVisible = true;
    },
    goToLogin() {
      this.formBoxTransform = "translateX(0%)";
      this.isRegisterBoxVisible = false;
    },
    async registerUser() {
      try {
        // 验证密码是否一致
        if (this.registerData.password !== this.registerData.confirmPassword) {
          this.$message.error("两次输入的密码不一致");
          return;
        }

        // 验证必填字段
        if (
          !this.registerData.username ||
          !this.registerData.email ||
          !this.registerData.password ||
          !this.registerData.school
        ) {
          this.$message.error("请填写所有必填字段");
          return;
        }

        const response = await registerUser(this.registerData);
        console.log("注册成功:", response);
        this.$message.success("注册成功，请登录");
        this.goToLogin(); // 注册成功后切换到登录界面
      } catch (error) {
        console.error("注册失败:", error);
        // 错误信息已经在request.js的响应拦截器中处理了
      }
    },
    async loginUser() {
      try {
        // 验证必填字段
        if (!this.loginData.username || !this.loginData.password || !this.loginData.school) {
          this.$message.error("请输入用户名、密码并选择学校");
          return;
        }

        // 使用Vuex action进行登录
        await this.login(this.loginData);
        
        // 根据用户角色显示不同的成功消息
        const userRole = this.$store.getters['user/userInfo'].role;
        const roleText = userRole === 'admin' ? '管理员' : '学生';
        this.$message.success(`登录成功，欢迎${roleText}用户！`);

        // 获取重定向路径
        const redirect = this.$route.query.redirect || "/home";
        this.$router.push(redirect);
      } catch (error) {
        console.error("登录失败:", error);
        // 错误信息已经在request.js的响应拦截器中处理了
      }
    },
  },
  async created() {
    // 按需加载学校列表（CDN优先，本地兜底）
    try {
      const schools = await fetchSchoolList();
      this.schools = schools;
    } catch (e) {
      this.schools = [];
    }
  },
};
</script>

<style scoped src="../css/login.css"></style>
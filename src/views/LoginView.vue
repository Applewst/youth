<template>
  <div class="login-page">
    <div class="container">
      <div class="form-box" :style="{ transform: formBoxTransform }">
        <!-- 注册表单 -->
        <el-form
          class="register-box"
          :class="{ hidden: !isRegisterBoxVisible }"
          :model="registerData"
          :rules="registerRules"
          ref="registerFormRef"
          label-width="0px"
          :show-message="false"
        >
          <h1>register</h1>
          <el-form-item prop="username">
            <input
              type="text"
              v-model="registerData.username"
              placeholder="用户名"
            />
          </el-form-item>
          <el-form-item prop="Phone">
            <input
              type="text"
              v-model="registerData.Phone"
              placeholder="邮箱"
            />
          </el-form-item>
          <el-form-item prop="school">
            <el-select
              v-model="registerData.school"
              class="md-el-select"
              filterable
              clearable
              placeholder="请选择学校"
              :popper-append-to-body="true"
            >
              <el-option
                v-for="s in validSchools"
                :key="s"
                :label="s"
                :value="s"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="password">
            <div class="password-input">
              <input
                :type="showPwd ? 'text' : 'password'"
                v-model="registerData.password"
                placeholder="密码"
              />
              <i
                class="el-icon"
                :class="showPwd ? 'el-icon-eye' : 'el-icon-eye-close'"
                @click="showPwd = !showPwd"
              ></i>
            </div>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <input
              type="password"
              v-model="registerData.confirmPassword"
              placeholder="确认密码"
            />
          </el-form-item>
          <!-- 修复：注册按钮 - 改用v-loading指令 -->
          <button
            type="button"
            @click="registerUser"
            :disabled="isRegisterLoading"
            v-loading="isRegisterLoading"
            element-loading-text="注册中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.1)"
          >
            注册
          </button>
        </el-form>

        <!-- 登录表单 -->
        <div class="login-box" :class="{ hidden: isRegisterBoxVisible }">
          <h1>login</h1>
          <input
            type="text"
            v-model="loginData.username"
            placeholder="用户名"
          />
          <input
            type="password"
            v-model="loginData.password"
            placeholder="密码"
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
              v-for="s in validSchools"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>

          <!-- 身份选择模块 -->
          <div class="identity-selector">
            <label class="identity-label">身份选择：</label>
            <el-radio-group
              v-model="loginData.identity"
              class="identity-radio-group"
            >
              <el-radio label="student" border>学生</el-radio>
              <el-radio label="teacher" border>老师</el-radio>
              <el-radio label="emp" border>管理员</el-radio>
            </el-radio-group>
          </div>

          <!-- 修复：登录按钮 - 改用v-loading指令 -->
          <button
            type="button"
            @click="loginUser"
            :disabled="isLoginLoading"
            v-loading="isLoginLoading"
            element-loading-text="登录中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.1)"
          >
            登录
          </button>
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
        identity: "student", // 默认身份：学生
      },
      registerData: {
        username: "",
        Phone: "",
        password: "",
        confirmPassword: "",
        school: "",
      },
      registerRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9]{3,20}$/,
            message: "用户名需为3-20位字母或数字",
            trigger: "blur",
          },
        ],
        Phone: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            message: "邮箱格式不正确（例：xxx@xxx.com）",
            trigger: "blur",
          },
        ],
        school: [{ required: true, message: "请选择学校", trigger: "change" }],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/,
            message: "密码需为6-20位，含字母和数字",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          { required: true, message: "请确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (!this.registerData.password) {
                callback(new Error("请先输入密码"));
                return;
              }
              if (value !== this.registerData.password) {
                callback(new Error("两次密码输入不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      schools: [],
      isRegisterLoading: false,
      isLoginLoading: false, // 登录加载状态
      showPwd: false,
    };
  },
  computed: {
    validSchools() {
      return Array.isArray(this.schools) ? this.schools.filter((s) => !!s) : [];
    },
  },
  methods: {
    // 映射Vuex的login action
    ...mapActions("user", ["login"]),

    // 通用弹窗提示函数
    async showAlert(content, title = "提示", type = "warning", options = {}) {
      const defaultOptions = {
        confirmButtonText: "确定",
        center: true,
        ...options,
      };
      await this.$alert(content, title, {
        type,
        ...defaultOptions,
      });
    },

    // 通用轻提示
    showMessage(content, type = "success", duration = 3000) {
      this.$message({
        message: content,
        type,
        duration,
        center: true,
      });
    },

    // 切换到注册
    goToRegister() {
      this.formBoxTransform = "translateX(80%)";
      this.isRegisterBoxVisible = true;
    },

    // 切换到登录
    goToLogin() {
      this.formBoxTransform = "translateX(0%)";
      this.isRegisterBoxVisible = false;
      this.$nextTick(() => {
        if (this.$refs.registerFormRef) {
          this.$refs.registerFormRef.resetFields();
        }
      });
    },

    // 注册逻辑
    async registerUser() {
      try {
        await this.$refs.registerFormRef?.validate();
      } catch (error) {
        const errorMsg =
          (error &&
            error.errorFields &&
            error.errorFields[0] &&
            error.errorFields[0].message) ||
          "表单填写有误，请检查以下项：\n1. 用户名需3-20位字母/数字\n2. 邮箱格式需正确\n3. 密码需含字母+数字（6-20位）";
        await this.showAlert(errorMsg, "注册校验提示", "warning");
        return;
      }

      const emptyFields = [];
      const { username, Phone, password, school } = this.registerData;
      if (!username) emptyFields.push("用户名");
      if (!Phone) emptyFields.push("邮箱");
      if (!password) emptyFields.push("密码");
      if (!school) emptyFields.push("学校");

      if (emptyFields.length > 0) {
        const tip = `请补充填写：${emptyFields.join("、")}`;
        await this.showAlert(tip, "注册提示", "warning");
        return;
      }

      this.isRegisterLoading = true;
      try {
        const submitData = {
          username,
          Phone,
          password,
          school,
        };
        const response = await registerUser(submitData);
        console.log("注册成功:", response);

        this.showMessage(
          `恭喜 ${username}，注册成功！即将为您跳转到登录页`,
          "success",
          4000
        );

        setTimeout(() => {
          if (this.$refs.registerFormRef) {
            this.$refs.registerFormRef.resetFields();
          }
          this.showPwd = false;
          this.goToLogin();
        }, 2000);
      } catch (error) {
        console.error("注册失败:", error);
        let errorMsg = error?.message || "注册失败";
        if (errorMsg.includes("用户名已存在")) {
          errorMsg = `用户名「${username}」已被注册，请更换用户名重试`;
        } else if (errorMsg.includes("邮箱已存在")) {
          errorMsg = `邮箱「${Phone}」已被注册，请更换邮箱重试`;
        } else {
          errorMsg = `${errorMsg}，请稍后重试`;
        }
        await this.showAlert(errorMsg, "注册失败", "error");
      } finally {
        this.isRegisterLoading = false;
      }
    },

    // 登录逻辑：调用Vuex的login action
    async loginUser() {
      // 1. 校验必填项
      const { username, password, school, identity } = this.loginData;
      const emptyFields = [];
      if (!username) emptyFields.push("用户名");
      if (!password) emptyFields.push("密码");
      // 管理员可选填学校，学生/老师必填
      if (identity !== "emp" && !school) emptyFields.push("学校");

      if (emptyFields.length > 0) {
        const tip = `请输入${emptyFields.join("、")}`;
        await this.showAlert(tip, "登录提示", "warning");
        return;
      }

      // 2. 构造登录参数（管理员移除school字段）
      const loginParams = {
        username,
        password,
        identity, // 传递身份标识给Vuex
        ...(identity !== "emp" && { school }),
      };

      // 3. 调用Vuex的login action
      this.isLoginLoading = true;
      try {
        // 调用store中的login方法
        await this.login(loginParams);

        // 获取用户角色信息
        const userRole = this.$store.getters["user/userInfo"];
        const roleText =
          {
            emp: "管理员",
            teacher: "老师",
            student: "学生",
          }[userRole.role] || "用户";

        // 个性化提示
        this.showMessage(
          `🎉 欢迎${roleText}「${userRole.name}」登录！`,
          "success",
          1000
        );

        const targetPath = "/home";
        // 1. 判断当前是否已在目标页，避免冗余跳转
        if (this.$route.path !== targetPath) {
          // 2. 捕获push的Promise异常（兜底）
          this.$router.push(targetPath).catch((err) => {
            if (!err.message.includes("NavigationDuplicated")) {
              console.error("跳转失败:", err);
            }
          });
        }
      } catch (error) {
        console.error("登录失败:", error);
        let errorMsg = error?.message || "登录失败";

        // 不同身份的错误提示适配
        const identityText =
          {
            student: "学生",
            teacher: "老师",
            emp: "管理员",
          }[identity] || "用户";

        if (errorMsg.includes("用户名不存在")) {
          errorMsg = `${identityText}账号「${username}」不存在，请检查账号`;
        } else if (errorMsg.includes("密码错误")) {
          errorMsg = "密码错误，请重新输入";
        } else if (errorMsg.includes("学校不匹配") && identity !== "emp") {
          errorMsg = `${identityText}账号与所选学校「${school}」不匹配，请确认`;
        } else {
          errorMsg = `${identityText}登录失败：${errorMsg}，请稍后重试`;
        }

        await this.showAlert(errorMsg, `${identityText}登录失败`, "error", {
          confirmButtonText: "重新输入",
        });
      } finally {
        this.isLoginLoading = false;
      }
    },
  },
  async created() {
    try {
      const schools = await fetchSchoolList();
      this.schools = Array.isArray(schools) ? schools : [];
      if (this.schools.length === 0) {
        this.showMessage("暂无学校数据，您可手动输入学校名称", "warning", 5000);
      }
    } catch (e) {
      this.schools = [];
      this.showMessage("学校列表加载失败，部分功能可能受限", "warning", 5000);
    }
  },
};
</script>

<style scoped src="../css/login.css"></style>
<style scoped>
.identity-selector {
  padding: 10px 0;
}

.identity-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.identity-radio-group {
  display: flex;
  justify-content: space-between;
}

.identity-radio-group .el-radio {
  flex: 1;
  text-align: center;
}

.login-box button:disabled,
.register-box button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 优化加载状态样式：避免遮罩覆盖整个按钮文字 */
.el-loading-mask {
  border-radius: 4px;
}
</style>
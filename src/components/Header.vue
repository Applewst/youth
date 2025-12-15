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

          <!-- 老师和管理员显示发布活动按钮 -->
          <li v-if="isTeacher" class="publish-btn-item">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="handleAdd"
            >
              发布活动
            </el-button>
          </li>

          <!-- 仅管理员显示以下管理菜单 -->
          <li v-if="isAdmin">
            <router-link to="/activity">活动管理</router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/category">分类管理</router-link>
          </li>
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
        <el-tag v-else-if="isTeacher" type="warning" size="mini">老师</el-tag>
        <el-tag v-else-if="isStudent" type="primary" size="mini">学生</el-tag>
        <el-dropdown @command="handleUserCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item command="logout" divided
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 发布活动对话框（和参考代码完全一致） -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="activityForm"
        :model="activityForm"
        :rules="activityRules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="activityForm.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="分类ID" prop="categoryId">
          <el-input
            v-model.number="activityForm.categoryId"
            placeholder="请输入分类ID"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="activityForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>

        <el-form-item label="活动图片" prop="image">
          <!-- 上传按钮 -->
          <el-upload
            class="simple-upload"
            action="#"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            :auto-upload="true"
            :show-file-list="false"
          >
            <el-button type="primary" icon="el-icon-upload">选择图片</el-button>
          </el-upload>

          <!-- 上传成功后显示预览图 -->
          <el-image
            v-if="activityForm.image"
            :src="activityForm.image"
            style="
              width: 80px;
              height: 60px;
              margin-top: 10px;
              border-radius: 4px;
            "
            :preview-src-list="[activityForm.image]"
          />

          <!-- 隐藏的输入框（用于表单校验，绑定图片地址） -->
          <el-input
            v-model="activityForm.image"
            placeholder="图片地址（上传后自动填充）"
            style="display: none"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="activityForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="activityForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <div class="content-container w">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { addActivity } from "@/api/activity";
import { uploadFile } from "@/api/upload";

export default {
  name: "AppHeader",
  data() {
    return {
      searchKeyword: "",
      // 弹窗相关数据（和参考代码完全一致）
      dialogVisible: false,
      dialogTitle: "发布活动",
      activityForm: {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        status: 1,
        participants: [],
        publisherId: "", // 发布人ID（业务扩展字段）
        publisherName: "", // 发布人名称（业务扩展字段）
        publisherRole: "", // 发布人角色（业务扩展字段）
      },
      activityRules: {
        name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请输入分类ID", trigger: "blur" },
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }],
        endTime: [
          { required: true, message: "请选择结束时间", trigger: "change" },
        ],
        image: [
          { required: true, message: "请上传活动图片", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    ...mapState("user", ["userInfo"]),
    ...mapGetters("user", ["isAdmin", "isStudent"]),
    // 判断是否为老师
    isTeacher() {
      return this.userInfo.role === "teacher";
    },
  },
  created() {
    // 初始化发布人信息
    if (this.userInfo.id) {
      this.activityForm.publisherId = this.userInfo.id;
      this.activityForm.publisherName = this.userInfo.userName;
      this.activityForm.publisherRole = this.userInfo.role;
    }
  },
  methods: {
    ...mapActions("user", ["logout"]),
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
          this.$router.push("/profile");
          break;
        case "settings":
          this.$router.push("/settings");
          break;
        case "logout":
          this.logout().then(() => {
            this.$router.push("/login");
            this.$message.success("退出登录成功");
          });
          break;
      }
    },

    // ========== 以下方法和参考代码完全对齐 ==========
    // 1. 上传前校验
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2; // 限制2MB内
      if (!isImage) this.$message.error("只能上传图片文件！");
      if (!isLt2M) this.$message.error("图片大小不能超过2MB！");
      return isImage && isLt2M;
    },

    // 2. 图片上传逻辑
    async handleUpload(options) {
      try {
        const res = await uploadFile(options.file);
        if (res.code === 0 && res.data) {
          this.activityForm.image = res.data;
          this.$message.success("图片上传成功！");
        } else {
          this.$message.error("上传失败：" + (res.msg || "未知错误"));
        }
      } catch (err) {
        this.$message.error("上传失败：" + err.message);
      }
    },

    // 3. 打开发布弹窗
    handleAdd() {
      this.dialogTitle = "发布活动";
      this.dialogVisible = true;
    },

    // 4. 提交表单
    handleSubmit() {
      this.$refs.activityForm.validate(async (valid) => {
        if (valid) {
          try {
            await addActivity(this.activityForm);
            this.$message.success("新增成功");
            this.dialogVisible = false;
            this.getList(); // 通知刷新（如果需要）
          } catch (error) {
            console.error("提交失败:", error);
            this.$message.error("发布失败：" + (error.message || "服务器错误"));
          }
        }
      });
    },

    // 5. 弹窗关闭重置
    handleDialogClose() {
      if (this.$refs.activityForm) {
        this.$refs.activityForm.resetFields();
      }
      this.activityForm = {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        status: 1,
        participants: [],
        publisherId: this.userInfo.id,
        publisherName: this.userInfo.userName,
        publisherRole: this.userInfo.role,
      };
    },

    // 6. 刷新列表（空方法，保持和参考代码结构一致）
    getList() {
      this.$emit("activityPublished"); // 通知父组件刷新
    },
  },
};
</script>

<style scoped>
/* 原有样式保持不变 */
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
}

.nav .publish-btn-item {
  margin: 0 10px;
}

.nav .publish-btn-item .el-button {
  padding: 6px 12px;
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
</style>
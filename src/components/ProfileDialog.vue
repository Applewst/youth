<template>
  <el-dialog
    title="个人中心"
    v-model="visible"
    width="800px"
    top="20px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 弹窗内容区域 -->
    <div class="profile-dialog-content">
      <!-- 左侧：头像+基础信息 -->
      <div class="profile-left">
        <div class="avatar-wrapper">
          <el-avatar :size="120" :src="userInfo.avatar || defaultAvatar">
            {{ userInfo.name?.charAt(0) }}
          </el-avatar>
          <el-button
            type="text"
            icon="el-icon-camera"
            @click="uploadAvatar = true"
            class="avatar-edit-btn"
          >
            更换头像
          </el-button>
        </div>

        <div class="base-info">
          <h3>{{ userInfo.name || "未设置" }}</h3>
          <el-tag :type="roleType" size="mini">{{ roleName }}</el-tag>
          <p class="user-id">ID：{{ userInfo.id || "未知" }}</p>
          <p class="username">账号：{{ userInfo.userName || "未设置" }}</p>

          <!-- 学生专属：积分展示 -->
          <div class="score-card" v-if="isStudent">
            <i class="el-icon-medal"></i>
            <span>二课积分：{{ userInfo.score || 0 }} 分</span>
          </div>
        </div>
      </div>

      <!-- 右侧：详细信息+编辑 -->
      <div class="profile-right">
        <!-- 信息标签页 -->
        <el-tabs v-model="activeTab" type="card">
          <!-- 基本信息标签 -->
          <el-tab-pane label="基本信息" name="base">
            <el-descriptions :column="2" border class="info-desc">
              <el-descriptions-item label="真实姓名">
                <span v-if="!editing">{{ userInfo.name || "未设置" }}</span>
                <el-input v-else v-model="form.name" size="mini" />
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                <span v-if="!editing">{{ userInfo.phone || "未设置" }}</span>
                <el-input v-else v-model="form.phone" size="mini" />
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                <span v-if="!editing">{{ userInfo.email || "未设置" }}</span>
                <el-input v-else v-model="form.email" size="mini" />
              </el-descriptions-item>
              <el-descriptions-item label="个性签名">
                <span v-if="!editing">{{
                  userInfo.signature || "未设置"
                }}</span>
                <el-input
                  v-else
                  v-model="form.signature"
                  size="mini"
                  type="textarea"
                  :rows="2"
                />
              </el-descriptions-item>
              <el-descriptions-item label="登录时间" :span="2">
                {{ loginTime }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 编辑按钮 -->
            <div class="btn-group" v-if="activeTab === 'base'">
              <el-button
                type="primary"
                size="mini"
                @click="editing = !editing"
                v-if="!editing"
              >
                <i class="el-icon-edit"></i> 编辑信息
              </el-button>
              <div v-else>
                <el-button size="mini" @click="editing = false">取消</el-button>
                <el-button type="primary" size="mini" @click="saveInfo"
                  >保存</el-button
                >
              </div>
            </div>
          </el-tab-pane>

          <!-- 角色专属标签 -->
          <el-tab-pane
            label="我的数据"
            name="data"
            v-if="isStudent || isTeacher"
          >
            <div class="data-card" v-if="isStudent">
              <h4>活动参与统计</h4>
              <el-row :gutter="10">
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">已参与</p>
                    <p class="value">{{ userInfo.joinCount || 0 }}</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">待审核</p>
                    <p class="value">{{ userInfo.pendingCount || 0 }}</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">已完成</p>
                    <p class="value">{{ userInfo.finishCount || 0 }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div class="data-card" v-if="isTeacher">
              <h4>活动发布统计</h4>
              <el-row :gutter="10">
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">已发布</p>
                    <p class="value">{{ userInfo.publishCount || 0 }}</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">进行中</p>
                    <p class="value">{{ userInfo.activeCount || 0 }}</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-item">
                    <p class="label">已结束</p>
                    <p class="value">{{ userInfo.endCount || 0 }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 消息通知标签 -->
          <el-tab-pane label="消息通知" name="message">
            <el-empty v-if="!wsMessages.length" description="暂无未读消息" />
            <div class="message-list" v-else>
              <div
                class="message-item"
                v-for="(msg, index) in wsMessages.slice(0, 5)"
                :key="index"
              >
                <el-tag
                  :type="msg.type === 'SCORE_REMIND' ? 'warning' : 'success'"
                  size="mini"
                >
                  {{ msg.type === "SCORE_REMIND" ? "积分提醒" : "活动通知" }}
                </el-tag>
                <p class="message-content">{{ msg.content }}</p>
                <p class="message-time">
                  {{ new Date(msg.time).toLocaleString() }}
                </p>
              </div>
              <el-button
                type="text"
                @click="viewAllMessage"
                v-if="wsMessages.length > 5"
              >
                查看全部
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 上传头像子弹窗 -->
    <el-dialog
      title="更换头像"
      v-model="uploadAvatar"
      width="400px"
      append-to-body
    >
      <el-upload
        class="avatar-uploader"
        action="/api/upload/avatar"
        :headers="{ Authorization: `Bearer ${token}` }"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar-preview" />
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ProfileDialog",
  props: {
    // 父组件传入的显示状态（v-model绑定）
    value: {
      type: Boolean,
      default: false,
    },
    // 父组件传入的用户信息
    userInfo: {
      type: Object,
      default: () => ({ id: null, name: "", userName: "", role: "emp" }),
    },
  },
  data() {
    return {
      activeTab: "base", // 默认选中的标签
      editing: false, // 是否编辑状态
      uploadAvatar: false, // 上传头像弹窗开关
      imageUrl: "", // 头像预览地址
      defaultAvatar: "@/assets/images/avatar-default.png", // 默认头像
      loginTime: new Date().toLocaleString(), // 模拟登录时间
      form: {
        name: "",
        phone: "",
        email: "",
        signature: "",
      },
    };
  },
  computed: {
    ...mapGetters("user", [
      "token",
      "isStudent",
      "isTeacher",
      "isEmp",
      "wsMessages",
    ]),
    ...mapActions("user", ["updateUserInfo"]),
    // 弹窗显示状态（v-model双向绑定）
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    // 角色名称格式化
    roleName() {
      const roleMap = { student: "学生", teacher: "教师", emp: "管理员" };
      return roleMap[this.userInfo.role] || "未知角色";
    },
    // 角色标签类型
    roleType() {
      const typeMap = {
        student: "primary",
        teacher: "success",
        emp: "warning",
      };
      return typeMap[this.userInfo.role] || "info";
    },
  },
  watch: {
    // 监听用户信息变化，初始化表单
    userInfo: {
      immediate: true,
      handler(val) {
        this.form = {
          name: val.name || "",
          phone: val.phone || "",
          email: val.email || "",
          signature: val.signature || "",
        };
        this.imageUrl = val.avatar || this.defaultAvatar;
      },
    },
  },
  methods: {
    // 保存编辑的信息
    async saveInfo() {
      try {
        this.$message.loading("正在保存...", 0);
        // 调用Vuex的Action（内部会调用接口）
        await this.updateUserInfo(this.form);
        this.$message.success("信息修改成功");
        this.editing = false;
      } catch (error) {
        this.$message.error("修改失败：" + (error.message || "网络异常"));
      }
    },
    async confirmAvatar() {
      if (!this.imageUrl) return;
      try {
        this.$message.loading("正在更换头像...", 0);
        // 假设头像上传接口是POST /user/avatar，这里仅示例
        // await uploadAvatar({ avatar: this.imageUrl });
        // 调用Action更新Store
        await this.updateUserInfo({ avatar: this.imageUrl });
        this.$message.success("头像修改成功");
        this.uploadAvatar = false;
      } catch (error) {
        this.$message.error("头像更换失败：" + (error.message || "网络异常"));
      }
    },
    // 头像上传成功
    handleAvatarSuccess(res) {
      this.imageUrl = res.data.url;
      this.$message.success("头像上传成功");
      // 通知父组件更新头像
      this.$emit("update-user-info", { avatar: res.data.url });
      this.uploadAvatar = false;
    },
    // 头像上传前校验
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) this.$message.error("只能上传图片格式！");
      if (!isLt2M) this.$message.error("图片大小不能超过2MB！");
      return isImage && isLt2M;
    },
    // 查看全部消息（可跳转消息列表页）
    viewAllMessage() {
      this.visible = false;
      this.$router.push("/message");
    },
  },
};
</script>

<style scoped>
.profile-dialog-content {
  display: flex;
  gap: 20px;
  height: 450px;
  overflow: hidden;
}

/* 左侧样式 */
.profile-left {
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-right: 1px solid #e6e6e6;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.avatar-edit-btn {
  margin-top: 10px;
  color: #409eff;
}

.base-info {
  text-align: center;
  width: 100%;
}

.base-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin: 5px 0;
}

.username {
  font-size: 12px;
  color: #666;
  margin: 0 0 10px 0;
}

.score-card {
  background: #f0f9ff;
  padding: 8px 15px;
  border-radius: 20px;
  margin-top: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-card i {
  color: #409eff;
}

/* 右侧样式 */
.profile-right {
  flex: 1;
  overflow: auto;
  padding: 5px;
}

.info-desc {
  margin-bottom: 15px;
}

.btn-group {
  text-align: right;
  margin-top: 10px;
}

/* 数据卡片样式 */
.data-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.data-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.data-item {
  text-align: center;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}

.data-item .label {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.data-item .value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin: 5px 0 0 0;
}

/* 消息列表样式 */
.message-list {
  max-height: 300px;
  overflow: auto;
}

.message-item {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.message-content {
  margin: 5px 0;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 头像上传样式 */
.avatar-uploader {
  text-align: center;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  background: #fbfbfb;
  margin: 0 auto;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .profile-dialog-content {
    flex-direction: column;
    height: auto;
  }
  .profile-left {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 20px;
  }
}
</style>
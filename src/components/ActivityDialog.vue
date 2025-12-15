<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="activity.name"
    width="700px"
    :before-close="handleClose"
    class="activity-dialog"
  >
    <div v-if="activity" class="dialog-content">
      <div class="dialog-image">
        <img :src="activity.image" :alt="activity.name" />
      </div>

      <div class="dialog-info">
        <!-- 动态匹配分类标签样式 -->
        <el-tag
          :type="getCategoryTypeByApi(activity.categoryName)"
          size="medium"
        >
          {{ activity.categoryName }}
        </el-tag>
        <el-tag
          v-if="activity.status === 1"
          type="success"
          size="medium"
          style="margin-left: 8px"
        >
          <i class="el-icon-check"></i> 进行中
        </el-tag>
        <el-tag v-else type="info" size="medium" style="margin-left: 8px">
          已结束
        </el-tag>
      </div>

      <div class="detail-section">
        <h3><i class="el-icon-document"></i> 活动详情</h3>
        <p class="detail-text">{{ activity.description }}</p>
      </div>

      <div class="detail-section">
        <h3><i class="el-icon-info"></i> 活动信息</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">结束时间:</span>
              <span class="info-value">{{ activity.endTime }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">活动状态:</span>
              <span class="info-value">{{
                activity.status === 1 ? "进行中" : "已结束"
              }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">已参加人数:</span>
              <span class="info-value">{{ participantCount }}人</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">活动分类:</span>
              <span class="info-value">{{ activity.categoryName }}</span>
            </div>
          </el-col>
          <!-- 新增：显示分类类型（从接口获取） -->
          <el-col :span="24" v-if="getCategoryTypeText(activity.categoryName)">
            <div class="info-item">
              <span class="info-label">分类类型:</span>
              <span class="info-value">{{
                getCategoryTypeText(activity.categoryName)
              }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 显示参与者列表 -->
      <div
        v-if="activity.participants && activity.participants.length > 0"
        class="detail-section"
      >
        <h3><i class="el-icon-user"></i> 参与者列表</h3>
        <el-table
          :data="activity.participants"
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="name"
            label="姓名"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="value"
            label="评价"
            width="120"
          ></el-table-column>
          <el-table-column prop="score" label="评分"></el-table-column>
        </el-table>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <!-- 只有进行中的活动才能参加 -->
      <el-button
        type="primary"
        @click="handleJoin"
        :loading="joining"
        :disabled="activity.status !== 1"
      >
        <i class="el-icon-check"></i>
        {{ activity.status === 1 ? "参加活动" : "活动已结束" }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
// 导入分类API和参与活动API
import { getCategoryList } from "@/api/category";
import { joinActivity } from "@/api/activity";

export default {
  name: "ActivityDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    activity: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      joining: false,
      categoryList: [], // 存储从接口获取的分类列表
      categoryLoading: false, // 分类加载状态
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
    participantCount() {
      return this.activity.participants ? this.activity.participants.length : 0;
    },
  },
  watch: {
    // 弹窗打开时加载分类列表
    visible(newVal) {
      if (newVal && this.activity.categoryName) {
        this.loadCategoryList();
      }
    },
  },
  methods: {
    // 加载分类列表（从接口获取）
    async loadCategoryList() {
      if (this.categoryList.length > 0) return; // 避免重复请求

      this.categoryLoading = true;
      try {
        const res = await getCategoryList();
        if (res.code === 0) {
          this.categoryList = res.data; // 存储接口返回的分类列表
        }
      } catch (error) {
        console.error("加载分类列表失败:", error);
        this.$message.error("加载分类信息失败");
      } finally {
        this.categoryLoading = false;
      }
    },

    // 根据分类名称获取对应的类型文本（从接口数据中匹配）
    getCategoryTypeText(categoryName) {
      if (!categoryName || this.categoryList.length === 0) return "";
      const category = this.categoryList.find(
        (item) => item.name === categoryName
      );
      return category ? category.type : "";
    },

    // 动态匹配分类标签样式（基于接口返回的type）
    getCategoryTypeByApi(categoryName) {
      if (!categoryName) return "";

      // 先从接口数据匹配分类类型
      const category = this.categoryList.find(
        (item) => item.name === categoryName
      );
      const type = category ? category.type : "";

      // 根据分类type动态匹配标签样式
      const typeMap = {
        线上活动: "primary",
        线下活动: "success",
        混合活动: "warning",
        直播活动: "info",
        促销活动: "danger",
        培训活动: "primary",
        互动活动: "warning",
        默认类型: "",
      };

      // 兼容写死的分类名称（兜底）
      const fallbackMap = {
        户外活动: "success",
        学习培训: "primary",
        团建活动: "warning",
        商务活动: "info",
        文化活动: "",
        公益活动: "success",
      };

      return typeMap[type] || fallbackMap[categoryName] || "";
    },

    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },

    // 参与活动逻辑（移到弹窗内部）
    async handleJoin() {
      // 1. 校验登录状态
      const isLogin = this.$store?.getters["user/isLogin"];
      if (!isLogin) {
        this.$message.warning("请先登录后再参与活动");
        this.handleClose();
        this.$router.push({ path: "/login", query: { redirect: "/home" } });
        return;
      }

      this.joining = true;
      try {
        // 2. 调用参与活动API
        const res = await joinActivity({
          activityId: this.activity.id,
          userId: this.$store.getters["user/userInfo"].id, // 登录用户ID
        });

        if (res.code === 0) {
          this.$message.success("成功参加活动！");
          this.handleClose();
          // 通知父组件更新活动列表
          this.$emit("join", this.activity);
        } else {
          this.$message.error(res.msg || "参加活动失败");
        }
      } catch (error) {
        console.error("参与活动失败:", error);
        this.$message.error("网络异常，参加活动失败，请稍后重试");
      } finally {
        this.joining = false;
      }
    },
  },
};
</script>

<style scoped>
.activity-dialog >>> .el-dialog__body {
  padding: 0 20px 20px;
}

.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-image {
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.dialog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-info {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.detail-section h3 i {
  margin-right: 8px;
  color: #409eff;
}

.detail-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.detail-full {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.info-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.info-label {
  color: #909399;
  margin-right: 8px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
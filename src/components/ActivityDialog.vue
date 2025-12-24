<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="activity.name"
    width="700px"
    :before-close="handleClose"
    class="activity-dialog"
    append-to-body
  >
    <div v-if="activity" class="dialog-content">
      <div class="dialog-image">
        <img :src="activity.image" :alt="activity.name" />
      </div>

      <div class="dialog-info">
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
      categoryList: [],
      categoryLoading: false,
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
    visible(newVal) {
      if (newVal && this.activity.categoryName) {
        this.loadCategoryList();
      }
    },
  },
  methods: {
    async loadCategoryList() {
      if (this.categoryList.length > 0) return;

      this.categoryLoading = true;
      try {
        const res = await getCategoryList();

        this.categoryList = res;
      } catch (error) {
        console.error("加载分类列表失败:", error);
        this.$message.error("加载分类信息失败");
      } finally {
        this.categoryLoading = false;
      }
    },

    getCategoryTypeText(categoryName) {
      if (!categoryName || this.categoryList.length === 0) return "";
      const category = this.categoryList.find(
        (item) => item.name === categoryName
      );
      return category ? category.type : "";
    },

    getCategoryTypeByApi(categoryName) {
      if (!categoryName) return "";

      const category = this.categoryList.find(
        (item) => item.name === categoryName
      );
      const type = category ? category.type : "";

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

    async handleJoin() {
      const isLogin = this.$store?.getters["user/isLogin"];
      if (!isLogin) {
        this.$message.warning("请先登录后再参与活动");
        this.handleClose();
        this.$router.push({ path: "/login", query: { redirect: "/home" } });
        return;
      }

      this.joining = true;
      try {
        await joinActivity({
          activityId: this.activity.id,
          userId: this.$store.getters["user/userInfo"].id,
        });

        this.$message.success("成功参加活动！");
        this.handleClose();
        this.$emit("join", this.activity);
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
/* 核心修复：强制弹窗居中，解决左上角对齐问题 */
.activity-dialog >>> .el-dialog__wrapper {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden !important; /* 遮罩层无滚动条 */
  z-index: 2000 !important; /* 确保层级足够 */
}

/* 弹窗主体绝对居中，取消所有默认偏移 */
.activity-dialog >>> .el-dialog {
  margin: 0 !important;
  position: absolute !important; /* 改为absolute，基于wrapper定位 */
  top: 50% !important; /* 先定位到垂直50% */
  left: 50% !important; /* 先定位到水平50% */
  transform: translate(-50%, -50%) !important; /* 反向偏移自身50%实现居中 */
  max-height: 90vh !important;
  width: 700px !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 弹窗内容区滚动，整体不滚动 */
.activity-dialog >>> .el-dialog__body {
  padding: 0 20px 20px !important;
  flex: 1 !important;
  overflow-y: auto !important;
  max-height: calc(90vh - 120px) !important; /* 减去标题和底部高度 */
}

/* 弹窗头部样式修正 */
.activity-dialog >>> .el-dialog__header {
  padding: 20px 20px 10px !important;
  border-bottom: 1px solid #ebeef5;
}

/* 弹窗底部样式修正 */
.activity-dialog >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  border-top: 1px solid #ebeef5;
}

/* 原有样式保留 */
.dialog-content {
  height: 100%;
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

/* 响应式适配 */
@media (max-width: 768px) {
  .activity-dialog >>> .el-dialog {
    width: 90% !important;
    max-height: 95vh !important;
  }

  .activity-dialog >>> .el-dialog__body {
    max-height: calc(95vh - 120px) !important;
  }

  .dialog-image {
    height: 200px;
  }
}
</style>
<template>
  <div class="home-page">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 横幅区域 -->
      <div class="banner">
        <div class="w">
          <div class="banner-content">
            <div class="banner-text">
              <h1>发现精彩活动</h1>
              <p>加入我们，探索更多有趣的活动体验</p>
            </div>
            <div class="search-box">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索感兴趣的活动..."
                prefix-icon="el-icon-search"
                @keyup.enter.native="handleSearch"
              >
                <el-button slot="append" @click="handleSearch">搜索</el-button>
              </el-input>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门推荐区域 -->
      <div class="w">
        <div class="section hot-section">
          <div class="section-header">
            <h2><i class="el-icon-star-on"></i> 热门推荐</h2>
            <p>这些活动最受欢迎</p>
          </div>

          <el-carousel height="400px" :interval="5000" arrow="always">
            <el-carousel-item
              v-for="activity in hotActivities"
              :key="activity.id"
            >
              <!-- 点击传递activity到弹窗 -->
              <div class="carousel-item" @click="openDialog(activity)">
                <img :src="activity.image" :alt="activity.name" />
                <div class="carousel-overlay">
                  <h3>{{ activity.name }}</h3>
                  <p>{{ activity.description }}</p>
                  <div class="carousel-meta">
                    <span
                      ><i class="el-icon-folder-opened"></i>
                      {{ activity.categoryName }}</span
                    >
                    <span
                      ><i class="el-icon-user"></i>
                      {{ getParticipantCount(activity) }}人参加</span
                    >
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 人气活动卡片 -->
        <div class="section">
          <div class="section-header">
            <h2><i class="el-icon-trophy"></i> 人气最高</h2>
          </div>
          <el-row :gutter="20">
            <el-col
              v-for="activity in topActivities"
              :key="activity.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <!-- 点击传递activity到弹窗 -->
              <ActivityCard
                :activity="activity"
                @click="() => openDialog(activity)"
              />
            </el-col>
          </el-row>
        </div>

        <!-- 标签筛选 -->
        <div class="section">
          <div class="tags-section">
            <span class="tags-label">快速筛选:</span>
            <el-tag
              type="info"
              :effect="selectedCategoryId === null ? 'dark' : 'plain'"
              class="tag-item"
              @click="selectCategory(null)"
            >
              全部
            </el-tag>
            <el-tag
              v-for="category in categories"
              :key="category.id"
              :type="selectedCategoryId === category.id ? 'primary' : 'info'"
              :effect="selectedCategoryId === category.id ? 'dark' : 'plain'"
              class="tag-item"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </el-tag>
            <el-tag
              v-if="selectedCategoryId"
              type="warning"
              class="tag-item"
              @click="selectCategory(null)"
            >
              <i class="el-icon-close"></i> 清除筛选
            </el-tag>
          </div>
        </div>

        <!-- 分类活动展示 -->
        <div
          v-for="category in displayCategories"
          :key="category.id"
          class="section"
        >
          <div class="section-header">
            <div>
              <h2>{{ category.name }}</h2>
              <p
                v-if="category.type"
                style="margin: 0; font-size: 14px; color: #909399"
              >
                {{ category.type }}
              </p>
            </div>
            <el-link type="primary" :underline="false">
              查看更多 <i class="el-icon-arrow-right"></i>
            </el-link>
          </div>

          <div v-loading="loading" class="activities-grid">
            <!-- 点击传递activity到弹窗 -->
            <ActivityCard
              v-for="activity in getActivitiesByCategory(category.id)"
              :key="activity.id"
              :activity="activity"
              @click="() => openDialog(activity)"
            />
          </div>

          <el-empty
            v-if="getActivitiesByCategory(category.id).length === 0"
            description="暂无活动"
          ></el-empty>
        </div>
      </div>
    </main>

    <!-- 底部组件 -->
    <AppFooter />

    <!-- 活动详情弹窗（简化事件绑定） -->
    <ActivityDialog
      :visible="dialogVisible"
      :activity="selectedActivity"
      @update:visible="dialogVisible = $event"
      @close="handleDialogClose"
      @join="handleActivityJoined"
    />
  </div>
</template>

<script>
import { getActivityPage } from "@/api/activity";
import { getCategoryList } from "@/api/category";
import AppFooter from "@/components/Footer.vue";
import ActivityCard from "@/components/ActivityCard.vue";
import ActivityDialog from "@/components/ActivityDialog.vue";

export default {
  name: "HomePage",
  components: {
    AppFooter,
    ActivityCard,
    ActivityDialog,
  },
  data() {
    return {
      searchKeyword: "",
      loading: false,
      dialogVisible: false, // 弹窗显示状态
      selectedActivity: {}, // 当前选中的活动
      selectedCategoryId: null,
      categories: [],
      activities: [],
      allActivities: [],
    };
  },
  computed: {
    hotActivities() {
      return [...this.allActivities]
        .filter((a) => a.status === 1)
        .sort(
          (a, b) => this.getParticipantCount(b) - this.getParticipantCount(a)
        )
        .slice(0, 5);
    },
    topActivities() {
      return [...this.allActivities]
        .sort(
          (a, b) => this.getParticipantCount(b) - this.getParticipantCount(a)
        )
        .slice(0, 4);
    },
    displayCategories() {
      if (this.selectedCategoryId) {
        return this.categories.filter((c) => c.id === this.selectedCategoryId);
      }
      return this.categories;
    },
  },
  created() {
    this.loadCategories();
    this.loadActivities();
  },
  watch: {
    dialogVisible(newVal) {
      // 弹窗打开时给body添加禁止滚动类名
      if (newVal) {
        document.body.classList.add("dialog-open");
        this.$el.classList.add("dialog-open");
      } else {
        document.body.classList.remove("dialog-open");
        this.$el.classList.remove("dialog-open");
      }
    },
  },
  beforeDestroy() {
    document.body.classList.remove("dialog-open");
    this.$el.classList.remove("dialog-open");
  },
  methods: {
    // 加载分类列表（用于筛选标签）
    async loadCategories() {
      try {
        const response = await getCategoryList();
        if (response.code === 0) {
          this.categories = response.data;
        } else {
          this.$message.error(response.msg || "加载分类失败");
        }
      } catch (error) {
        console.error("加载分类失败:", error);
        this.$message.error("加载分类失败，请稍后再试");
      }
    },

    // 加载活动列表
    async loadActivities() {
      this.loading = true;
      try {
        const response = await getActivityPage({
          page: 1,
          pageSize: 100,
          status: this.selectedCategoryId ? undefined : 1,
          categoryId: this.selectedCategoryId,
        });
        if (response.code === 0) {
          this.allActivities = response.data.records;
          this.activities = response.data.records;
        } else {
          this.$message.error(response.msg || "加载活动失败");
        }
      } catch (error) {
        console.error("加载活动失败:", error);
        this.$message.error("加载活动失败，请稍后再试");
      } finally {
        this.loading = false;
      }
    },

    // 获取参与人数
    getParticipantCount(activity) {
      return activity.participants ? activity.participants.length : 0;
    },

    // 搜索活动
    async handleSearch() {
      if (this.searchKeyword.trim()) {
        this.loading = true;
        try {
          const response = await getActivityPage({
            page: 1,
            pageSize: 100,
            name: this.searchKeyword,
          });
          if (response.code === 0) {
            this.activities = response.data.records;
            this.$message.success(`找到 ${response.data.total} 个相关活动`);
          }
        } catch (error) {
          this.$message.error("搜索失败");
        } finally {
          this.loading = false;
        }
      } else {
        this.loadActivities();
      }
    },

    // 筛选分类
    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId;
      this.loadActivities();
    },

    // 根据分类筛选活动
    getActivitiesByCategory(categoryId) {
      if (!categoryId) return this.activities;
      return this.activities
        .filter((a) => a.categoryId === categoryId)
        .slice(0, 8);
    },

    // 打开活动弹窗
    openDialog(activity) {
      if (!activity || !activity.id) {
        this.$message.warning("活动信息异常，无法查看详情");
        return;
      }
      this.selectedActivity = { ...activity }; // 深拷贝避免原数据修改
      this.dialogVisible = true;
    },

    // 关闭弹窗的兜底处理
    handleDialogClose() {
      this.dialogVisible = false;
      this.selectedActivity = {};
    },

    // 接收弹窗的参与成功通知，刷新活动列表
    handleActivityJoined() {
      this.loadActivities(); // 重新加载活动列表，更新参与人数
    },
  },
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  margin-bottom: 20px;
}

.banner-content {
  text-align: center;
}

.banner-text h1 {
  margin: 0 0 16px 0;
  font-size: 48px;
  font-weight: 700;
}

.banner-text p {
  margin: 0 0 32px 0;
  font-size: 20px;
  opacity: 0.9;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.search-box >>> .el-input__inner {
  height: 50px;
  font-size: 16px;
  border-radius: 25px 0 0 25px;
}

.search-box >>> .el-input-group__append {
  border-radius: 0 25px 25px 0;
  background: #409eff;
  color: white;
  border: none;
}

.search-box >>> .el-input-group__append button {
  color: white;
}

.section {
  margin-bottom: 60px;
}

.hot-section {
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #909399;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.carousel-overlay h3 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 600;
}

.carousel-overlay p {
  margin: 0 0 16px 0;
  font-size: 16px;
  opacity: 0.9;
}

.carousel-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.carousel-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tags-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tags-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.w {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .banner-text h1 {
    font-size: 32px;
  }

  .banner-text p {
    font-size: 16px;
  }

  .section-header h2 {
    font-size: 22px;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
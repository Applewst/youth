<template>
  <div class="home-page">
    <!-- 头部组件 -->
    <AppHeader @search="handleSearch" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- Banner区域 -->
      <!-- <section class="banner"> -->
      <!-- <div class="w"> -->
      <!-- 分类导航 -->
      <!-- <div class="subnav">
            <ul>
              <li v-for="category in categories" :key="category">
                <a href="#" @click.prevent="filterByCategory(category)">
                  {{ category }}<span>&gt;</span>
                </a>
              </li>
            </ul>
          </div> -->

      <!-- 活动安排 -->
      <!-- <div class="course">
            <h2>活动安排</h2>
            <div class="bd">
              <div v-if="loading" class="loading">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else>
                <div
                  v-for="activity in ongoingActivities.slice(0, 3)"
                  :key="activity.id"
                  class="activity-item"
                >
                  <h4>{{ activity.title }}</h4>
                  <p>
                    时间：{{ getStatusText(activity.status) }}<br />地点:
                    {{ activity.location }}
                  </p>
                </div>
                <router-link to="/activities" class="m">全部活动</router-link>
              </div>
            </div>
          </div> -->
      <!-- </div> -->
      <!-- </section> -->

      <!-- 个人标签 -->
      <!-- <section class="good w">
        <h3>个人标签</h3>
        <div class="tags">
          <el-tag
            v-for="tag in userTags"
            :key="tag"
            size="medium"
            class="tag-item"
            @click="editTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
        <el-button type="text" @click="showEditTags = true">修改兴趣</el-button>
      </section> -->

      <!-- 活动推荐 -->
      <!-- <section class="box w">
        <div class="box-hd">
          <h3>二课优秀活动推荐</h3>
          <router-link to="/activities">查看全部</router-link>
        </div>
        <div class="box-bd">
          <div v-if="loading" class="loading">
            <el-skeleton :rows="4" animated />
          </div>
          <div v-else class="activities-grid">
            <ActivityCard
              v-for="activity in recommendedActivities"
              :key="activity.id"
              :activity="activity"
              @join="handleJoinActivity"
            />
          </div>
        </div>
      </section> -->
    </main>

    <!-- 底部组件 -->
    <AppFooter />

    <!-- 编辑标签对话框 -->
    <el-dialog title="修改个人标签" :visible.sync="showEditTags" width="500px">
      <el-form>
        <el-form-item label="个人标签">
          <el-tag
            v-for="tag in tempTags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showInput"
            >+ 新标签</el-button
          >
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditTags = false">取消</el-button>
        <el-button type="primary" @click="saveTags">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { mapState, mapGetters, mapActions } from "vuex";
import AppHeader from "@/components/Header.vue";
import AppFooter from "@/components/Footer.vue";
// import ActivityCard from "@/components/ActivityCard.vue";

export default {
  name: "HomePage",
  components: {
    AppHeader,
    AppFooter,
    // ActivityCard,
  },
  data() {
    return {
      showEditTags: false,
      tempTags: [],
      inputVisible: false,
      inputValue: "",
    };
  },
  computed: {
    // ...mapState("activity", ["loading"]),
    // ...mapGetters("activity", [
    //   "categories",
    //   "userTags",
    //   "ongoingActivities",
    //   "allActivities",
    // ]),
    // recommendedActivities() {
    //   return this.allActivities.slice(0, 6);
    // },
  },
  async created() {
    // 获取活动数据
    // await this.fetchActivities();
  },
  methods: {
    // ...mapActions("activity", [
    //   "fetchActivities",
    //   "joinActivity",
    //   "updateUserTags",
    // ]),

    // 搜索处理
    handleSearch(keyword) {
      this.$router.push({
        path: "/activities",
        query: { search: keyword },
      });
    },

    // 按分类筛选
    filterByCategory(category) {
      this.$router.push({
        path: "/activities",
        query: { category },
      });
    },

    // 参与活动
    async handleJoinActivity(activity) {
      try {
        await this.joinActivity(activity.id);
        this.$message.success("参与活动成功！");
      } catch (error) {
        this.$message.error("参与活动失败，请重试");
      }
    },

    // 编辑标签
    editTag() {
      this.showEditTags = true;
      this.tempTags = [...this.userTags];
    },

    // 显示输入框
    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 确认输入
    handleInputConfirm() {
      const inputValue = this.inputValue;
      if (inputValue && !this.tempTags.includes(inputValue)) {
        this.tempTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },

    // 移除标签
    removeTag(tag) {
      this.tempTags.splice(this.tempTags.indexOf(tag), 1);
    },

    // 保存标签
    saveTags() {
      this.updateUserTags(this.tempTags);
      this.showEditTags = false;
      this.$message.success("标签更新成功！");
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        ongoing: "正在进行",
        upcoming: "即将开始",
        ended: "已结束",
      };
      return statusMap[status] || "未知";
    },
  },
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding-top: 60px;
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
}

.banner .w {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
}

.subnav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.subnav li a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.subnav li a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.course {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.course h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.activity-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.activity-item p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.m {
  display: inline-block;
  margin-top: 12px;
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.good {
  background: white;
  padding: 30px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.good h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.tags {
  margin-bottom: 16px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.box {
  background: white;
  padding: 30px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.box-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.box-hd h3 {
  margin: 0;
  color: #333;
}

.box-hd a {
  color: #409eff;
  text-decoration: none;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.loading {
  padding: 20px;
}

.tag-input {
  width: 90px;
  margin-left: 8px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 8px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.w {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
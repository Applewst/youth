<template>
  <div class="home-page">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- banner部分开始 -->
      <div class="banner">
        <div class="w">
          <!-- banner布局容器：左侧分类 + 中间弹窗区 + 右侧course -->
          <div class="banner-layout">
            <!-- 左侧：分类subnav列表 -->
            <div class="subnav">
              <ul>
                <li
                  v-for="category in categories"
                  :key="category.id"
                  :data-id="category.id"
                  @mouseenter="handleCategoryHover(category.id, $event)"
                  @mouseleave="hoverCategoryId = null"
                >
                  <a href="#" @click.prevent="selectCategory(category.id)">
                    <span>&#160;&#160;</span>
                    {{ category.name }}
                    <span v-for="i in getSpaceCount(category.name)" :key="i"
                      >&#160;</span
                    >
                    <!-- 动态切换箭头：悬浮当前分类时显示向左，否则向右 -->
                    <span v-if="hoverCategoryId === category.id"> &lt; </span>
                    <span v-else> &gt; </span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- 中间：套餐弹窗容器 -->
            <div class="package-popup-container">
              <div class="package-popup" v-show="hoverCategoryId">
                <!-- 弹窗头部 -->
                <div class="popup-header">
                  <h3>{{ currentCategoryName }} - 专属套餐</h3>
                </div>

                <!-- 弹窗内容 -->
                <div class="popup-body" v-loading="packageLoading">
                  <!-- 套餐列表 -->
                  <div
                    v-if="!packageLoading && packageList.length > 0"
                    class="packages-container"
                  >
                    <div
                      v-for="pkg in packageList"
                      :key="pkg.id"
                      class="package-section"
                    >
                      <!-- 套餐信息 -->
                      <div class="package-header">
                        <div class="package-icon">
                          <i class="el-icon-gift"></i>
                        </div>
                        <div class="package-info">
                          <h4>{{ pkg.name }}</h4>
                          <p class="score">二课积分：{{ pkg.score }}分</p>
                          <p class="desc">
                            {{ pkg.description || "暂无描述" }}
                          </p>
                        </div>
                        <button
                          class="package-btn"
                          @click="handlePackageClick(pkg)"
                        >
                          立即参与
                        </button>
                      </div>

                      <!-- 套餐对应的活动列表 -->
                      <div
                        v-if="pkg.activities && pkg.activities.length > 0"
                        class="package-activities"
                      >
                        <div class="activities-title">
                          <i class="el-icon-tickets"></i>
                          <span>包含活动 ({{ pkg.activities.length }}个)</span>
                        </div>
                        <ul class="activity-list">
                          <li
                            v-for="activity in pkg.activities.slice(0, 3)"
                            :key="activity.id"
                            class="activity-item"
                            @click="openDialog(activity)"
                          >
                            <span class="activity-name">{{
                              activity.name
                            }}</span>
                            <span class="activity-time">
                              {{ activity.location || "湖南工业大学" }}
                            </span>
                          </li>
                          <li
                            v-if="pkg.activities.length > 3"
                            class="more-activities"
                          >
                            还有 {{ pkg.activities.length - 3 }} 个活动...
                          </li>
                        </ul>
                      </div>

                      <!-- 无活动提示 -->
                      <div v-else class="no-activities">
                        <i class="el-icon-info"></i>
                        <span>该套餐暂无活动</span>
                      </div>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <el-empty
                    v-if="!packageLoading && packageList.length === 0"
                    description="该分类暂无套餐"
                    :image-size="80"
                  />
                </div>

                <!-- 弹窗底部 -->
                <div class="popup-footer">
                  <a href="#" @click.prevent="viewAllPackage">查看全部套餐</a>
                </div>
              </div>
            </div>

            <!-- 右侧：course活动安排区（完全独立） -->
            <div class="course">
              <h2>活动安排</h2>
              <div class="bd">
                <ul
                  v-for="(activity, index) in hotActivities.slice(0, 3)"
                  :key="index"
                >
                  <li>
                    <h4>名称 {{ activity.name }}</h4>
                    <p>
                      时间：正在进行时<br />地点:{{
                        activity.location || "湖南工业大学"
                      }}
                    </p>
                  </li>
                </ul>
                <a href="#" class="m">全部活动</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- banner部分结束 -->

      <!-- 精品推荐模块（个人标签） -->
      <div class="good w">
        <h3>个人标签</h3>
        <ul>
          <li><a href="#">运动达人</a></li>
          <li><a href="#">斜杠青年一枚</a></li>
          <li><a href="#">宇宙第一帅</a></li>
          <li><a href="#">萌新求带</a></li>
          <li><a href="#">羽毛球</a></li>
        </ul>
        <a href="#" class="mod">修改兴趣</a>
      </div>
      <!-- 精品推荐模块结束 -->

      <!-- 标签筛选（整合到核心内容前） -->
      <div class="w">
        <div class="section tags-section-wrapper">
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

        <!-- box核心内容（二课优秀活动推荐） -->
        <div class="box w">
          <div class="box-hd">
            <h3>二课优秀活动推荐</h3>
            <a href="#">查看全部</a>
          </div>
          <div class="box-bd">
            <ul class="clearfix" v-loading="loading" ref="activityList">
              <!-- 活动列表 -->
              <li
                v-for="(activity, index) in allActivities.slice(0, 10)"
                :key="activity.id"
                @click="openDialog(activity)"
              >
                <a href="javascript:;"
                  ><img
                    :src="
                      activity.image || '@/img/others' + (index + 1) + '.png'
                    "
                    alt="活动封面"
                /></a>
                <h4>{{ activity.name }}</h4>
                <div class="info">
                  <span>活动简介</span> •
                  {{ activity.description || "暂无简介" }}
                </div>
              </li>
              <el-empty
                v-if="allActivities.length === 0"
                description="暂无活动"
              ></el-empty>
            </ul>
          </div>
        </div>
        <!-- box核心内容结束 -->

        <!-- 原有分类活动展示（可选保留） -->
        <div
          v-for="category in displayCategories"
          :key="category.id"
          class="section category-activities"
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
    <div class="footer">
      <div class="w">
        <div class="cpoyright">
          <img src="@/img/bases/logo.png" alt="青年在线logo" />
          <p id="qq">
            青年在线，旨在为大学生们设置更加全面、完善的大学课余生活活动安排<br />Dedicated
            to serving college students
          </p>
          <a href="#" id="app">给我们点个赞吧</a>
        </div>
        <div class="links">
          <dl id="ccc">
            <dt id="r">关于青年在线网</dt>
            <dd><a href="#">关于我们</a></dd>
            <dd><a href="#">工作机会</a></dd>
            <dd><a href="#">客户服务</a></dd>
            <dd><a href="#">帮助</a></dd>
          </dl>
          <dl id="zzz">
            <dt id="t">新手指南</dt>
            <dd><a href="#">如何登录注册</a></dd>
            <dd><a href="#">如何修改标签</a></dd>
            <dd><a href="#">如何参与活动</a></dd>
            <dd><a href="#">二课积分的要求</a></dd>
            <dd><a href="#">什么是二课活动</a></dd>
          </dl>
          <dl id="xxx">
            <dt id="y">合作伙伴</dt>
            <dd><a href="#">合作群聊</a></dd>
            <dd><a href="#">合作伙伴</a></dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- 活动详情弹窗 -->
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
import { getActivityPage, getPackageActivityById } from "@/api/activity";
import { getCategoryList } from "@/api/category";
import { getCategoryPackage } from "@/api/package";
import ActivityCard from "@/components/ActivityCard.vue";
import ActivityDialog from "@/components/ActivityDialog.vue";

export default {
  name: "HomePage",
  components: {
    ActivityCard,
    ActivityDialog,
  },
  data() {
    return {
      searchKeyword: "",
      loading: false,
      dialogVisible: false,
      selectedActivity: {},
      selectedCategoryId: null,
      categories: [],
      activities: [],
      allActivities: [],

      packageList: [
        {
          id: 1,
          categoryId: 101,
          name: "新人专享套餐",
          categoryName: "新人福利",
          description: "新用户注册即可领取的专属套餐，包含50积分+优惠券",
          image: "https://example.com/img1.png",
          score: 50,
          status: 1, // 1-启用 0-禁用
          updateTime: "2025-12-01 10:20:30",
          createTime: "2025-11-30 09:10:20",
          activities: [
            { id: 101, activityId: 1, packageId: 1 },
            { id: 102, activityId: 2, packageId: 1 },
          ],
        },
        {
          id: 2,
          categoryId: 102,
          name: "月度会员套餐",
          categoryName: "会员权益",
          description: "月度会员专享，每月可领取100积分+专属折扣",
          image: "https://example.com/img2.png",
          score: 100,
          status: 1,
          updateTime: "2025-12-05 14:15:22",
          createTime: "2025-12-01 10:00:00",
          activities: [
            { id: 201, activityId: 1, packageId: 2 },
            { id: 202, activityId: 2, packageId: 2 },
          ],
        },
      ], // 存储当前分类的套餐数据
      packageActivityLoading: false,
      hoverCategoryId: null, // 当前悬浮的分类ID
      hoverCategoryTop: 0, // 弹窗顶部定位（对齐悬浮分类）
      currentCategoryName: "", // 当前分类名称
      packageLoading: false, // 套餐加载状态
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
  mounted() {
    // 初始化鼠标跟随滚动
    this.initMouseFollowScroll();
  },
  beforeUnmount() {
    // 移除鼠标滚动监听
    const activityList = this.$refs.activityList;
    if (activityList) {
      activityList.removeEventListener("mousemove", this.handleMouseMove);
    }
    document.body.classList.remove("dialog-open");
    this.$el.classList.remove("dialog-open");
  },
  watch: {
    dialogVisible(newVal) {
      if (newVal) {
        document.body.classList.add("dialog-open");
        this.$el.classList.add("dialog-open");
      } else {
        document.body.classList.remove("dialog-open");
        this.$el.classList.remove("dialog-open");
      }
    },
  },
  methods: {
    // 分类悬浮时触发：请求对应套餐 + 记录当前分类ID
    async handleCategoryHover(categoryId, event) {
      // 阻止事件冒泡，避免父元素触发mouseleave
      event.stopPropagation();
      // 1. 记录当前悬浮分类
      this.hoverCategoryId = categoryId;
      const currentCategory = this.categories.find((c) => c.id === categoryId);
      this.currentCategoryName = currentCategory?.name || "";

      // 2. 请求套餐数据
      await this.getPackageByCategoryId(categoryId);

      if (document.querySelector(`.subnav li[data-id="${categoryId}"]:hover`)) {
        this.hoverCategoryId = categoryId;
      }
    },

    // 调用套餐接口（根据分类ID查询）
    async getPackageByCategoryId(categoryId) {
      try {
        this.packageLoading = true;
        const response = await getCategoryPackage(categoryId);
        if (response.code === 0) {
          this.packageList = response.data;
          this.$forceUpdate();
        } else {
          this.$message.error(response.msg || "加载套餐失败");
          this.$nextTick(() => {
            // 强制触发v-show重新计算
            this.hoverCategoryId = categoryId;
          });
        }

        // 为每个套餐加载对应的活动列表
        const packageWithActivities = await Promise.all(
          this.packageList.map(async (pkg) => {
            const activityList = await getPackageActivityById(pkg.id);
            return {
              ...pkg, // 保留原套餐信息
              activityList, // 新增活动列表字段
              activityLoading: false, // 单个套餐活动加载状态（可选）
            };
          })
        );

        this.packageList = packageWithActivities;
      } catch (error) {
        console.error("加载套餐失败:", error);
        this.$message.error("加载套餐失败，请稍后再试");
      } finally {
        this.packageLoading = false;
      }
    },
    // 套餐点击事件
    handlePackageClick(pkg) {
      this.$message.success(`选择套餐：${pkg.name}`);
      // 可跳转套餐详情/参与页面
    },

    // 查看全部套餐
    viewAllPackage() {
      this.$router.push("/package/list"); // 跳转到套餐列表页
    },

    // 计算分类名称需要补充的空格数，保持原样式对齐
    getSpaceCount(name) {
      const baseLen = 8; // 基准字符长度
      // 修复：替换含控制字符的正则，改用 Unicode 范围匹配中文字符
      const getCharLen = (str) => {
        // 匹配所有非ASCII字符（中文字符等），替换为两个字符计算长度
        // [^\x20-\x7E] 匹配非可打印ASCII字符（避免\x00控制字符）
        return str.replace(/[^\x20-\x7E]/g, "aa").length;
      };
      const len = getCharLen(name);
      // 计算需要补充的空格数（一个&#160;对应一个空格）
      return Math.max(0, baseLen - len);
    },

    // 初始化鼠标跟随滚动
    initMouseFollowScroll() {
      const activityList = this.$refs.activityList;
      if (!activityList) return;

      // 绑定鼠标移动事件
      activityList.addEventListener("mousemove", (e) => {
        this.handleMouseMove(e, activityList);
      });
    },

    // 处理鼠标移动，同步滚动条位置
    handleMouseMove(e, container) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const scrollableWidth = container.scrollWidth - containerWidth;

      // 计算鼠标相对位置比例
      const mouseXInContainer = e.clientX - rect.left;
      const mouseRatio = mouseXInContainer / containerWidth;

      // 计算目标滚动位置
      const targetScrollLeft = Math.max(
        0,
        Math.min(scrollableWidth, mouseRatio * scrollableWidth)
      );

      // 平滑滚动
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    },

    async loadCategories() {
      try {
        const response = await getCategoryList();
        if (response.code === 0) {
          // 可在这里补充默认分类（如果接口返回为空）
          this.categories =
            response.data.length > 0
              ? response.data
              : [
                  { id: 1, name: "/青年", type: "核心分类" },
                  { id: 2, name: "社会科学", type: "知识类" },
                  { id: 3, name: "思想成长", type: "成长类" },
                  { id: 4, name: "志愿活动", type: "实践类" },
                  { id: 5, name: "文体活动", type: "文体类" },
                  { id: 6, name: "技能特长", type: "技能类" },
                  { id: 7, name: "其他类", type: "通用类" },
                  { id: 8, name: "孝亲近老", type: "公益类" },
                  { id: 9, name: "实践实习", type: "实践类" },
                ];
        } else {
          this.$message.error(response.msg || "加载分类失败");
        }
      } catch (error) {
        console.error("加载分类失败:", error);
        this.$message.error("加载分类失败，请稍后再试");
        // 接口失败时使用兜底分类
        this.categories = [
          { id: 1, name: "/青年", type: "核心分类" },
          { id: 2, name: "社会科学", type: "知识类" },
          { id: 3, name: "思想成长", type: "成长类" },
          { id: 4, name: "志愿活动", type: "实践类" },
          { id: 5, name: "文体活动", type: "文体类" },
          { id: 6, name: "技能特长", type: "技能类" },
          { id: 7, name: "其他类", type: "通用类" },
          { id: 8, name: "孝亲近老", type: "公益类" },
          { id: 9, name: "实践实习", type: "实践类" },
        ];
      }
    },

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

    getParticipantCount(activity) {
      return activity.participants ? activity.participants.length : 0;
    },

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
            this.allActivities = response.data.records;
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

    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId;
      this.loadActivities();
    },

    getActivitiesByCategory(categoryId) {
      if (!categoryId) return this.activities;
      return this.activities
        .filter((a) => a.categoryId === categoryId)
        .slice(0, 8);
    },

    openDialog(activity) {
      if (!activity || !activity.id) {
        this.$message.warning("活动信息异常，无法查看详情");
        return;
      }
      this.selectedActivity = { ...activity };
      this.dialogVisible = true;
    },

    handleDialogClose() {
      this.dialogVisible = false;
      this.selectedActivity = {};
    },

    handleActivityJoined() {
      this.loadActivities();
    },
  },
};
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  background: #f4f5f7;
  font-family: "Microsoft Yahei", sans-serif;
}

.w {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.header {
  height: 42px;
  margin: 30px auto;
  background-color: #f4f5f7;
}

.header .logo {
  float: left;
  background-image: url("@/img/bases/logo.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  width: 198px;
  height: 60px;
  margin-top: -9px;
}

li {
  float: left;
  list-style: none;
  margin: 0 15px;
}

.nav {
  float: left;
  margin-left: 60px;
}

.nav a {
  margin-top: 17px;
}

.nav ul li a {
  display: block;
  height: 42px;
  padding: 0 10px;
  line-height: 42px;
  font-size: 18px;
  color: #050505;
  text-decoration: none;
}

.nav ul li a:hover {
  font-size: 20px;
  transition: 0.3s;
  display: inline-block;
  color: red;
  transform: scale(1.2);
  border-bottom: 2px solid #90002180;
}

.serch {
  float: left;
  width: 412px;
  height: 42px;
  background-color: #f4f5f7;
  margin-left: 50px;
}

.serch input {
  float: left;
  width: 345px;
  height: 40px;
  border: 1px solid #93c5e0;
  border-right: 0;
  font-size: 14px;
  font-weight: 700;
  padding-left: 15px;
  margin-top: 1px;
  border-radius: 10px 0 0 10px;
}

input::placeholder {
  color: #bfbfbf;
}

input:focus {
  color: #900021;
  outline: none;
  border-bottom: 1px solid rgb(76, 59, 224);
  transition: 0.8s;
}

.iconfont {
  font-size: 30px;
  transition: 0.3s;
  display: inline-block;
}

i:hover {
  color: red;
  transform: scale(1.2);
}

.serch button {
  float: left;
  width: 50px;
  height: 42px;
  border: 0;
  background-color: #93c5e0;
  border-radius: 0 10px 10px 0;
  margin-top: 1px;
  cursor: pointer;
  color: #fff;
}

.user {
  float: right;
  line-height: 42px;
  margin-right: 30px;
  font-size: 14px;
  color: #666666;
  margin-top: 1px;
  display: flex;
  align-items: center;
}

.user img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  background: #e5e5e5;
}

/* banner区域 */
.banner {
  height: 421px;
  background-color: #93c5e0;
}

.banner .w {
  height: 421px;
  background-image: url("@/img/bases/banner.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;
}

/* banner布局容器：三列布局 */
.banner-layout {
  display: flex;
  height: 100%;
}

/* 左侧分类导航 */
.subnav {
  width: 18%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0; /* 防止收缩 */
  z-index: 10;
}

.subnav ul li {
  height: 45px;
  line-height: 45px;
  padding: 0 20px;
  width: 100%;
  margin: 0;
  position: relative;
}

.subnav ul li a {
  font-size: 14px;
  color: #fff;
  text-decoration: none;
  display: block;
  /* 强制单行显示，避免名称过长换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subnav ul li a span {
  float: right;
}

.subnav ul li a:hover {
  color: #900021;
}

.subnav li.active a {
  color: #900021;
}
.subnav li.active .arrow {
  color: #900021;
}

/* 中间套餐弹窗容器 */
.package-popup-container {
  flex: 1;
  position: relative;
  z-index: 5;
  margin-right: 240px;
}
.package-popup {
  display: block !important;
  width: 100%;
  max-height: 421px;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  /* 2. 开启垂直滚动，隐藏水平滚动（核心滚动属性） */
  overflow-y: auto; /* 内容超出时显示垂直滚动条 */
  overflow-x: hidden; /* 禁止水平滚动，避免边框变形 */
  /* 3. 优化滚动条样式（可选，提升美观度） */
  scrollbar-width: thin; /* 火狐：细滚动条 */
  scrollbar-color: rgba(255, 255, 255, 0.5) transparent; /* 火狐：滚动条颜色+背景 */
}

/* 4. 自定义Chrome/Edge等webkit内核浏览器的滚动条样式（可选） */
.package-popup::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
  height: 6px;
}
.package-popup::-webkit-scrollbar-track {
  background: transparent; /* 滚动条轨道透明 */
  border-radius: 3px;
}
.package-popup::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5); /* 滚动条滑块半透明白色 */
  border-radius: 3px; /* 滑块圆角，和容器呼应 */
}
.package-popup::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7); /*  hover时加深滑块 */
}

/* 移除指向分类的小箭头，因为弹窗已居中 */
.popup-arrow {
  display: none;
}

/* 弹窗头部 */
.popup-header {
  color: #fff;
  position: relative;
}
.popup-header h3 {
  font-size: 18px; /* 增大标题字体 */
  margin: 0;
  font-weight: 600;
}

/* 弹窗内容 */
.popup-body {
  max-height: 400px; /* 增加最大高度 */
  overflow-y: auto;
}

/* 弹窗底部 */
.popup-footer {
  padding: 12px 20px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}
.popup-footer a {
  font-size: 14px;
  color: #00a4ff;
  text-decoration: none;
}
.popup-footer a:hover {
  color: #0088ff;
}

/* 右侧course区域（完全独立） */
.course {
  width: 19%;
  height: 350px;
  margin-top: 50px;
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* 防止收缩 */
  position: absolute;
  right: 0;
  top: 0;
  z-index: 15; /* 确保在最上层，不受弹窗影响 */
  background: rgba(130, 110, 110, 0.7);
}

.course h2 {
  height: 48px;
  text-align: center;
  line-height: 48px;
  font-size: 18px;
  color: #fff;
  border-radius: 10px 10px 0 0;
  margin: 0;
}

.bd {
  padding: 0 20px;
}

.bd ul li {
  padding: 14px 0;
  border-bottom: 1px solid #cccccc;
  width: 100%;
  margin: 0;
}

.bd ul li h4 {
  font-size: 15px;
  color: #373636;
  margin: 0 0 5px 0;
}

.bd ul li p {
  font-size: 12px;
  color: #a5a5a5;
  margin: 0;
}

.bd .m {
  display: block;
  height: 38px;
  text-align: center;
  margin-top: 5px;
  line-height: 38px;
  color: #00a4ff;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

/* 精品推荐模块 */
.good {
  position: relative;
  height: 60px;
  background-color: #fff;
  margin-top: 10px;
  box-shadow: 0 2px 3px 3px rgba(0, 0, 0, 0.1);
  line-height: 60px;
  padding: 0 30px;
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.good::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 1260px;
  height: 60px;
  border-radius: 10px;
  background-color: skyblue;
  opacity: 0.3;
  transform: translateX(-1260px);
  transition: 1.8s;
}

.good:hover::before {
  transform: translateX(0);
}

.good h3,
ul,
a {
  position: relative;
  z-index: 10;
}

.good h3 {
  float: left;
  font-size: 16px;
  color: #00a4ff;
  margin: 0;
}

.good ul {
  float: left;
  margin-left: 30px;
}

.good ul li {
  float: left;
}

.good ul li a {
  padding: 0 30px;
  font-size: 16px;
  color: #050505;
  border-left: 1px solid #cccccc;
  text-decoration: none;
}

.mod {
  float: right;
  margin-left: 30px;
  font-size: 14px;
  color: #00a4ff;
  text-decoration: none;
}

/* 标签筛选容器 */
.tags-section-wrapper {
  margin-bottom: 20px;
  margin-top: 20px;
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

/* box核心内容 */
.box {
  margin-top: 30px;
  /* overflow: hidden; */
}

.box-hd {
  height: 45px;
}

.box-hd h3 {
  float: left;
  font-size: 20px;
  color: #494949;
  margin: 0;
}

.box-hd a {
  float: right;
  font-size: 12px;
  color: #a5a5a5;
  margin-top: 10px;
  text-decoration: none;
}

.box-hd a:hover {
  transition: 0.8s;
  display: inline-block;
  color: black;
  transform: scale(1.212);
}

.box-bd ul {
  width: 100%; /* 适配父容器宽度 */
  display: grid;
  /* 核心：固定4列，列间距15px，自动适配列宽 */
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 15px; /* 列+行间距，替代margin-right/margin-top */
  padding: 0; /* 清除默认ul内边距 */
  margin: 0; /* 清除默认ul外边距 */
  /* 保留隐藏滚动条（现在不需要滚动，可删除） */
  overflow-x: hidden;
  overflow-y: hidden;
  scrollbar-width: none;
}

.box-bd ul::-webkit-scrollbar {
  display: none;
}

.box-bd ul li {
  float: none;
  width: 100%; /* 适配Grid列宽 */
  height: 300px;
  background-color: #fff;
  margin: 0; /* 清除原有margin */
  border-radius: 10px;
  cursor: pointer;
  /* 可选：防止卡片被挤压 */
  flex-shrink: 0;
}

.box-bd ul li img {
  border-radius: 10px;
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: #f0f2f5;
}

.box-bd ul li:hover {
  box-shadow: 0 0 20px 2px rgba(196, 110, 110, 0.5);
}

.box-bd ul li img:hover {
  box-shadow: 0 0 20px 2px rgba(218, 49, 49, 0.5);
}

.box-bd ul li h4 {
  margin: 10px 10px 20px 10px;
  font-size: 14px;
  color: #050505;
  font-weight: 400;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.box-bd .info {
  margin: 10px;
  font-size: 14px;
  color: #999999;
}

.box-bd .info span {
  color: #ff7c2d;
}

/* 分类活动样式 */
.category-activities {
  margin: 60px 0 60px 0;
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

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 底部样式 */
.footer {
  height: 415px;
  background-color: #fff;
  margin-top: 50px;
}

.footer .w {
  margin-top: 30px;
  padding: 35px;
  overflow: hidden;
}

.cpoyright {
  float: left;
}

.cpoyright img {
  height: 60px;
  margin-bottom: 10px;
  background: #409eff;
  border-radius: 4px;
}

#qq {
  font-size: 12px;
  color: #666666;
  margin: 20px 0 15px 0;
  line-height: 1.5;
}

#app {
  display: block;
  text-align: center;
  color: #f57da0;
  font-size: 16px;
  border-radius: 10px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  width: 120px;
  padding: 8px 0;
}

.links {
  float: right;
}

.links dl {
  float: left;
  margin-left: 100px;
}

#r,
#t,
#y {
  font-size: 20px;
  color: #333333;
  margin-bottom: 10px;
}

.links dl dt {
  font-size: 16px;
  color: #333333;
  margin-bottom: 5px;
}

.links dl dd {
  margin: 0 0 8px 0;
}

.links dl dd a {
  font-size: 12px;
  color: #333333;
  text-decoration: none;
}

.links dl dd a:hover {
  color: #409eff;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header {
    height: auto;
    margin: 15px auto;
    padding: 10px 0;
  }

  .logo {
    float: none;
    margin: 0 auto 10px;
  }

  .nav,
  .serch,
  .user {
    float: none;
    margin: 10px auto;
    width: 90%;
  }

  .banner {
    height: auto;
  }

  .banner .w {
    height: auto;
    padding: 20px 0;
  }

  .banner-layout {
    flex-direction: column;
  }

  .subnav,
  .course {
    float: none;
    width: 100%;
    height: auto;
    margin: 0 0 20px 0;
    position: static;
  }

  .package-popup-container {
    margin-right: 0;
  }

  .box-bd ul li {
    width: calc(50% - 10px);
    margin-right: 10px;
  }

  .links {
    float: none;
    margin-top: 20px;
  }

  .links dl {
    float: none;
    margin-left: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .box-bd ul li {
    width: 100%;
    margin-right: 0;
  }

  .serch input {
    width: calc(100% - 50px);
  }
}

/* 弹窗滚动控制 */
.dialog-open {
  overflow: hidden;
}
</style>

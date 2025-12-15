<template>
  <el-card
    :body-style="{ padding: '0px' }"
    class="activity-card"
    @click.native="handleClick"
  >
    <div class="image-wrapper">
      <!-- 使用真实API数据结构的image字段 -->
      <img :src="activity.image" class="activity-image" :alt="activity.name" />
      <!-- 根据status状态显示标签，status=1表示进行中 -->
      <el-tag v-if="activity.status === 1" type="success" class="status-tag">
        进行中
      </el-tag>
      <el-tag v-else type="info" class="status-tag"> 已结束 </el-tag>
    </div>
    <div class="card-content">
      <!-- 使用API的name字段而不是title -->
      <h3 class="activity-title">{{ activity.name }}</h3>
      <p class="activity-desc">{{ activity.description }}</p>
      <div class="activity-meta">
        <div class="meta-item">
          <i class="el-icon-time"></i>
          <!-- 显示endTime结束时间 -->
          <span>{{ activity.endTime }}</span>
        </div>
        <div class="meta-item">
          <i class="el-icon-folder-opened"></i>
          <!-- 显示categoryName分类名称 -->
          <span>{{ activity.categoryName }}</span>
        </div>
      </div>
      <div class="activity-footer">
        <div class="participants">
          <i class="el-icon-user"></i>
          <!-- 使用participants数组的长度作为参与人数 -->
          <span>{{ participantCount }}人已参加</span>
        </div>
        <!-- 使用categoryName显示分类标签 -->
        <el-tag :type="getCategoryType(activity.categoryName)" size="small">
          {{ activity.categoryName }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "ActivityCard",
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  computed: {
    participantCount() {
      return this.activity.participants ? this.activity.participants.length : 0;
    },
  },
  methods: {
    handleClick() {
      this.$emit("click", this.activity);
    },
    getCategoryType(categoryName) {
      const types = {
        户外活动: "success",
        学习培训: "primary",
        团建活动: "warning",
        商务活动: "info",
        文化活动: "",
        公益活动: "success",
      };
      return types[categoryName] || "";
    },
  },
};
</script>

<style scoped>
.activity-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.05);
}

.status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: bold;
}

.card-content {
  padding: 16px;
}

.activity-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
  font-size: 13px;
  color: #909399;
}

.meta-item i {
  margin-right: 4px;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.participants {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.participants i {
  margin-right: 4px;
}
</style>

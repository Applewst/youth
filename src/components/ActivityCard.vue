<template>
  <div class="activity-card">
    <div class="card-image">
      <img :src="activity.image" :alt="activity.title" />
      <div class="card-overlay">
        <el-button type="primary" size="small" @click="handleJoin">
          参与活动
        </el-button>
      </div>
    </div>
    <div class="card-content">
      <h4 class="card-title">{{ activity.title }}</h4>
      <div class="card-info">
        <span class="info-label">活动简介</span> • {{ activity.description }}
      </div>
      <div class="card-meta">
        <el-tag size="mini" :type="getStatusType(activity.status)">
          {{ getStatusText(activity.status) }}
        </el-tag>
        <span class="card-time">{{ formatTime(activity.startTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivityCard',
  props: {
    activity: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        title: '',
        description: '',
        image: '',
        status: 'ongoing',
        startTime: '',
        location: ''
      })
    }
  },
  methods: {
    handleJoin() {
      this.$emit('join', this.activity)
    },
    getStatusType(status) {
      const statusMap = {
        'ongoing': 'success',
        'upcoming': 'warning',
        'ended': 'info'
      }
      return statusMap[status] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        'ongoing': '进行中',
        'upcoming': '即将开始',
        'ended': '已结束'
      }
      return statusMap[status] || '未知'
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.activity-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.activity-card:hover .card-overlay {
  opacity: 1;
}

.card-content {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info {
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-label {
  color: #409eff;
  font-weight: 500;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: #999;
}
</style>

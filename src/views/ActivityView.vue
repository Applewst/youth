<template>
  <div class="activity-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="活动名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入活动名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input
            v-model="queryParams.categoryId"
            placeholder="请输入分类名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-card">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd"
        >新增活动</el-button
      >
    </el-card>

    <!-- 表格数据 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="activityList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="活动名称" min-width="150">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类名称" width="120">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.categoryName }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.description }}
          </template>
        </el-table-column>
        <el-table-column prop="image" label="图片" width="100">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEmpty && scope.row.image">
              <el-image
                :src="scope.row.image"
                :preview-src-list="[scope.row.image]"
                style="width: 60px; height: 60px"
              />
            </template>
            <span v-else> </span>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与者" width="150">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEmpty">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag type="info" size="small">
                  {{
                    scope.row.participants ? scope.row.participants.length : 0
                  }}
                  人
                </el-tag>
                <el-button
                  type="text"
                  icon="el-icon-user"
                  size="small"
                  @click="handleViewParticipants(scope.row)"
                >
                  查看
                </el-button>
              </div>
            </template>
            <span v-else> </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEmpty">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
            <span v-else> </span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.startTime }}
          </template>
        </el-table-column>
        <el-table-column prop="beginTime" label="报名时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.beginTime }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="maxNumber" label="最大参与人数" width="180">
          <template slot-scope="scope">
            {{ scope.row.isEmpty ? " " : scope.row.maxNumber }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEmpty">
              <div v-if="scope.row.status === 1">
                <el-button
                  type="text"
                  icon="el-icon-edit"
                  size="small"
                  @click="handleUpdate(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  size="small"
                  style="color: #f56c6c"
                  @click="handleDelete(scope.row)"
                  >删除</el-button
                >
                <el-button
                  type="text"
                  icon="el-icon-switch-button"
                  size="small"
                  style="color: #e6a23c"
                  @click="handleDisable(scope.row)"
                  >禁用</el-button
                >
              </div>
              <div v-else>
                <el-button
                  type="text"
                  icon="el-icon-refresh-left"
                  size="small"
                  style="color: #67c23a"
                  @click="handleMakeUp(scope.row)"
                  >补签</el-button
                >
                <el-button
                  type="text"
                  icon="el-icon-share"
                  size="small"
                  style="color: #409eff"
                  @click="handleGrantPoints(scope.row)"
                  >发放二课分</el-button
                >
              </div>
            </template>
            <span v-else> </span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="1100px"
      @close="handleDialogClose"
      class="activity-dialog"
    >
      <el-form
        ref="activityForm"
        :model="activityForm"
        :rules="activityRules"
        label-width="100px"
        class="activity-form"
      >
        <!-- 单列布局，避免左右滚动 -->
        <div class="form-content">
          <!-- 基础信息区域 -->
          <div class="form-group">
            <h4 class="group-title">基础信息</h4>
            <div class="form-row">
              <el-form-item label="活动名称" prop="name" class="form-item">
                <el-input
                  v-model="activityForm.name"
                  placeholder="请输入活动名称"
                />
              </el-form-item>
              <el-form-item
                label="分类名称"
                prop="categoryId"
                class="form-item"
              >
                <el-select
                  v-model="activityForm.categoryId"
                  placeholder="请选择分类"
                  filterable
                  clearable
                  v-loading="categoryLoading"
                >
                  <el-option
                    v-for="item in categoryList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="最大参与人数"
                prop="maxNumber"
                class="form-item"
              >
                <el-input-number
                  v-model="activityForm.maxNumber"
                  :min="0"
                  placeholder="请输入最大参与人数"
                  @wheel.native.prevent
                />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="状态" prop="status" class="form-item">
                <el-radio-group v-model="activityForm.status">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="报名时间" prop="beginTime" class="form-item">
                <el-date-picker
                  v-model="activityForm.beginTime"
                  type="datetime"
                  placeholder="请选择报名时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledPastDate"
                  :disabled-time="disabledPastTime"
                />
              </el-form-item>
              <el-form-item label="开始时间" prop="startTime" class="form-item">
                <el-date-picker
                  v-model="activityForm.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledPastDate"
                  :disabled-time="
                    (date) => disabledTimeBeforeBegin(date, 'begin')
                  "
                />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="结束时间" prop="endTime" class="form-item">
                <el-date-picker
                  v-model="activityForm.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledPastDate"
                  :disabled-time="
                    (date) => disabledTimeBeforeBegin(date, 'start')
                  "
                />
              </el-form-item>
              <el-form-item label="活动图片" prop="image" class="form-item">
                <el-upload
                  class="simple-upload"
                  action="#"
                  :http-request="handleUpload"
                  :before-upload="beforeUpload"
                  :auto-upload="true"
                  :show-file-list="false"
                >
                  <el-button type="primary" icon="el-icon-upload"
                    >选择图片</el-button
                  >
                </el-upload>
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
                <el-input
                  v-model="activityForm.image"
                  placeholder="图片地址（上传后自动填充）"
                  style="display: none"
                />
              </el-form-item>
            </div>

            <el-form-item
              label="描述"
              prop="description"
              class="form-item full-width"
            >
              <el-input
                v-model="activityForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入活动描述"
              />
            </el-form-item>
          </div>

          <!-- 参与人员分数区域（步长0.5） -->
          <div class="form-group">
            <h4 class="group-title">参与人员分数</h4>
            <div class="participant-score-container">
              <label class="score-label">参与人员分数：</label>
              <el-input-number
                v-model="activityForm.participantScore"
                :min="0"
                :step="0.5"
                :precision="1"
                placeholder="请输入参与人员分数（步长0.5）"
                class="score-input"
                controls-position="right"
                @wheel.native.prevent
              />
            </div>
          </div>

          <!-- 管理人员区域（修复查询保留选中状态） -->
          <div class="form-group">
            <h4 class="group-title">管理人员</h4>
            <!-- 管理人员查询区域 -->
            <el-form
              :inline="true"
              :model="studentQuery"
              class="manager-search-form"
            >
              <el-form-item label="学生姓名">
                <el-input
                  v-model="studentQuery.name"
                  placeholder="请输入学生姓名"
                  @keyup.enter.native="getStudentList"
                  class="search-input"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="getStudentList"
                  size="small"
                >
                  查询
                </el-button>
                <el-button
                  type="default"
                  icon="el-icon-refresh"
                  @click="resetStudentQuery"
                  size="small"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 学生列表（可选择，查询后保留选中状态） -->
            <el-table
              ref="studentTable"
              :data="studentList"
              border
              style="width: 100%; margin-top: 10px"
              max-height="180"
              @selection-change="handleStudentSelectionChange"
              v-loading="studentLoading"
              class="student-table"
              :row-key="(row) => row.id"
              :reserve-selection="true"
            >
              <el-table-column
                type="selection"
                width="55"
                :selectable="
                  (row) => {
                    // 禁止选择已选中的人员（避免重复）
                    return !this.selectedStudentList.some(
                      (item) => item.id === row.id
                    );
                  }
                "
              />
              <el-table-column prop="id" label="学生ID" width="100" />
              <el-table-column prop="name" label="姓名" min-width="120" />
              <el-table-column prop="className" label="班级" width="150" />
            </el-table>

            <!-- 学生分页 -->
            <el-pagination
              style="margin-top: 10px; text-align: right"
              @size-change="handleStudentSizeChange"
              @current-change="handleStudentCurrentChange"
              :current-page="studentQuery.page"
              :page-sizes="[5, 10, 20]"
              :page-size="studentQuery.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="studentTotal"
              small
            />

            <!-- 已选管理人员 + 统一分数 -->
            <div class="selected-manager-container" style="margin-top: 15px">
              <!-- 选中人员展示 -->
              <div
                v-if="selectedStudentList.length > 0"
                class="manager-info-card"
              >
                <div class="manager-info-header">
                  <span class="info-label">已选管理人员：</span>
                  <span class="info-value"
                    >{{ selectedStudentList.length }} 人</span
                  >
                </div>
                <div class="manager-tags">
                  <el-tag
                    v-for="student in selectedStudentList"
                    :key="student.id"
                    closable
                    @close="removeSelectedStudent(student.id)"
                    style="margin: 5px 5px 5px 0"
                  >
                    {{ student.name }}（ID：{{ student.id }}）
                  </el-tag>
                </div>
                <div class="manager-score-container">
                  <label class="score-label">管理人员统一分数：</label>
                  <el-input-number
                    v-model="activityForm.managerScore"
                    :min="0"
                    :step="0.5"
                    :precision="1"
                    placeholder="请输入管理人员分数（步长0.5）"
                    class="score-input"
                    controls-position="right"
                    @wheel.native.prevent
                  />
                </div>
              </div>
              <div v-else class="empty-tip">暂无选中的管理人员</div>
            </div>
          </div>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 补签对话框 -->
    <el-dialog
      title="补签管理"
      :visible.sync="makeUpDialogVisible"
      width="900px"
    >
      <el-form :inline="true" :model="retroactiveQuery" class="mb-20">
        <el-form-item label="活动ID">
          <el-input v-model="retroactiveQuery.activityId" disabled />
        </el-form-item>
        <el-form-item label="人员名称">
          <el-input
            v-model="retroactiveQuery.name"
            placeholder="请输入人员名称"
            @keyup.enter.native="getRetroactiveList"
          />
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select
            v-model="retroactiveQuery.registrationStatus"
            placeholder="请选择报名状态"
            clearable
          >
            <el-option label="已报名" value="REGISTERED" />
            <el-option label="已签到" value="APPLIED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getRetroactiveList"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="retroactiveList"
        border
        style="width: 100%"
        @selection-change="handleRetroactiveSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="人员ID" width="100" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="registrationStatus" label="报名状态" width="120">
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.registrationStatus === 'REGISTERED'
                  ? 'success'
                  : 'primary'
              "
            >
              {{
                scope.row.registrationStatus === "REGISTERED"
                  ? "已报名"
                  : "已申请"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="补签理由" min-width="200">
          <template slot-scope="scope">
            <el-input v-model="scope.row.reason" placeholder="请输入补签理由" />
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 15px; text-align: right"
        @size-change="handleRetroactiveSizeChange"
        @current-change="handleRetroactiveCurrentChange"
        :current-page="retroactiveQuery.page"
        :page-sizes="[10, 20, 50]"
        :page-size="retroactiveQuery.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="retroactiveTotal"
      />

      <div slot="footer" class="dialog-footer">
        <el-button @click="makeUpDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmitMakeUp"
          :disabled="selectedRetroactiveList.length === 0"
        >
          确定补签
        </el-button>
      </div>
    </el-dialog>

    <!-- 发放二课分对话框 -->
    <el-dialog
      :title="`发放二课分 - 活动ID：${grantPointsForm.activityId}`"
      :visible.sync="grantPointsDialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <div style="padding: 20px; text-align: center; font-size: 16px">
        确定要为该活动发放二课分吗？
        <div style="margin-top: 10px; color: #909399; font-size: 14px">
          二课分ID：{{ grantPointsForm.activityId }}（与活动ID一致）
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="grantPointsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitGrantPoints"
          >确定发放</el-button
        >
      </div>
    </el-dialog>

    <!-- 参与者查看对话框 -->
    <el-dialog
      title="参与者查看"
      :visible.sync="participantsDialogVisible"
      width="800px"
      @close="handleParticipantsDialogClose"
    >
      <div class="participants-view">
        <div class="view-section">
          <h4>参与人员信息</h4>
          <div class="participant-score-view">
            <label>参与人员分数：</label>
            <span class="score-value">{{
              currentActivity?.participantScore || 0
            }}</span>
          </div>
        </div>

        <div class="view-section" style="margin-top: 20px">
          <h4>管理人员信息</h4>
          <div v-if="currentActivity?.managerInfo" class="manager-info-view">
            <div class="participant-score-view">
              <label>管理人员统一分数：</label>
              <span class="score-value">{{
                currentActivity.managerInfo.score || 0
              }}</span>
            </div>
            <div style="margin-top: 10px">
              <span class="info-label">管理人员列表：</span>
              <div class="manager-tags-view">
                <el-tag
                  v-for="manager in currentActivity.managerInfo.managerIds
                    .split(',')
                    .map((id) => ({
                      id: id,
                      name: currentActivity.managerNames[id] || `ID:${id}`,
                    }))"
                  :key="manager.id"
                  style="margin: 5px 5px 5px 0"
                >
                  {{ manager.name }}（ID：{{ manager.id }}）
                </el-tag>
              </div>
            </div>
          </div>
          <div v-else style="color: #999; padding: 10px">暂无管理人员信息</div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="participantsDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getActivityPage,
  addActivity,
  updateActivity,
  deleteActivity,
  disableActivity,
  makeUpActivity,
  grantActivityPoints,
  getRetroactivePage,
} from "@/api/activity";
import { getCategoryList } from "@/api/category";
import { uploadFile } from "@/api/upload";
import { getStudentPage } from "@/api/student";

export default {
  data() {
    // 时间校验规则
    const validateBeginTime = (rule, value, callback) => {
      if (!value) return callback(new Error("请选择报名时间"));
      const beginStamp = new Date(value).getTime();
      const now = new Date().getTime();
      if (beginStamp < now)
        return callback(new Error("报名时间不能早于当前时间"));
      if (
        this.activityForm.startTime &&
        beginStamp >= new Date(this.activityForm.startTime).getTime()
      ) {
        return callback(new Error("报名时间必须早于开始时间"));
      }
      callback();
    };
    const validateStartTime = (rule, value, callback) => {
      if (!value) return callback(new Error("请选择开始时间"));
      const startStamp = new Date(value).getTime();
      const now = new Date().getTime();
      if (startStamp < now)
        return callback(new Error("开始时间不能早于当前时间"));
      if (
        this.activityForm.beginTime &&
        startStamp <= new Date(this.activityForm.beginTime).getTime()
      ) {
        return callback(new Error("开始时间必须晚于报名时间"));
      }
      if (
        this.activityForm.endTime &&
        startStamp >= new Date(this.activityForm.endTime).getTime()
      ) {
        return callback(new Error("开始时间必须早于结束时间"));
      }
      callback();
    };
    const validateEndTime = (rule, value, callback) => {
      if (!value) return callback(new Error("请选择结束时间"));
      const endStamp = new Date(value).getTime();
      const now = new Date().getTime();
      if (endStamp < now)
        return callback(new Error("结束时间不能早于当前时间"));
      if (
        this.activityForm.startTime &&
        endStamp <= new Date(this.activityForm.startTime).getTime()
      ) {
        return callback(new Error("结束时间必须晚于开始时间"));
      }
      callback();
    };
    // 参与人员分数校验
    const validateParticipantScore = (rule, value, callback) => {
      if (value === undefined || value === null || value < 0) {
        return callback(new Error("请输入有效的参与人员分数（≥0）"));
      }
      callback();
    };

    return {
      queryParams: {
        page: 1,
        pageSize: 10,
        name: "",
        categoryId: "",
        status: "",
      },
      activityList: [],
      total: 0,
      loading: false,
      dialogVisible: false,
      dialogTitle: "",
      // 核心表单数据
      activityForm: {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        startTime: "",
        beginTime: "",
        status: 1,
        maxNumber: 0,
        participantScore: 0, // 参与人员分数（步长0.5）
        managerScore: 0, // 管理人员统一分数（步长0.5）
      },
      activityRules: {
        name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请选择分类", trigger: "change" },
          { type: "number", message: "分类ID必须为数字", trigger: "change" },
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }],
        beginTime: [{ validator: validateBeginTime, trigger: "change" }],
        startTime: [{ validator: validateStartTime, trigger: "change" }],
        endTime: [{ validator: validateEndTime, trigger: "change" }],
        participantScore: [
          { validator: validateParticipantScore, trigger: "change" },
        ],
      },
      // 补签相关
      makeUpDialogVisible: false,
      retroactiveQuery: {
        activityId: "",
        name: "",
        page: 1,
        pageSize: 10,
        registrationStatus: "",
      },
      retroactiveList: [],
      retroactiveTotal: 0,
      selectedRetroactiveList: [],
      // 发放二课分相关
      grantPointsDialogVisible: false,
      grantPointsForm: { activityId: "" },
      // 分类相关
      categoryList: [],
      categoryLoading: false,
      // 学生查询相关（管理人员）- 修复查询保留选中状态
      studentQuery: { page: 1, pageSize: 5, name: "" },
      studentList: [],
      studentTotal: 0,
      studentLoading: false,
      selectedStudentList: [], // 选中的管理人员列表（持久化）
      // 参与者查看
      participantsDialogVisible: false,
      currentActivity: null,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 时间禁用规则
    disabledPastDate(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0));
    },
    disabledPastTime(date) {
      const now = new Date();
      if (new Date(date).toDateString() === now.toDateString()) {
        return {
          hours: Array.from({ length: now.getHours() }, (_, i) => i),
          minutes:
            now.getHours() === new Date().getHours()
              ? Array.from({ length: now.getMinutes() }, (_, i) => i)
              : [],
          seconds:
            now.getMinutes() === new Date().getMinutes()
              ? Array.from({ length: now.getSeconds() }, (_, i) => i)
              : [],
        };
      }
      return { hours: [], minutes: [], seconds: [] };
    },
    disabledTimeBeforeBegin(date, type) {
      const targetTime =
        type === "begin"
          ? this.activityForm.beginTime
          : this.activityForm.startTime;
      if (!targetTime) return this.disabledPastTime(date);
      const currentStamp = new Date(date).getTime();
      const targetStamp = new Date(targetTime).getTime();
      if (
        new Date(date).toDateString() === new Date(targetTime).toDateString()
      ) {
        const targetDate = new Date(targetTime);
        return {
          hours: Array.from({ length: targetDate.getHours() }, (_, i) => i),
          minutes:
            targetDate.getHours() === new Date(date).getHours()
              ? Array.from({ length: targetDate.getMinutes() }, (_, i) => i)
              : [],
          seconds:
            targetDate.getMinutes() === new Date(date).getMinutes()
              ? Array.from({ length: targetDate.getSeconds() }, (_, i) => i)
              : [],
        };
      }
      if (currentStamp < targetStamp) {
        return {
          hours: Array.from({ length: 24 }, (_, i) => i),
          minutes: Array.from({ length: 60 }, (_, i) => i),
          seconds: Array.from({ length: 60 }, (_, i) => i),
        };
      }
      return { hours: [], minutes: [], seconds: [] };
    },
    // 获取分类列表
    async getCategoryList() {
      this.categoryLoading = true;
      try {
        this.categoryList = (await getCategoryList(1)) || [];
      } catch (error) {
        console.error("获取分类失败:", error);
        this.$message.error("获取分类数据失败");
      } finally {
        this.categoryLoading = false;
      }
    },
    // 图片上传
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) this.$message.error("只能上传图片文件！");
      if (!isLt2M) this.$message.error("图片大小不能超过2MB！");
      return isImage && isLt2M;
    },
    async handleUpload(options) {
      try {
        this.activityForm.image = await uploadFile(options.file);
        this.$message.success("图片上传成功！");
      } catch (err) {
        this.$message.error("上传失败：" + err.message);
      }
    },
    // 获取活动列表
    async getList() {
      this.loading = true;
      try {
        const response = await getActivityPage(this.queryParams);
        const realActivityList = (response.records || []).map((item) => ({
          ...item,
          isEmpty: false,
          participantScore:
            (item.participantList && item.participantList[0]?.score) || 0,
          managerInfo: item.managerInfo || { score: 0, managerIds: "" },
          managerNames: item.managerNames || {},
        }));
        const emptyRowCount =
          this.queryParams.pageSize - realActivityList.length;
        const emptyRows = Array.from({ length: emptyRowCount }).map(
          (_, index) => ({
            id: `empty-activity-${this.queryParams.page}-${index}`,
            name: "",
            categoryName: "",
            description: "",
            image: "",
            participants: [],
            status: "",
            endTime: "",
            isEmpty: true,
          })
        );
        this.activityList = [...realActivityList, ...emptyRows];
        this.total = response.total || 0;
      } catch (error) {
        console.error("获取活动列表失败:", error);
        this.activityList = Array.from({
          length: this.queryParams.pageSize,
        }).map((_, index) => ({
          id: `empty-activity-error-${index}`,
          name: "",
          categoryName: "",
          description: "",
          image: "",
          participants: [],
          status: "",
          endTime: "",
          isEmpty: true,
        }));
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    // 搜索/重置/分页
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        pageSize: 10,
        name: "",
        categoryId: "",
        status: "",
      };
      this.getList();
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getList();
    },
    // 新增/编辑活动
    async handleAdd() {
      this.dialogTitle = "新增活动";
      this.activityForm = {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        startTime: "",
        beginTime: "",
        status: 1,
        maxNumber: 0,
        participantScore: 0,
        managerScore: 0,
      };
      this.studentQuery = { page: 1, pageSize: 5, name: "" };
      this.studentList = [];
      this.studentTotal = 0;
      this.selectedStudentList = [];
      this.dialogVisible = true;
      await this.getCategoryList();
      this.$nextTick(() => this.$refs.activityForm?.clearValidate());
    },
    async handleUpdate(row) {
      this.dialogTitle = "编辑活动";
      this.activityForm = JSON.parse(
        JSON.stringify({
          ...row,
          participantScore: row.participantScore || 0,
          managerScore: row.managerInfo?.score || 0,
        })
      );
      this.studentQuery = { page: 1, pageSize: 5, name: "" };
      this.studentList = [];
      this.studentTotal = 0;
      // 解析管理人员ID并回显选中状态
      this.selectedStudentList = [];
      if (row.managerInfo?.managerIds) {
        const managerIds = row.managerInfo.managerIds
          .split(",")
          .filter((id) => id);
        // 调用接口获取管理人员详情
        try {
          // 实际项目中替换为批量查询接口
          const res = await getStudentPage({
            page: 1,
            pageSize: 100,
            ids: managerIds.join(","), // 假设接口支持ID批量查询
          });
          this.selectedStudentList =
            res.records ||
            managerIds.map((id) => ({
              id: id,
              name: row.managerNames[id] || `未知(${id})`,
              className: "",
            }));
        } catch (error) {
          console.error("获取管理人员详情失败:", error);
          this.selectedStudentList = managerIds.map((id) => ({
            id: id,
            name: row.managerNames[id] || `未知(${id})`,
            className: "",
          }));
        }
      }
      this.dialogVisible = true;
      await this.getCategoryList();
      // 初始化学生列表
      this.getStudentList();
      this.$nextTick(() => this.$refs.activityForm?.clearValidate());
    },
    // 删除/禁用活动
    handleDelete(row) {
      this.$confirm(`确定要删除活动"${row.name}"吗？`, "提示", {
        type: "warning",
      })
        .then(async () => {
          await deleteActivity(row.id);
          this.$message.success("删除成功");
          this.getList();
        })
        .catch(() => this.$message.info("已取消删除"));
    },
    handleDisable(row) {
      this.$confirm(`确定要禁用活动"${row.name}"吗？`, "提示", {
        type: "warning",
      })
        .then(async () => {
          await disableActivity(row.id, { status: 0 });
          this.$message.success("禁用成功");
          this.getList();
        })
        .catch(() => this.$message.info("已取消禁用"));
    },
    // 补签相关
    handleMakeUp(row) {
      this.retroactiveQuery = {
        activityId: row.id,
        name: "",
        page: 1,
        pageSize: 10,
        registrationStatus: "",
      };
      this.makeUpDialogVisible = true;
      this.getRetroactiveList();
    },
    async getRetroactiveList() {
      this.loading = true;
      try {
        const response = await getRetroactivePage(this.retroactiveQuery);
        this.retroactiveList = (response.data.records || []).map((item) => ({
          ...item,
          reason: "",
        }));
        this.retroactiveTotal = response.data.total || 0;
      } catch (error) {
        console.error("获取补签人员失败:", error);
        this.$message.error("获取补签人员失败");
      } finally {
        this.loading = false;
      }
    },
    handleRetroactiveSizeChange(val) {
      this.retroactiveQuery.pageSize = val;
      this.getRetroactiveList();
    },
    handleRetroactiveCurrentChange(val) {
      this.retroactiveQuery.page = val;
      this.getRetroactiveList();
    },
    handleRetroactiveSelectionChange(val) {
      this.selectedRetroactiveList = val;
    },
    async handleSubmitMakeUp() {
      if (this.selectedRetroactiveList.some((item) => !item.reason.trim())) {
        return this.$message.error("请为选中的人员填写补签理由");
      }
      try {
        const retroactiveDTOList = this.selectedRetroactiveList.map((item) => ({
          studentId: item.id,
          reason: item.reason.trim(),
        }));
        await makeUpActivity(
          this.retroactiveQuery.activityId,
          JSON.stringify(retroactiveDTOList)
        );
        this.$message.success("补签成功");
        this.makeUpDialogVisible = false;
        this.getList();
      } catch (error) {
        console.error("补签失败:", error);
        this.$message.error("补签失败：" + (error.msg || "接口请求异常"));
      }
    },
    // 发放二课分
    handleGrantPoints(row) {
      this.grantPointsForm = { activityId: row.id };
      this.grantPointsDialogVisible = true;
    },
    async handleSubmitGrantPoints() {
      try {
        await grantActivityPoints({
          secondClassId: this.grantPointsForm.activityId,
        });
        this.$message.success("二课分发放成功");
        this.grantPointsDialogVisible = false;
        this.getList();
      } catch (error) {
        console.error("发放二课分失败:", error);
        this.$message.error("发放二课分失败：" + (error.msg || "接口请求异常"));
      }
    },
    // 管理人员管理（修复查询保留选中状态）
    async getStudentList() {
      this.studentLoading = true;
      try {
        const res = await getStudentPage({
          page: this.studentQuery.page,
          pageSize: this.studentQuery.pageSize,
          name: this.studentQuery.name,
        });
        this.studentList = res.records || [];

        // 关键修复：查询后保留已选中人员的勾选状态
        this.$nextTick(() => {
          if (this.$refs.studentTable && this.selectedStudentList.length > 0) {
            // 获取当前页数据中已选中的人员ID
            const currentPageSelectedIds = this.selectedStudentList
              .map((item) => item.id)
              .filter((id) => this.studentList.some((row) => row.id === id));

            // 勾选当前页中已选中的人员
            currentPageSelectedIds.forEach((id) => {
              const row = this.studentList.find((item) => item.id === id);
              if (row) {
                this.$refs.studentTable.toggleRowSelection(row, true);
              }
            });
          }
        });

        this.studentTotal = res.total || 0;
      } catch (error) {
        console.error("获取学生列表失败:", error);
        this.$message.error("获取学生列表失败");
        this.studentList = [];
      } finally {
        this.studentLoading = false;
      }
    },
    // 重置学生查询
    resetStudentQuery() {
      this.studentQuery = { page: 1, pageSize: 5, name: "" };
      this.getStudentList();
    },
    handleStudentSizeChange(val) {
      this.studentQuery.pageSize = val;
      this.getStudentList();
    },
    handleStudentCurrentChange(val) {
      this.studentQuery.page = val;
      this.getStudentList();
    },
    // 选中学生变化处理（避免重复选择）
    handleStudentSelectionChange(val) {
      // 只处理新增选中的人员（排除已选中的）
      const newSelected = val.filter(
        (row) => !this.selectedStudentList.some((item) => item.id === row.id)
      );

      // 添加新选中的人员到持久化列表
      if (newSelected.length > 0) {
        this.selectedStudentList = [
          ...this.selectedStudentList,
          ...newSelected,
        ];

        // 取消表格中的勾选（避免重复显示）
        this.$nextTick(() => {
          newSelected.forEach((row) => {
            this.$refs.studentTable.toggleRowSelection(row, false);
          });
        });
      }
    },
    // 移除选中的管理人员
    removeSelectedStudent(studentId) {
      this.selectedStudentList = this.selectedStudentList.filter(
        (item) => item.id !== studentId
      );

      // 移除后重新查询学生列表，恢复该人员的可选状态
      this.getStudentList();
    },
    // 提交活动表单（核心：管理人员单对象传参）
    handleSubmit() {
      this.$refs.activityForm.validate(async (valid) => {
        if (!valid) return;

        const { beginTime, startTime, endTime } = this.activityForm;
        const beginStamp = new Date(beginTime).getTime();
        const startStamp = new Date(startTime).getTime();
        const endStamp = new Date(endTime).getTime();
        const now = new Date().getTime();
        if (
          beginStamp >= startStamp ||
          startStamp >= endStamp ||
          beginStamp < now ||
          endStamp < now
        ) {
          return this.$message.error(
            "时间格式错误：请确保报名时间<开始时间<结束时间，且都大于当前时间"
          );
        }

        // 构造提交数据 - 管理人员单对象
        const submitForm = {
          ...this.activityForm,
          // 参与人员分数
          participants: [
            {
              name: "参与人员",
              score: this.activityForm.participantScore,
              value: "",
            },
          ],
          // 管理人员单对象：value=ID串，score=统一分数
          managerInfo:
            this.selectedStudentList.length > 0
              ? {
                  score: this.activityForm.managerScore,
                  managerIds: this.selectedStudentList
                    .map((item) => item.id)
                    .join(","),
                }
              : null,
          // 移除冗余字段
          managerList: undefined,
        };

        try {
          if (this.activityForm.id) {
            await updateActivity(submitForm);
            this.$message.success("更新成功");
          } else {
            await addActivity(submitForm);
            this.$message.success("新增成功");
          }
          this.dialogVisible = false;
          this.getList();
        } catch (error) {
          console.error("提交失败:", error);
          this.$message.error("提交失败：" + (error.msg || "服务器异常"));
        }
      });
    },
    // 对话框关闭重置
    handleDialogClose() {
      this.$refs.activityForm?.resetFields();
      this.activityForm = {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        startTime: "",
        beginTime: "",
        status: 1,
        maxNumber: 0,
        participantScore: 0,
        managerScore: 0,
      };
      this.studentQuery = { page: 1, pageSize: 5, name: "" };
      this.studentList = [];
      this.studentTotal = 0;
      this.selectedStudentList = [];
    },
    // 参与者查看
    handleViewParticipants(row) {
      this.currentActivity = row;
      this.participantsDialogVisible = true;
    },
    handleParticipantsDialogClose() {
      this.currentActivity = null;
    },
  },
};
</script>

<style scoped lang="less">
.activity-management {
  padding: 20px;
}
.search-card,
.operate-card,
.table-card {
  margin-bottom: 20px;
}
.search-form {
  margin-bottom: 0;
}

/* 弹窗整体样式 */
::v-deep .activity-dialog .el-dialog__body {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  padding-bottom: 10px;
}

/* 表单布局 */
.activity-form {
  width: 100%;
}
.form-content {
  width: 100%;
  box-sizing: border-box;
  padding: 0 5px;
}
.form-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;
}
.group-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}
.form-item {
  flex: 1;
  min-width: 280px;
  margin-bottom: 0 !important;
}
.full-width {
  width: 100%;
  min-width: 100%;
}

/* 分数样式 */
.participant-score-container {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}
.score-label {
  font-size: 14px;
  color: #666;
  margin-right: 15px;
  font-weight: 500;
}
.score-input {
  width: 200px;
}

/* 管理人员样式（修复版） */
.manager-search-form {
  margin-bottom: 0;
  width: 100%;
}
.search-input {
  width: 200px;
}
.student-table {
  width: 100% !important;
  box-sizing: border-box;
}
.selected-manager-container {
  margin-top: 15px;
}
.manager-info-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}
.manager-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.info-value {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}
.manager-tags {
  margin-bottom: 15px;
  flex-wrap: wrap;
  display: flex;
}
.manager-score-container {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}
.empty-tip {
  color: #999;
  padding: 10px;
  text-align: center;
}

/* 空行样式 */
::v-deep .el-table .el-table__row td {
  height: 50px;
}
::v-deep .el-table .el-table__row td:has(> span:only-child) {
  color: #c0c4cc;
}
::v-deep .el-table .el-table__row:hover td {
  background-color: inherit !important;
}
::v-deep .el-table .el-table__row:not(:has(> span:only-child)):hover td {
  background-color: #f5f7fa !important;
}

/* 参与者查看样式 */
.participants-view .view-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}
.participant-score-view {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
}
.score-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}
.manager-info-view {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}
.manager-tags-view {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
}

.mb-20 {
  margin-bottom: 20px;
}
.dialog-footer {
  text-align: right;
}

/* 全局消除输入框滚轮事件 */
::v-deep .el-input-number {
  --el-input-number-controls-hover-bg: transparent;
}
::v-deep .el-input-number .el-input__inner {
  cursor: text;
}

/* 禁止选择的行样式 */
::v-deep .el-table .el-table__row td.el-table-column--selection {
  cursor: default;
}
::v-deep .el-table .el-table__row td.el-table-column--selection .el-checkbox {
  cursor: pointer;
}
::v-deep
  .el-table
  .el-table__row
  td.el-table-column--selection
  .el-checkbox.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 穿透 scoped 样式，覆盖禁用勾选框的背景色+显示打钩 */
::v-deep .el-checkbox__input.is-disabled .el-checkbox__inner {
  /* 自定义背景色（替换 #060606 为你想要的颜色） */
  background-color: #409eff !important;
  border-color: #409eff !important; /* 边框色和背景色一致 */

  /* 强制显示打钩图标 */
  &::after {
    display: block !important; /* 显示对勾 */
    width: 4px;
    height: 8px;
    border: 2px solid #fff; /* 对勾颜色（白色） */
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg) scale(1) translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 18%;
    content: "";
  }
}

/* 同时取消禁用状态的文字灰色 */
::v-deep .el-checkbox.is-disabled .el-checkbox__label {
  color: #333 !important; /* 文字恢复正常颜色 */
}
</style>
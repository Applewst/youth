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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类名称" width="120" />
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="image" label="图片" width="100">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.image"
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              style="width: 60px; height: 60px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与者" width="150">
          <template slot-scope="scope">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-tag type="info" size="small">
                {{ scope.row.participants ? scope.row.participants.length : 0 }}
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
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <!-- 启用状态显示的按钮 -->
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

            <!-- 禁用状态显示的按钮 -->
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
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
        <el-form-item label="分类名称" prop="categoryId">
          <el-input
            v-model.number="activityForm.categoryId"
            placeholder="请输入分类名称"
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

    <!-- 补签对话框 -->
    <!-- 补签对话框（新增人员选择列表） -->
    <el-dialog
      title="补签管理"
      :visible.sync="makeUpDialogVisible"
      width="900px"
    >
      <!-- 搜索可补签人员 -->
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
          >
            <el-option label="已报名" value="REGISTERED" />
            <el-option label="未报名" value="UNREGISTERED" />
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

      <!-- 可补签人员列表（带选择框） -->
      <el-dialog
        title="补签管理"
        :visible.sync="makeUpDialogVisible"
        width="900px"
      >
        <!-- 搜索可补签人员 -->
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
              <!-- 修正：已报名/已申请 -->
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

        <!-- 可补签人员列表（带选择框） -->
        <el-table
          :data="retroactiveList"
          border
          style="width: 100%"
          @selection-change="handleRetroactiveSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="人员ID" width="100" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column
            prop="registrationStatus"
            label="报名状态"
            width="120"
          >
            <template slot-scope="scope">
              <!-- 修正：显示已报名/已申请，对应不同样式 -->
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
              <el-input
                v-model="scope.row.reason"
                placeholder="请输入补签理由"
              />
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
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

      <!-- 分页 -->
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

    <!-- 参与者管理对话框 -->
    <el-dialog
      title="参与者管理"
      :visible.sync="participantsDialogVisible"
      width="800px"
      @close="handleParticipantsDialogClose"
    >
      <div style="margin-bottom: 16px">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleAddParticipant"
        >
          添加参与者
        </el-button>
      </div>

      <el-table :data="currentParticipants" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="score" label="分数" width="100" />
        <el-table-column prop="value" label="评价" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              size="small"
              @click="handleEditParticipant(scope.row, scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              size="small"
              style="color: #f56c6c"
              @click="handleDeleteParticipant(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="participantsDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 新增/编辑参与者对话框 -->
    <el-dialog
      :title="participantDialogTitle"
      :visible.sync="participantDialogVisible"
      width="500px"
      @close="handleParticipantDialogClose"
    >
      <el-form
        ref="participantForm"
        :model="participantForm"
        :rules="participantRules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="participantForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input v-model="participantForm.score" placeholder="请输入分数" />
        </el-form-item>
        <el-form-item label="评价" prop="value">
          <el-input v-model="participantForm.value" placeholder="请输入评价" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="participantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitParticipant"
          >确定</el-button
        >
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

import { uploadFile } from "@/api/upload";

export default {
  data() {
    return {
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: "",
        categoryId: "",
        status: "",
      },
      // 活动列表
      activityList: [],
      // 总数
      total: 0,
      // 加载状态
      loading: false,
      // 对话框显示状态
      dialogVisible: false,
      // 对话框标题
      dialogTitle: "",
      // 表单数据
      activityForm: {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "", // 添加结束时间字段
        status: 1,
        participants: [],
      },
      // 表单验证规则
      activityRules: {
        name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请输入分类ID", trigger: "blur" },
        ],
        status: [{ required: true, message: "请选择状态", trigger: "change" }],
        endTime: [
          { required: true, message: "请选择结束时间", trigger: "change" },
        ],
      },
      // 补签相关
      makeUpDialogVisible: false,
      // 补签人员查询参数
      retroactiveQuery: {
        activityId: "",
        name: "",
        page: 1,
        pageSize: 10,
        registrationStatus: "",
      },
      // 可补签人员列表
      retroactiveList: [],
      retroactiveTotal: 0,
      // 选中的补签人员
      selectedRetroactiveList: [],

      // 发放二课分相关
      grantPointsDialogVisible: false,
      grantPointsForm: {
        activityId: "", // 活动ID = 二课分ID
      },

      // 参与者相关数据
      participantsDialogVisible: false,
      currentActivity: null,
      currentParticipants: [],
      participantDialogVisible: false,
      participantDialogTitle: "",
      participantForm: {
        id: null,
        name: "",
        score: "",
        value: "",
      },
      participantEditIndex: -1,
      participantRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        score: [{ required: true, message: "请输入分数", trigger: "blur" }],
        value: [{ required: true, message: "请输入评价", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 1. 上传前校验（可选：限制图片类型和大小，避免无效上传）
    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2; // 限制2MB内
      if (!isImage) this.$message.error("只能上传图片文件！");
      if (!isLt2M) this.$message.error("图片大小不能超过2MB！");
      return isImage && isLt2M; // 校验通过才允许上传
    },

    // 2. 核心上传逻辑：调用接口，返回地址填入表单
    async handleUpload(options) {
      try {
        // 调用你的 uploadFile 接口上传文件
        const res = await uploadFile(options.file);
        console.log(res);

        // 假设接口返回格式：{ code: 0, data: "https://xxx.com/xxx.jpg" }

        this.activityForm.image = res; // 直接填入图片地址
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
        console.log(response);

        this.activityList = response.records || [];
        this.total = response.total || 0;
      } catch (error) {
        console.error("获取活动列表失败:", error);
      } finally {
        this.loading = false;
      }
    },
    // 搜索
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    // 重置搜索
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
    // 分页大小改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    // 当前页改变
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getList();
    },
    // 新增
    handleAdd() {
      this.dialogTitle = "新增活动";
      this.dialogVisible = true;
    },
    // 编辑
    handleUpdate(row) {
      this.dialogTitle = "编辑活动";
      this.activityForm = { ...row };
      this.dialogVisible = true;
    },
    // 删除
    handleDelete(row) {
      this.$confirm(`确定要删除活动"${row.name}"吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await deleteActivity(row.id);
            this.$message.success("删除成功");
            this.getList();
          } catch (error) {
            console.error("删除失败:", error);
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 禁用活动
    handleDisable(row) {
      this.$confirm(`确定要禁用活动"${row.name}"吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await disableActivity(row.id, { status: 0 });
            this.$message.success("禁用成功");
            this.getList();
          } catch (error) {
            console.error("禁用失败:", error);
          }
        })
        .catch(() => {
          this.$message.info("已取消禁用");
        });
    },
    // 补签操作
    handleMakeUp(row) {
      this.retroactiveQuery = {
        activityId: row.id,
        name: "",
        page: 1,
        pageSize: 10,
        registrationStatus: "",
      };
      this.makeUpDialogVisible = true;
      this.getRetroactiveList(); // 打开后自动查询人员
    },
    async getRetroactiveList() {
      this.loading = true;
      try {
        const response = await getRetroactivePage(this.retroactiveQuery);
        // 给每个人员默认加reason字段（用于填写补签理由）
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
    // 补签人员分页-每页条数改变
    handleRetroactiveSizeChange(val) {
      this.retroactiveQuery.pageSize = val;
      this.getRetroactiveList();
    },

    // 补签人员分页-当前页改变
    handleRetroactiveCurrentChange(val) {
      this.retroactiveQuery.page = val;
      this.getRetroactiveList();
    },

    // 补签人员选择事件
    handleRetroactiveSelectionChange(val) {
      this.selectedRetroactiveList = val;
    },

    // 提交补签（选择人员+理由）
    async handleSubmitMakeUp() {
      // 校验选中人员的理由是否填写
      const hasEmptyReason = this.selectedRetroactiveList.some(
        (item) => !item.reason.trim()
      );
      if (hasEmptyReason) {
        this.$message.error("请为选中的人员填写补签理由");
        return;
      }

      try {
        // 构造补签参数：提取选中人员的ID和理由
        const retroactiveDTOList = this.selectedRetroactiveList.map((item) => ({
          studentId: item.id,
          reason: item.reason.trim(),
        }));

        // 调用补签接口
        await makeUpActivity(
          this.retroactiveQuery.activityId, // 活动ID（路径参数）
          JSON.stringify(retroactiveDTOList) // 补签人员列表（query参数）
        );

        this.$message.success("补签成功");
        this.makeUpDialogVisible = false;
        this.getList(); // 刷新活动列表
      } catch (error) {
        console.error("补签失败:", error);
        this.$message.error("补签失败：" + (error.msg || "接口请求异常"));
      }
    },

    // 发放二课分
    handleGrantPoints(row) {
      this.grantPointsForm = {
        activityId: row.id, // 活动ID即为二课分ID
      };
      this.grantPointsDialogVisible = true;
    },
    // 提交发放二课分
    async handleSubmitGrantPoints() {
      try {
        // 调用发放接口：仅传递二课分ID（活动ID）
        await grantActivityPoints({
          secondClassId: this.grantPointsForm.activityId, // 二课分ID = 活动ID
        });

        this.$message.success("二课分发放成功");
        this.grantPointsDialogVisible = false;
        this.getList(); // 刷新活动列表
      } catch (error) {
        console.error("发放二课分失败:", error);
        this.$message.error("发放二课分失败：" + (error.msg || "接口请求异常"));
      }
    },
    // 提交表单
    handleSubmit() {
      this.$refs.activityForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.activityForm.id) {
              // 编辑
              await updateActivity(this.activityForm);
              this.$message.success("更新成功");
            } else {
              // 新增
              await addActivity(this.activityForm);
              this.$message.success("新增成功");
            }
            this.dialogVisible = false;
            this.getList();
          } catch (error) {
            console.error("提交失败:", error);
          }
        }
      });
    },
    // 对话框关闭
    handleDialogClose() {
      this.$refs.activityForm.resetFields();
      this.activityForm = {
        id: null,
        name: "",
        categoryId: "",
        description: "",
        image: "",
        endTime: "",
        status: 1,
        participants: [],
      };
    },
    // 参与者管理相关方法
    handleViewParticipants(row) {
      this.currentActivity = row;
      this.currentParticipants = row.participants || [];
      this.participantsDialogVisible = true;
    },
    handleParticipantsDialogClose() {
      this.currentActivity = null;
      this.currentParticipants = [];
    },
    handleAddParticipant() {
      this.participantDialogTitle = "添加参与者";
      this.participantEditIndex = -1;
      this.participantDialogVisible = true;
    },
    handleEditParticipant(row, index) {
      this.participantDialogTitle = "编辑参与者";
      this.participantForm = { ...row };
      this.participantEditIndex = index;
      this.participantDialogVisible = true;
    },
    handleDeleteParticipant(index) {
      this.$confirm("确定要删除该参与者吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.currentParticipants.splice(index, 1);
          this.$message.success("删除成功");
          this.updateActivityParticipants();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    handleSubmitParticipant() {
      this.$refs.participantForm.validate((valid) => {
        if (valid) {
          if (this.participantEditIndex >= 0) {
            // 编辑
            this.currentParticipants.splice(this.participantEditIndex, 1, {
              id: this.participantForm.id,
              activityId: this.currentActivity.id,
              name: this.participantForm.name,
              score: Number(this.participantForm.score),
              value: this.participantForm.value,
            });
            this.$message.success("更新成功");
          } else {
            // 新增
            const newParticipant = {
              id: Date.now(),
              activityId: this.currentActivity.id,
              name: this.participantForm.name,
              score: Number(this.participantForm.score),
              value: this.participantForm.value,
            };
            this.currentParticipants.push(newParticipant);
            this.$message.success("添加成功");
          }
          this.participantDialogVisible = false;
          this.updateActivityParticipants();
        }
      });
    },

    handleParticipantDialogClose() {
      this.$refs.participantForm.resetFields();
      this.participantForm = {
        id: null,
        name: "",
        score: "",
        value: "",
      };
      this.participantEditIndex = -1;
    },
    async updateActivityParticipants() {
      try {
        const updatedActivity = {
          ...this.currentActivity,
          participants: this.currentParticipants,
        };
        await updateActivity(updatedActivity);
        this.getList();
      } catch (error) {
        console.error("更新参与者失败:", error);
      }
    },
  },
};
</script>

<style scoped>
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
</style>
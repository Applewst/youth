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
        <el-form-item label="分类ID">
          <el-input
            v-model="queryParams.categoryId"
            placeholder="请输入分类ID"
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
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
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
        <el-form-item label="分类ID" prop="categoryId">
          <el-input
            v-model.number="activityForm.categoryId"
            placeholder="请输入分类ID"
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
        <el-form-item label="图片URL" prop="image">
          <el-input v-model="activityForm.image" placeholder="请输入图片URL" />
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
} from "@/api/activity";

export default {
  name: "ActivityManagement",
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
    // 获取活动列表
    async getList() {
      this.loading = true;
      try {
        const response = await getActivityPage(this.queryParams);
        this.activityList = response.data.records || [];
        this.total = response.data.total || 0;
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
      console.log(row);

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

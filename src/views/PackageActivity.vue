<template>
  <div class="package-management">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="套餐名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入套餐名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类ID">
          <el-input
            v-model="searchForm.categoryId"
            placeholder="请输入分类ID"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @clear="handleSearch"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 新增批量删除按钮 + 新增按钮 -->
      <div style="display: flex; gap: 10px; align-items: center">
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="handleBatchDelete"
          :disabled="selectedIds.length === 0"
          >批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增活动套餐
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        ref="tableRef"
        :row-key="(row) => row.id"
      >
        <!-- 批量选择列 -->
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="套餐名称" min-width="150" />
        <el-table-column prop="categoryId" label="分类ID" width="100" />
        <el-table-column prop="categoryName" label="分类名称" width="120" />
        <el-table-column prop="score" label="积分" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <!-- 操作列固定在右侧 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              class="danger-btn"
              @click="handleSingleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page.sync="pagination.page"
        :page-size.sync="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      :loading="loading"
    >
      <el-form
        ref="packageForm"
        :model="packageForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="packageForm.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="分类ID" prop="categoryId">
          <el-input
            v-model="packageForm.categoryId"
            placeholder="请输入分类ID"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="packageForm.categoryName"
            placeholder="请输入分类名称"
          />
        </el-form-item>
        <el-form-item label="积分" prop="score">
          <el-input-number v-model="packageForm.score" :min="0" :max="9999" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="packageForm.description"
            type="textarea"
            placeholder="请输入套餐描述"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="活动图片" prop="image">
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
          <el-image
            v-if="packageForm.image"
            :src="packageForm.image"
            style="
              width: 80px;
              height: 60px;
              margin-top: 10px;
              border-radius: 4px;
            "
            :preview-src-list="[packageForm.image]"
          />
          <el-input
            v-model="packageForm.image"
            placeholder="图片地址（上传后自动填充）"
            style="display: none"
          />
        </el-form-item>
        <el-form-item label="关联活动" prop="packageActivities">
          <el-table
            :data="packageForm.packageActivities"
            border
            style="width: 100%; margin-top: 10px"
            size="mini"
          >
            <el-table-column label="活动ID" width="120">
              <template slot-scope="{ row }">
                <el-input
                  v-model="row.activityId"
                  placeholder="请输入活动ID"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="{ $index }">
                <el-button
                  type="text"
                  size="mini"
                  class="danger-btn"
                  @click="deleteActivity($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            type="text"
            size="small"
            icon="el-icon-plus"
            @click="addActivity"
            style="margin-top: 5px"
          >
            添加活动
          </el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPackagePage,
  addPackage,
  updatePackage,
  deletePackage,
  changePackageStatus,
  getPackageDetail,
} from "@/api/package.js";

export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      tableData: [],
      searchForm: {
        name: "",
        categoryId: "",
        status: "",
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      dialogVisible: false,
      dialogTitle: "新增活动套餐",
      isEdit: false,
      packageForm: {
        id: null,
        name: "",
        categoryId: 0,
        categoryName: "",
        score: 0,
        description: "",
        image: "",
        status: 0,
        packageActivities: [
          {
            activityId: 0,
            id: 0,
            packageId: 0,
          },
        ],
      },
      formRules: {
        name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请输入分类ID", trigger: "blur" },
        ],
        categoryName: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
        score: [{ required: true, message: "请输入积分", trigger: "blur" }],
        packageActivities: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value.length === 0) {
                callback(new Error("至少添加一个关联活动"));
              } else {
                const hasEmpty = value.some((item) => !item.activityId);
                if (hasEmpty) {
                  callback(new Error("请填写所有活动ID"));
                } else {
                  callback();
                }
              }
            },
            trigger: "change",
          },
        ],
      },
      selectedIds: [], // 存储选中的套餐ID
      tableRef: null, // 表格引用
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm,
        };
        const res = await getPackagePage(params);
        if (res.code === 0) {
          this.tableData = res.data.records || res.data.list;
          this.pagination.total = res.data.total;

          // 关键：清空选中状态（分页/搜索后重置）
          this.$nextTick(() => {
            this.$refs.tableRef?.clearSelection();
            this.selectedIds = [];
          });
        } else {
          this.$message.error(res.msg || "获取套餐数据失败");
        }
      } catch (error) {
        console.error("fetchData error:", error);
        this.$message.error("获取套餐数据失败");
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },

    handleReset() {
      this.searchForm = { name: "", categoryId: "", status: "" };
      this.pagination.page = 1;
      this.fetchData();
    },

    handleAdd() {
      this.dialogTitle = "新增活动套餐";
      this.isEdit = false;
      this.packageForm = {
        id: null,
        name: "",
        categoryId: 0,
        categoryName: "",
        score: 0,
        description: "",
        image: "",
        status: 0,
        packageActivities: [{ activityId: 0, id: 0, packageId: 0 }],
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.packageForm?.clearValidate();
      });
    },

    async handleEdit(row) {
      this.dialogTitle = "编辑活动套餐";
      this.isEdit = true;
      this.dialogVisible = true; // 先打开弹窗，显示加载状态
      this.loading = true; // 弹窗内也可加loading，避免用户操作

      try {
        // 核心：调用详情接口，根据ID获取最新数据
        const res = await getPackageDetail(row.id);
        if (res.code === 0) {
          const detailData = res.data; // 接口返回的完整套餐数据
          // 回显表单（深拷贝避免接口数据被修改）
          this.packageForm = {
            ...detailData,
            // 处理关联活动（确保结构兼容，无数据时初始化空数组）
            packageActivities: JSON.parse(
              JSON.stringify(
                detailData.packageActivities || [
                  { activityId: 0, id: 0, packageId: detailData.id },
                ]
              )
            ),
          };
        } else {
          this.$message.error(res.msg || "获取套餐详情失败");
          this.dialogVisible = false; // 失败则关闭弹窗
        }
      } catch (error) {
        console.error("获取套餐详情失败：", error);
        this.$message.error("获取套餐详情失败，请重试");
        this.dialogVisible = false;
      } finally {
        this.loading = false;
        // 清空表单校验（回显后重置校验状态）
        this.$nextTick(() => {
          this.$refs.packageForm?.clearValidate();
        });
      }
    },

    addActivity() {
      this.packageForm.packageActivities.push({
        activityId: 0,
        id: 0,
        packageId: this.packageForm.id || 0,
      });
    },

    deleteActivity(index) {
      if (this.packageForm.packageActivities.length <= 1) {
        this.$message.warning("至少保留一个关联活动");
        return;
      }
      this.packageForm.packageActivities.splice(index, 1);
    },

    handleUpload() {
      this.packageForm.image = "https://example.com/upload-img.png";
      this.$message.success("图片上传成功");
    },

    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) this.$message.error("请上传图片格式文件");
      if (!isLt2M) this.$message.error("图片大小不能超过2MB");
      return isImage && isLt2M;
    },

    handleSubmit() {
      this.$refs.packageForm.validate(async (valid) => {
        if (!valid) return;

        this.submitLoading = true;
        try {
          const formData = {
            ...this.packageForm,
            packageActivities: this.packageForm.packageActivities.map(
              (item) => ({
                ...item,
                packageId: this.packageForm.id || 0,
              })
            ),
          };
          const apiFunc = this.isEdit ? updatePackage : addPackage;
          const res = await apiFunc(formData);

          if (res.code === 0) {
            this.$message.success(
              res.msg || (this.isEdit ? "更新成功" : "新增成功")
            );
            this.dialogVisible = false;
            this.fetchData();
          } else {
            this.$message.error(
              res.msg || (this.isEdit ? "更新失败" : "新增失败")
            );
          }
        } catch (error) {
          console.error("handleSubmit error:", error);
          this.$message.error(this.isEdit ? "更新失败" : "新增失败");
        } finally {
          this.submitLoading = false;
        }
      });
    },

    async handleStatusChange(row) {
      const statusText = row.status === 1 ? "启用" : "禁用";
      const originalStatus = row.status === 1 ? 0 : 1;

      try {
        await this.$confirm(
          `确定要${statusText}该活动套餐吗？`,
          "状态变更确认",
          {
            type: "warning",
          }
        );
        const res = await changePackageStatus(row.id, row.status);
        if (res.code === 0) {
          this.$message.success("状态更新成功");
          this.fetchData();
        } else {
          this.$message.error("状态更新失败");
          row.status = originalStatus;
        }
      } catch (error) {
        row.status = originalStatus;
      }
    },

    // 修复：选中事件 - 加调试日志，确保能接收到选中数据
    handleSelectionChange(val) {
      // console.log("选中的行数据：", val);
      // 提取选中行的ID
      this.selectedIds = val.map((item) => item.id);
      // console.log("选中的IDs：", this.selectedIds);
    },

    // 统一的批量删除处理方法
    async handleBatchDelete() {
      // 直接用全局的 selectedIds，无需复杂参数处理
      const deleteIds = [...this.selectedIds];

      // 校验：必须有选中的ID
      if (deleteIds.length === 0) {
        this.$message.warning("请选择要删除的套餐");
        console.log("选中的IDs为空：", this.selectedIds);
        return;
      }

      // 确认删除
      const confirmText = `确定要删除选中的${deleteIds.length}个活动套餐吗？删除后将无法恢复。`;
      try {
        await this.$confirm(confirmText, "批量删除确认", {
          type: "warning",
          confirmButtonText: "确认删除",
          cancelButtonText: "取消",
        });

        this.loading = true;
        console.log("批量删除IDs：", deleteIds); // 调试：确认ID正确
        const res = await deletePackage(deleteIds); // 传入ID数组

        if (res.code === 0) {
          this.$message.success(`成功删除${deleteIds.length}个套餐`);
          this.$refs.tableRef?.clearSelection(); // 清空选中状态
          this.selectedIds = []; // 重置selectedIds
          this.fetchData();
        } else {
          this.$message.error(res.msg || "批量删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("批量删除失败：", error);
          this.$message.error("批量删除失败");
        } else {
          this.$message.info("已取消批量删除");
        }
      } finally {
        this.loading = false;
      }
    },

    // 单个删除
    handleSingleDelete(row) {
      this.handleBatchDelete([row.id]);
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.page = 1;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.pagination.page = val;
      this.fetchData();
    },
  },
};
</script>

<style scoped>
.package-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
.search-card {
  margin-bottom: 20px;
}
.search-form {
  margin-bottom: 10px;
}
.table-card {
  margin-top: 20px;
}
.danger-btn {
  color: #f56c6c;
}
</style>
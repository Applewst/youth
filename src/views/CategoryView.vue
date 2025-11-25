<template>
  <div class="category-management">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动分类名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入活动分类名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <!-- 将下拉选择改为输入框,支持字符串搜索 -->
        <el-form-item label="活动类型">
          <el-input
            v-model="searchForm.type"
            placeholder="请输入活动类型"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <!-- <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @clear="handleSearch"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        新增活动分类
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动分类名称" min-width="150" />
        <!-- 直接显示type字段的值,不做类型转换 -->
        <el-table-column prop="type" label="活动类型" width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="{ row }">
            <!-- 添加状态切换开关 -->
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
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              class="danger-btn"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 - Vue2 Element UI 语法 -->
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

    <!-- 新增/编辑对话框 - Vue2 使用 :visible.sync -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryForm"
        :model="categoryForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="活动分类名称" prop="name">
          <el-input
            v-model="categoryForm.name"
            placeholder="请输入活动分类名称"
          />
        </el-form-item>
        <!-- 将下拉选择改为输入框 -->
        <el-form-item label="活动类型" prop="type">
          <el-input v-model="categoryForm.type" placeholder="请输入活动类型" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
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
  getCategoryPage,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} from "@/api/category.js";

export default {
  data() {
    return {
      loading: false,
      submitLoading: false,

      tableData: [],

      searchForm: {
        name: "",
        type: "",
        status: "",
      },

      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },

      dialogVisible: false,
      dialogTitle: "新增活动分类",
      isEdit: false,

      categoryForm: {
        id: null,
        name: "",
        type: "",
        sort: 0,
      },

      formRules: {
        name: [
          { required: true, message: "请输入活动分类名称", trigger: "blur" },
        ],
        type: [{ required: true, message: "请输入活动类型", trigger: "blur" }],
      },
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
        };

        if (this.searchForm.name) {
          params.name = this.searchForm.name;
        }
        if (this.searchForm.type) {
          params.type = this.searchForm.type;
        }
        if (this.searchForm.status !== "") {
          params.status = this.searchForm.status;
        }

        const res = await getCategoryPage(params);

        if (res.code === 0) {
          let records = res.data.records;
          if (this.searchForm.status !== "") {
            records = records.filter(
              (item) => item.status === this.searchForm.status
            );
          }

          this.tableData = records;
          this.pagination.total = res.data.total;
        } else {
          this.$message.error(res.msg || "获取数据失败");
        }
      } catch (error) {
        console.error("fetchData error:", error);
        this.$message.error("获取数据失败");
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },

    handleReset() {
      this.searchForm = { name: "", type: "", status: "" };
      this.pagination.page = 1;
      this.fetchData();
    },

    handleAdd() {
      this.dialogTitle = "新增活动分类";
      this.isEdit = false;
      this.categoryForm = { id: null, name: "", type: "", sort: 0 };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },

    handleEdit(row) {
      this.dialogTitle = "编辑活动分类";
      this.isEdit = true;
      this.categoryForm = { ...row };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },

    handleSubmit() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (!valid) return;

        this.submitLoading = true;
        try {
          const apiFunc = this.isEdit ? updateCategory : addCategory;
          const res = await apiFunc(this.categoryForm);

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

      this.$confirm(`确定要${statusText}该活动分类吗？`, "状态变更确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const res = await updateCategoryStatus({
              id: row.id,
              status: row.status,
            });

            if (res.code === 0) {
              this.$message.success(res.msg || "状态更新成功");
              this.fetchData();
            } else {
              this.$message.error(res.msg || "状态更新失败");
              row.status = originalStatus;
            }
          } catch (error) {
            console.error("handleStatusChange error:", error);
            this.$message.error("状态更新失败");
            row.status = originalStatus;
          }
        })
        .catch(() => {
          // 用户取消操作，恢复原状态
          row.status = originalStatus;
        });
    },

    handleDelete(row) {
      this.$confirm(
        "确定要删除该活动分类吗？删除后将无法恢复。",
        "删除活动分类",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          try {
            const res = await deleteCategory(row.id);

            if (res.code === 0) {
              this.$message.success(res.msg || "删除成功");
              this.fetchData();
            } else {
              this.$message.error(res.msg || "删除失败");
            }
          } catch (error) {
            console.error("handleDelete error:", error);
            this.$message.error("删除失败");
          }
        })
        .catch(() => {});
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
.category-management {
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

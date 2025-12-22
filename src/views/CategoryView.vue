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
        <el-form-item label="活动类型">
          <el-input
            v-model="searchForm.type"
            placeholder="请输入活动类型"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        新增活动分类
      </el-button>
    </el-card>

    <!-- 数据表格（删除status列） -->
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
        <el-table-column prop="type" label="活动类型" width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
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
} from "@/api/category.js";

export default {
  data() {
    return {
      loading: false,
      submitLoading: false,

      tableData: [],

      // 删除status字段（接口无此参数）
      searchForm: {
        name: "",
        type: "",
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
        // 构造请求参数（只传接口支持的name/type/page/pageSize）
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...(this.searchForm.name && { name: this.searchForm.name }),
          ...(this.searchForm.type && { type: this.searchForm.type }),
        };

        const res = await getCategoryPage(params);
        console.log(res);

        // 修复接口返回处理逻辑（原逻辑写反）

        this.tableData = res.records || [];
        this.pagination.total = res.total || 0;
      } catch (error) {
        console.error("fetchData error:", error);
        this.$message.error("获取数据失败");
        this.tableData = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },

    handleReset() {
      // 重置时删除status字段
      this.searchForm = { name: "", type: "" };
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

          this.$message.success(
            res.msg || (this.isEdit ? "更新成功" : "新增成功")
          );
          this.dialogVisible = false;
          this.fetchData();
        } catch (error) {
          console.error("handleSubmit error:", error);
          this.$message.error(this.isEdit ? "更新失败" : "新增失败");
        } finally {
          this.submitLoading = false;
        }
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

            this.$message.success(res.msg || "删除成功");
            this.fetchData();
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
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
          <!-- 搜索框改为下拉选择器 -->
          <el-select
            v-model="searchForm.type"
            placeholder="请选择活动类型"
            clearable
            @clear="handleSearch"
          >
            <el-option label="活动分类" :value="1" />
            <el-option label="套餐分类" :value="2" />
          </el-select>
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

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="活动分类名称" min-width="150">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="活动类型" width="150">
          <template slot-scope="{ row }">
            <template v-if="!row.isEmpty">
              <!-- 根据type值显示中文 -->
              {{ row.type === 1 || row.type === "1" ? "活动分类" : "套餐分类" }}
            </template>
            <span v-else> </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.sort }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.createTime }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.updateTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <!-- 仅非空行显示操作按钮 -->
            <template v-if="!row.isEmpty">
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
            <!-- 空行显示短横线 -->
            <span v-else> </span>
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
          <!-- 弹窗改为下拉选择器 -->
          <el-select
            v-model="categoryForm.type"
            placeholder="请选择活动类型"
            style="width: 100%"
          >
            <el-option label="活动分类" :value="1" />
            <el-option label="套餐分类" :value="2" />
          </el-select>
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
        type: 1,
        sort: 0,
      },

      formRules: {
        name: [
          { required: true, message: "请输入活动分类名称", trigger: "blur" },
        ],
        type: [
          { required: true, message: "请选择活动类型", trigger: "change" },
          { type: "number", message: "活动类型必须为数字", trigger: "change" },
        ],
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
          ...(this.searchForm.name && { name: this.searchForm.name }),
          ...(this.searchForm.type !== "" && {
            type: Number(this.searchForm.type),
          }),
        };

        const res = await getCategoryPage(params);
        console.log(res);

        // 1. 真实数据
        const realTableData = res.records || [];
        // 给真实数据标记非空
        const realDataWithFlag = realTableData.map((item) => ({
          ...item,
          isEmpty: false, // 标记真实行
        }));

        // 2. 计算需要补充的空行数量
        const emptyRowCount =
          this.pagination.pageSize - realDataWithFlag.length;
        // 3. 生成空行（字段和真实数据一致，标记为空行）
        const emptyRows = Array.from({ length: emptyRowCount }).map(
          (_, index) => ({
            id: `empty-${this.pagination.page}-${index}`, // 唯一key
            name: "",
            type: "",
            sort: "",
            createTime: "",
            updateTime: "",
            isEmpty: true, // 标记空行
          })
        );

        // 4. 合并真实数据 + 空行
        this.tableData = [...realDataWithFlag, ...emptyRows];
        this.pagination.total = res.total || 0;
      } catch (error) {
        console.error("fetchData error:", error);
        this.$message.error("获取数据失败");
        // 出错时也补充空行占位
        this.tableData = Array.from({ length: this.pagination.pageSize }).map(
          (_, index) => ({
            id: `empty-error-${index}`,
            name: "",
            type: "",
            sort: "",
            createTime: "",
            updateTime: "",
            isEmpty: true,
          })
        );
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
      this.categoryForm = { id: null, name: "", type: 1, sort: 0 };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate();
      });
    },

    handleEdit(row) {
      this.dialogTitle = "编辑活动分类";
      this.isEdit = true;
      this.categoryForm = { ...row, type: Number(row.type) };
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
          const submitData = {
            ...this.categoryForm,
            type: Number(this.categoryForm.type),
          };
          const apiFunc = this.isEdit ? updateCategory : addCategory;
          const res = await apiFunc(submitData);

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
/* 新增：空行样式 */
::v-deep .el-table .el-table__row td {
  height: 50px; /* 固定行高，保证占位一致 */
}

/* 空行文字置灰 */
::v-deep .el-table .el-table__row td:has(> span:only-child) {
  color: #c0c4cc;
}

/* 空行hover无高亮，真实行保留高亮 */
::v-deep .el-table .el-table__row:hover td {
  background-color: inherit !important;
}
::v-deep .el-table .el-table__row:not(:has(> span:only-child)):hover td {
  background-color: #f5f7fa !important;
}

/* 空行操作列背景轻微区分 */
::v-deep .el-table .el-table__row td:last-child:has(> span:only-child) {
  background-color: #fafafa;
}
</style>
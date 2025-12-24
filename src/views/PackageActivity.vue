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
        <!-- 批量选择列：仅真实行显示选择框 -->
        <el-table-column type="selection" width="55" fixed="left">
          <template slot-scope="{ row }">
            <el-checkbox
              v-model="row._checked"
              v-if="!row.isEmpty"
            ></el-checkbox>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" width="80">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.id }}
          </template>
        </el-table-column>

        <el-table-column prop="name" label="套餐名称" min-width="150">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.name }}
          </template>
        </el-table-column>

        <el-table-column prop="categoryId" label="分类ID" width="100">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.categoryId }}
          </template>
        </el-table-column>

        <el-table-column prop="score" label="积分" width="80">
          <template slot-scope="{ row }">
            {{ row.isEmpty ? " " : row.score }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="{ row }">
            <template v-if="!row.isEmpty">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="handleStatusChange(row)"
              />
            </template>
            <span v-else> </span>
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

        <!-- 操作列：仅真实行显示按钮 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <template v-if="!row.isEmpty">
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
          <el-select
            v-model="packageForm.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 新增status下拉选择框 -->
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="packageForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
          <!-- 上传+预览容器 -->
          <div
            style="
              position: relative;
              width: 120px;
              height: 120px;
              border: 1px dashed #d9d9d9;
              border-radius: 6px;
              cursor: pointer;
            "
          >
            <el-upload
              class="avatar-uploader"
              action="#"
              :http-request="handleManualUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <div
                v-if="!packageForm.image"
                style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                "
              >
                <i
                  class="el-icon-upload"
                  style="font-size: 28px; color: #8c939d"
                ></i>
                <span style="font-size: 12px; color: #999; margin-top: 5px"
                  >点击上传图片</span
                >
              </div>
              <!-- 有图片时预览 -->
              <img
                v-else
                :src="packageForm.image"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 6px;
                "
                alt="活动图片"
              />
            </el-upload>
            <!-- 清空图片按钮 -->
            <el-button
              v-if="packageForm.image"
              type="text"
              icon="el-icon-close"
              style="
                position: absolute;
                top: -10px;
                right: -10px;
                background: #fff;
                border-radius: 50%;
              "
              @click.stop="clearImage"
            ></el-button>
          </div>
          <!-- 隐藏存储图片URL -->
          <el-input
            v-model="packageForm.image"
            style="display: none"
          ></el-input>
        </el-form-item>
        <el-form-item label="关联活动" prop="packageActivities">
          <!-- 已选活动展示 -->
          <div class="selected-activities" style="margin-bottom: 10px">
            <el-tag
              v-for="(item, index) in packageForm.packageActivities"
              :key="index"
              closable
              @close="deleteActivity(index)"
              style="margin-right: 5px"
            >
              活动ID：{{ item.activityId }}
            </el-tag>
          </div>
          <!-- 选择活动按钮 -->
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openActivitySelectDialog"
          >
            选择活动
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

    <el-dialog
      title="选择关联活动"
      :visible.sync="activityDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <!-- 活动搜索 -->
      <el-form :inline="true" :model="activitySearchForm" class="mb10">
        <el-form-item label="活动名称">
          <el-input
            v-model="activitySearchForm.name"
            placeholder="请输入活动名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchActivityList">查询</el-button>
          <el-button @click="activitySearchForm = { name: '' }">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 活动列表 -->
      <el-table
        :data="activityList"
        border
        stripe
        v-loading="activityLoading"
        @selection-change="handleActivitySelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="活动ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <!-- 活动分页 -->
      <el-pagination
        :current-page="activityPagination.page"
        :page-size="activityPagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="activityPagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 10px; text-align: right"
        @size-change="
          (val) => {
            activityPagination.pageSize = val;
            fetchActivityList();
          }
        "
        @current-change="
          (val) => {
            activityPagination.page = val;
            fetchActivityList();
          }
        "
      />
      <div slot="footer">
        <el-button @click="activityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmActivitySelect"
          >确认选择</el-button
        >
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
import { uploadFile } from "@/api/upload.js";
import { getCategoryList } from "@/api/category.js"; // 分类列表接口
import { getActivityPage } from "@/api/activity.js"; // 活动列表接口

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
        categoryId: null, // 初始值为null，显示placeholder
        score: 0,
        description: "",
        image: "",
        status: null, // 新增status字段，初始值null
        packageActivities: [],
        price: 0,
      },
      formRules: {
        name: [{ required: true, message: "请输入套餐名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请选择分类", trigger: "change" },
        ],
        status: [
          // 新增status校验
          { required: true, message: "请选择状态", trigger: "change" },
        ],
        score: [{ required: true, message: "请输入积分", trigger: "blur" }],
        image: [
          { required: true, message: "请上传活动图片", trigger: "change" },
        ],
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

      // 分类相关
      categoryList: [], // 分类列表
      categoryLoading: false,

      // 活动选择相关
      activityDialogVisible: false, // 活动选择弹窗
      activityList: [], // 活动列表
      activityLoading: false,
      activitySearchForm: { name: "" }, // 活动搜索条件
      activityPagination: { page: 1, pageSize: 10, total: 0 },
      selectedActivityIds: [], // 选中的活动ID
    };
  },

  mounted() {
    this.fetchData();
    this.fetchCategoryList();
  },

  methods: {
    async fetchCategoryList() {
      this.categoryLoading = true;
      try {
        const res = await getCategoryList(2); // 调用getCategoryList(2)
        this.categoryList = res || [];
      } catch (error) {
        console.error("获取分类失败：", error);
        this.$message.error("获取分类列表失败");
      } finally {
        this.categoryLoading = false;
      }
    },

    // 打开活动选择弹窗
    openActivitySelectDialog() {
      this.activityDialogVisible = true;
      this.activityPagination.page = 1;
      this.fetchActivityList();
    },
    // 加载活动列表
    async fetchActivityList() {
      this.activityLoading = true;
      try {
        const params = {
          page: this.activityPagination.page,
          pageSize: this.activityPagination.pageSize,
          name: this.activitySearchForm.name,
        };
        const res = await getActivityPage(params);
        this.activityList = res.records || [];
        this.activityPagination.total = res.total;
      } catch (error) {
        console.error("获取活动失败：", error);
        this.$message.error("获取活动列表失败");
      } finally {
        this.activityLoading = false;
      }
    },
    // 选择活动
    handleActivitySelectionChange(val) {
      this.selectedActivityIds = val.map((item) => item.id);
    },
    // 确认选择活动
    confirmActivitySelect() {
      if (this.selectedActivityIds.length === 0) {
        this.$message.warning("请至少选择一个活动");
        return;
      }

      // 1. 提取已选活动ID列表
      const existingActivityIds = this.packageForm.packageActivities.map(
        (item) => item.activityId
      );
      // 2. 筛选出未选中过的活动ID
      const newActivityIds = this.selectedActivityIds.filter(
        (id) => !existingActivityIds.includes(id)
      );

      // 3. 校验是否有重复选择
      const duplicateIds = this.selectedActivityIds.filter((id) =>
        existingActivityIds.includes(id)
      );
      if (duplicateIds.length > 0) {
        this.$message.warning(
          `以下活动已选择，请勿重复添加：${duplicateIds.join(", ")}`
        );
      }

      // 4. 仅添加未重复的活动
      if (newActivityIds.length > 0) {
        const newActivities = newActivityIds.map((id) => ({
          activityId: id,
        }));
        this.packageForm.packageActivities = [
          ...this.packageForm.packageActivities,
          ...newActivities,
        ];
        this.$message.success(`成功选择${newActivityIds.length}个新活动`);
      }

      this.activityDialogVisible = false;
    },
    // 删除已选活动
    deleteActivity(index) {
      this.packageForm.packageActivities.splice(index, 1);
    },

    async fetchData() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm,
        };
        const res = await getPackagePage(params);
        let realTableData = [];
        realTableData = res.records || res.list;
        this.pagination.total = res.total;

        const realDataWithFlag = realTableData.map((item) => ({
          ...item,
          isEmpty: false,
        }));
        const emptyRowCount =
          this.pagination.pageSize - realDataWithFlag.length;
        const emptyRows = Array.from({ length: emptyRowCount }).map(
          (_, index) => ({
            id: `empty-${this.pagination.page}-${index}`,
            name: "",
            categoryId: "",
            score: "",
            status: "",
            createTime: "",
            updateTime: "",
            isEmpty: true,
            description: "",
            image: "",
            packageActivities: [],
          })
        );
        this.tableData = [...realDataWithFlag, ...emptyRows];
        this.$nextTick(() => {
          this.$refs.tableRef?.clearSelection();
          this.selectedIds = [];
        });
      } catch (error) {
        console.error("fetchData error:", error);
        this.$message.error("获取套餐数据失败");
        this.tableData = Array.from({ length: this.pagination.pageSize }).map(
          (_, index) => ({
            id: `empty-error-${index}`,
            name: "",
            categoryId: "",
            score: "",
            status: "",
            createTime: "",
            updateTime: "",
            isEmpty: true,
            description: "",
            image: "",
            packageActivities: [],
          })
        );
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
        categoryId: null,
        description: "",
        image: "",
        name: "",
        packageActivities: [],
        price: 0,
        status: null, // 新增活动默认状态为空
        score: 0,
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.packageForm?.clearValidate();
      });
    },

    async handleEdit(row) {
      this.dialogTitle = "编辑活动套餐";
      this.isEdit = true;
      this.dialogVisible = true;
      this.loading = true;
      try {
        const res = await getPackageDetail(row.id);
        const detailData = res;
        this.packageForm = {
          ...detailData,
          status: detailData.status, // 回显状态
          packageActivities: detailData.packageActivities || [], // 回显已选活动
        };
      } catch (error) {
        console.error("获取套餐详情失败：", error);
        this.$message.error("获取套餐详情失败，请重试");
        this.dialogVisible = false;
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.$refs.packageForm?.clearValidate();
        });
      }
    },

    beforeUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        this.$message.error("请上传图片格式文件！");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过2MB！");
        return false;
      }
      return true;
    },

    async handleManualUpload(params) {
      try {
        const res = await uploadFile(params.file);
        this.packageForm.image = res; // 将接口返回的图片URL赋值到表单
        this.$message.success("图片上传成功");
      } catch (error) {
        console.error("上传失败：", error);
        this.$message.error("图片上传失败，请重试");
      }
    },

    clearImage() {
      this.packageForm.image = "";
    },

    handleSubmit() {
      this.$refs.packageForm.validate(async (valid) => {
        if (!valid) return;
        this.submitLoading = true;
        try {
          // 组装最终提交数据（完全匹配要求：包含status，移除categoryName）
          const submitData = {
            categoryId: this.packageForm.categoryId,
            description: this.packageForm.description,
            image: this.packageForm.image,
            name: this.packageForm.name,
            packageActivities: this.packageForm.packageActivities.map(
              (item) => ({ activityId: item.activityId })
            ),
            price: this.packageForm.price,
            status: this.packageForm.status, // 必传status
            score: this.packageForm.score, // 按需传递积分
          };
          // 编辑时补充ID
          if (this.isEdit) {
            submitData.id = this.packageForm.id;
          }
          const apiFunc = this.isEdit ? updatePackage : addPackage;
          await apiFunc(submitData);

          this.$message.success(this.isEdit ? "更新成功" : "新增成功");
          this.dialogVisible = false;
          this.fetchData();
        } catch (error) {
          console.error("提交失败：", error);
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
        await changePackageStatus(row.id, row.status);

        this.$message.success("状态更新成功");
        this.fetchData();
      } catch (error) {
        row.status = originalStatus;
      }
    },

    handleSelectionChange(val) {
      this.selectedIds = val.map((item) => item.id);
    },

    async handleBatchDelete() {
      const deleteIds = [...this.selectedIds];
      if (deleteIds.length === 0) {
        this.$message.warning("请选择要删除的套餐");
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
        await deletePackage(deleteIds); // 传入ID数组

        this.$message.success(`成功删除${deleteIds.length}个套餐`);
        this.$refs.tableRef?.clearSelection(); // 清空选中状态
        this.selectedIds = []; // 重置selectedIds
        this.fetchData();
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
/* 新增：空行通用样式 */
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

/* 活动选择弹窗样式 */
.mb10 {
  margin-bottom: 10px;
}
.selected-activities {
  max-height: 100px;
  overflow-y: auto;
}
</style>
<template>
  <div class="admin-manager">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        添加管理员
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="admin-filters" style="margin-top: 12px">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 管理员列表表格 -->
    <el-table
      :data="adminList"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" fixed="right" width="250" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            style="color: #409eff"
            icon="el-icon-star-on"
            v-if="canPromote(scope.row)"
            @click="handlePromote(scope.row)"
          >
            设为超管
          </el-button>
          <el-button
            type="text"
            size="small"
            :style="{ color: scope.row.status === 1 ? '#F56C6C' : '#67C23A' }"
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 1 ? "禁用" : "启用" }}
          </el-button>
          <el-button
            type="text"
            size="small"
            style="color: #f56c6c"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[5, 10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right"
    />

    <!-- 添加/编辑管理员对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        :model="adminForm"
        :rules="formRules"
        ref="adminForm"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="adminForm.idNumber" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="adminForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select
            v-model="adminForm.sex"
            placeholder="请选择性别"
            style="width: 100%"
          >
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" v-if="isEdit">
          <el-tag :type="adminForm.status === 1 ? 'success' : 'danger'">
            {{ adminForm.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </el-form-item>

        <el-form-item label="创建时间" v-if="isEdit">
          <el-input :value="adminForm.createTime" disabled />
        </el-form-item>
        <el-form-item label="创建人" v-if="isEdit">
          <el-input :value="adminForm.createUser" disabled />
        </el-form-item>
        <el-form-item label="更新时间" v-if="isEdit">
          <el-input :value="adminForm.updateTime" disabled />
        </el-form-item>
        <el-form-item label="更新人" v-if="isEdit">
          <el-input :value="adminForm.updateUser" disabled />
        </el-form-item>
        <el-form-item label="密码" v-if="isEdit">
          <el-input :value="adminForm.password" disabled type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitLoading"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAdminList as getAdminListApi,
  addAdmin as addAdminApi,
  updateAdmin as updateAdminApi,
  deleteAdmin as deleteAdminApi,
  updateAdminStatus as updateAdminStatusApi,
  getAdminDetail as getAdminDetailApi,
  promoteToSuperAdmin,
} from "@/api/auth";

export default {
  name: "AdminPanel",
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号"));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      submitLoading: false,
      adminList: [],
      pagination: {
        currentPage: 1,
        pageSize: 5,
        total: 0,
      },
      searchForm: {
        name: "",
      },
      dialogVisible: false,
      isEdit: false,
      adminForm: {
        id: null,
        username: "",
        idNumber: "",
        name: "",
        phone: "",
        sex: "",
        status: 1,
        createTime: "",
        createUser: 0,
        updateTime: "",
        updateUser: 0,
        password: "",
      },
      formRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur",
          },
        ],
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        sex: [{ required: true, message: "请选择性别", trigger: "change" }],
      },
    };
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? "编辑管理员" : "添加管理员";
    },
  },
  mounted() {
    this.getAdminList();
  },
  methods: {
    // 是否可设为超管：当前行非超管，且不是自己（可按需调整）
    canPromote(row) {
      // 如果有登录用户信息，可对比 row.id !== this.$store.state.user.id
      return row && row.role !== "超级管理员";
    },

    async handlePromote(row) {
      try {
        await this.$confirm(
          `确认将【${row.username || row.name || row.id}】设为超级管理员吗？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );
        await promoteToSuperAdmin(row.id);
        this.$message.success("已设为超级管理员");
        // 后端若将当前用户降为普通管理员，这里可根据返回值进行提示与跳转
        this.getAdminList();
      } catch (e) {
        if (e !== "cancel") this.$message.error("设为超管失败");
      }
    },
    // 后端数据 -> 前端展示
    mapRecordToUI(record) {
      return {
        id: record.id,
        username: record.username,
        idNumber: record.idNumber || "",
        name: record.name || "",
        phone: record.phone || "",
        sex: record.sex || "",
        status:
          typeof record.status === "number"
            ? record.status
            : record.status
            ? 1
            : 0,
        createTime: record.createTime || "",
        createUser: record.createUser || 0,
        updateTime: record.updateTime || "",
        updateUser: record.updateUser || 0,
        password: record.password || "",
      };
    },

    // 表单 -> 后端请求载荷
    mapFormToPayload(form) {
      const payload = {};
      if (form.id !== null && form.id !== undefined && form.id !== 0)
        payload.id = form.id;
      if (form.username) payload.username = form.username;
      if (form.name) payload.name = form.name;
      if (form.phone) payload.phone = form.phone;
      if (form.sex) payload.sex = form.sex;
      if (form.idNumber) payload.idNumber = form.idNumber;
      return payload;
    },

    // 获取管理员列表（分页）
    async getAdminList() {
      console.log(123);

      this.loading = true;
      try {
        const response = await getAdminListApi({
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          name: this.searchForm.name,
        });
        console.log(response);

        const data = response && response.data ? response.data : response;
        const records = (data && (data.records || data.list)) || [];

        this.adminList = records.map(this.mapRecordToUI);
        this.pagination.total = (data && data.total) || 0;
      } catch (error) {
        this.$message.error("获取管理员列表失败");
      } finally {
        this.loading = false;
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1;
      this.getAdminList();
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        name: "",
      };
      this.pagination.currentPage = 1;
      this.getAdminList();
    },

    // 根据 ID 获取管理员详情
    async getAdminById(id) {
      try {
        const response = await getAdminDetailApi(id);
        const data = response.data || response;
        return this.mapRecordToUI(data);
      } catch (error) {
        this.$message.error("获取管理员详情失败");
        return null;
      }
    },

    // 添加管理员
    handleAdd() {
      this.isEdit = false;
      this.dialogVisible = true;
      this.resetForm();
    },

    // 编辑管理员
    async handleEdit(row) {
      this.isEdit = true;
      this.dialogVisible = true;
      const adminData = await this.getAdminById(row.id);
      if (adminData) {
        this.adminForm = { ...adminData };
      }
    },

    // 修改状态
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1;
      const statusText = newStatus === 1 ? "启用" : "禁用";
      this.$confirm(`确定要${statusText}该管理员吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await updateAdminStatusApi(row.id, newStatus);
            this.$message.success(`${statusText}成功`);
            this.getAdminList();
          } catch (error) {
            this.$message.error(`${statusText}失败`);
          }
        })
        .catch(() => {});
    },

    // 删除管理员
    handleDelete(row) {
      this.$confirm("确定要删除该管理员吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await deleteAdminApi(row.id);
            this.$message.success("删除成功");
            this.getAdminList();
          } catch (error) {
            this.$message.error("删除失败");
          }
        })
        .catch(() => {});
    },

    // 提交表单
    handleSubmit() {
      this.$refs.adminForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true;
          try {
            if (this.isEdit) {
              await updateAdminApi(this.mapFormToPayload(this.adminForm));
              this.$message.success("更新成功");
            } else {
              await addAdminApi(this.mapFormToPayload(this.adminForm));
              this.$message.success("添加成功");
            }
            this.dialogVisible = false;
            this.getAdminList();
          } catch (error) {
            this.$message.error(this.isEdit ? "更新失败" : "添加失败");
          } finally {
            this.submitLoading = false;
          }
        }
      });
    },

    // 关闭对话框
    handleDialogClose() {
      this.resetForm();
    },

    // 重置表单
    resetForm() {
      this.adminForm = {
        id: null,
        username: "",
        idNumber: "",
        name: "",
        phone: "",
        sex: "",
        status: 1,
        createTime: "",
        createUser: 0,
        updateTime: "",
        updateUser: 0,
        password: "",
      };
      this.$nextTick(() => {
        this.$refs.adminForm && this.$refs.adminForm.clearValidate();
      });
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
      this.getAdminList();
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.getAdminList();
    },
  },
};
</script>

<style scoped>
.admin-manager {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>

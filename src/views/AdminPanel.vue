<template>
  <div class="admin-manager">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
        v-if="isEmp"
      >
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
      <el-table-column prop="id" label="ID" width="80" align="center">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="150">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="120">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.phone }}
        </template>
      </el-table-column>
      <!-- 身份证号脱敏展示 -->
      <el-table-column prop="idNumber" label="身份证号" width="180">
        <template slot-scope="scope">
          <template v-if="!scope.row.isEmpty && scope.row.idNumber">
            {{ formatIdCard(scope.row.idNumber) }}
          </template>
          <span v-else> </span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <template v-if="!scope.row.isEmpty">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
          <span v-else> </span>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.isEmpty ? " " : scope.row.updateTime }}
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="250" align="center">
        <template slot-scope="scope">
          <template v-if="!scope.row.isEmpty">
            <!-- 仅管理员显示操作按钮 -->
            <template v-if="isEmp">
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
                :style="{
                  color: scope.row.status === 1 ? '#F56C6C' : '#67C23A',
                }"
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
            <!-- 教师仅显示「无操作」提示（可选） -->
            <span v-else-if="isTeacher" style="color: #999">无操作权限</span>
          </template>
          <span v-else> </span>
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
          <el-input
            v-model="adminForm.username"
            placeholder="请输入用户名（字母/数字/下划线，以字母开头）"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input
            v-model="adminForm.idNumber"
            placeholder="请输入18位身份证号"
            maxlength="18"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="adminForm.name"
            placeholder="请输入真实姓名（2-10个汉字）"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="adminForm.phone"
            placeholder="请输入11位手机号"
            maxlength="11"
          />
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
import { mapGetters } from "vuex";

export default {
  name: "AdminPanel",
  data() {
    // 手机号正则：11位，以13/14/15/16/17/18/19开头
    const validatePhone = (rule, value, callback) => {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!value) {
        callback(new Error("请输入手机号"));
      } else if (!phoneReg.test(value)) {
        callback(new Error("请输入正确的11位手机号"));
      } else {
        callback();
      }
    };

    // 身份证号正则：18位，最后一位可含X/x
    const validateIdCard = (rule, value, callback) => {
      const idCardReg =
        /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if (!value) {
        callback(new Error("请输入身份证号"));
      } else if (!idCardReg.test(value)) {
        callback(new Error("请输入正确的18位身份证号"));
      } else {
        // 可选：身份证号校验位验证（更严格）
        const idCard = value.toUpperCase();
        const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        const checkCode = [
          "1",
          "0",
          "X",
          "9",
          "8",
          "7",
          "6",
          "5",
          "4",
          "3",
          "2",
        ];
        let sum = 0;
        for (let i = 0; i < 17; i++) {
          sum += idCard[i] * factor[i];
        }
        const remainder = sum % 11;
        if (idCard[17] !== checkCode[remainder]) {
          callback(new Error("身份证号校验位错误，请检查"));
        } else {
          callback();
        }
      }
    };

    // 用户名正则：3-20位，字母/数字/下划线，以字母开头
    const validateUsername = (rule, value, callback) => {
      const usernameReg = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
      if (!value) {
        callback(new Error("请输入用户名"));
      } else if (value.length < 3 || value.length > 20) {
        callback(new Error("用户名长度必须在3-20个字符之间"));
      } else if (!usernameReg.test(value)) {
        callback(new Error("用户名仅支持字母、数字、下划线，且以字母开头"));
      } else {
        callback();
      }
    };

    // 姓名正则：2-10个汉字
    const validateName = (rule, value, callback) => {
      const nameReg = /^[\u4e00-\u9fa5]{2,10}$/;
      if (!value) {
        callback(new Error("请输入真实姓名"));
      } else if (!nameReg.test(value)) {
        callback(new Error("请输入2-10个汉字的真实姓名"));
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
          { required: true, validator: validateUsername, trigger: "blur" },
        ],
        idNumber: [
          { required: true, validator: validateIdCard, trigger: "blur" },
        ],
        name: [{ required: true, validator: validateName, trigger: "blur" }],
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        sex: [
          { required: true, message: "请选择性别", trigger: "change" },
          { type: "string", message: "性别只能是男或女", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? "编辑管理员" : "添加管理员";
    },
    ...mapGetters("user", ["isEmp", "isTeacher"]),
  },
  mounted() {
    this.getAdminList();
  },
  methods: {
    // 身份证号脱敏（显示前6后4，中间用*代替）
    formatIdCard(idCard) {
      if (!idCard || idCard.length !== 18) return idCard;
      return idCard.replace(/^(\d{6})\d{8}(\d{4})$/, "$1********$2");
    },

    // 是否可设为超管：当前行非超管，且不是自己（可按需调整）
    canPromote(row) {
      // 如果有登录用户信息，可对比 row.id !== this.$store.state.user.id
      return row && row.role !== "超级管理员";
    },

    async handlePromote(row) {
      if (!this.isEmp) {
        this.$message.warning("仅管理员可设置超级管理员");
        return;
      }
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
      this.loading = true;
      try {
        const response = await getAdminListApi({
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          name: this.searchForm.name,
        });

        const data = response && response.data ? response.data : response;
        const records = (data && (data.records || data.list)) || [];
        // const records = [
        //   {
        //     id: 1001,
        //     username: "admin_1001",
        //     idNumber: "43010219900123456X",
        //     name: "超级管理员",
        //     phone: "13800138001",
        //     sex: "男",
        //     status: 1,
        //     role: "超级管理员",
        //     createTime: "2025-12-01 10:00:30",
        //     updateTime: "2025-12-06 14:20:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        //   {
        //     id: 1002,
        //     username: "admin_1002",
        //     idNumber: "430102199002234561",
        //     name: "管理员2",
        //     phone: "13800138002",
        //     sex: "女",
        //     status: 1,
        //     role: "普通管理员",
        //     createTime: "2025-12-02 10:10:30",
        //     updateTime: "2025-12-07 14:21:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        //   {
        //     id: 1003,
        //     username: "admin_1003",
        //     idNumber: "430102199003234562",
        //     name: "管理员3",
        //     phone: "13800138003",
        //     sex: "男",
        //     status: 0, // 禁用状态
        //     role: "普通管理员",
        //     createTime: "2025-12-03 10:20:30",
        //     updateTime: "2025-12-08 14:22:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        //   {
        //     id: 1004,
        //     username: "admin_1004",
        //     idNumber: "430102199004234563",
        //     name: "管理员4",
        //     phone: "13800138004",
        //     sex: "女",
        //     status: 1,
        //     role: "普通管理员",
        //     createTime: "2025-12-04 10:30:30",
        //     updateTime: "2025-12-09 14:23:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        //   {
        //     id: 1005,
        //     username: "admin_1005",
        //     idNumber: "430102199005234564",
        //     name: "管理员5",
        //     phone: "13800138005",
        //     sex: "男",
        //     status: 1,
        //     role: "普通管理员",
        //     createTime: "2025-12-05 10:40:30",
        //     updateTime: "2025-12-10 14:24:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        //   {
        //     id: 1006,
        //     username: "admin_1006",
        //     idNumber: "430102199006234565",
        //     name: "管理员6",
        //     phone: "13800138006",
        //     sex: "女",
        //     status: 0, // 禁用状态
        //     role: "普通管理员",
        //     createTime: "2025-12-06 10:50:30",
        //     updateTime: "2025-12-11 14:25:15",
        //     createUser: 1,
        //     updateUser: 1,
        //     password: "******",
        //   },
        // ];
        console.log(records);

        // 1. 映射真实数据
        const realAdminList = records.map(this.mapRecordToUI);

        // 2. 计算需要补充的空行数量
        const emptyRowCount = this.pagination.pageSize - realAdminList.length;
        // 3. 生成空行（字段和真实数据一致，值为空/默认）
        const emptyRows = Array.from({ length: emptyRowCount }).map(
          (_, index) => ({
            id: `empty-${this.pagination.currentPage}-${index}`, // 唯一key
            username: "",
            name: "",
            phone: "",
            status: "",
            createTime: "",
            updateTime: "",
            // 其他字段置空，保证和真实行结构一致
            idNumber: "",
            sex: "",
            createUser: "",
            updateUser: "",
            password: "",
            isEmpty: true, // 标记空行，方便后续样式/逻辑处理
          })
        );

        // 4. 合并真实数据 + 空行
        this.adminList = [...realAdminList, ...emptyRows];
        // this.pagination.total = (data && data.total) || 0;
      } catch (error) {
        this.$message.error("获取管理员列表失败");
        this.adminList = Array.from({ length: this.pagination.pageSize }).map(
          () => ({
            id: "",
            username: "",
            name: "",
            phone: "",
            status: "",
            createTime: "",
            updateTime: "",
            isEmpty: true,
          })
        );
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
      if (!this.isEmp) {
        this.$message.warning("仅管理员可添加管理员");
        return;
      }
      this.isEdit = false;
      this.dialogVisible = true;
      this.resetForm();
    },

    // 编辑管理员
    async handleEdit(row) {
      if (!this.isEmp) {
        this.$message.warning("仅管理员可编辑管理员");
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      const adminData = await this.getAdminById(row.id);
      if (adminData) {
        this.adminForm = { ...adminData };
      }
    },

    // 修改状态
    handleStatusChange(row) {
      if (!this.isEmp) {
        this.$message.warning("仅管理员可修改管理员状态");
        return;
      }
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
      if (!this.isEmp) {
        this.$message.warning("仅管理员可删除管理员");
        return;
      }
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
      if (!this.isEmp) {
        this.$message.warning("仅管理员可提交管理员信息");
        return;
      }
      this.$refs.adminForm.validate(async (valid) => {
        if (valid) {
          // 最终兜底校验（防止前端校验被绕过）
          if (!/^1[3-9]\d{9}$/.test(this.adminForm.phone)) {
            this.$message.error("手机号格式错误");
            return;
          }
          if (
            !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
              this.adminForm.idNumber
            )
          ) {
            this.$message.error("身份证号格式错误");
            return;
          }

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

/* 新增：空行样式 */
::v-deep .el-table .el-table__row td {
  height: 50px; /* 固定行高，保证占位一致 */
}

/* 空行文字置灰，区分真实数据 */
::v-deep .el-table .el-table__row td:has(> span:only-child) {
  color: #c0c4cc;
}

/* 空行hover无高亮 */
::v-deep .el-table .el-table__row:hover td {
  background-color: inherit !important;
}
/* 仅真实数据行hover高亮 */
::v-deep .el-table .el-table__row:not(:has(> span:only-child)):hover td {
  background-color: #f5f7fa !important;
}

/* 隐藏空行的操作按钮区域多余空白（可选） */
::v-deep .el-table .el-table__row td:last-child:has(> span:only-child) {
  background-color: #fafafa;
}
</style>
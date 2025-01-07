<template>
  <div class="flex flex-col gap-4">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-2">
        <el-icon class="text-xl text-primary"><DataAnalysis /></el-icon>
        <h2 class="text-lg font-medium">用户管理</h2>
      </div>
      <div class="flex items-center gap-3">
        <el-input
          v-model="searchText"
          placeholder="搜索用户..."
          class="w-60"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button 
          type="primary" 
          @click="handleCreate"
        >
          <el-icon><Plus /></el-icon>新建用户
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table 
        :data="filteredUsers" 
        v-loading="loading" 
        style="width: 100%"
        :header-cell-style="{ background: '#f8f9fa' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名" min-width="160">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="性别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getGenderType(row.gender)" size="small" effect="light">
              {{ getGenderLabel(row.gender) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :loading="row.statusLoading"
              @change="(val) => handleStatusChange(row, val)"
              active-text="已激活"
              inactive-text="未激活"
              inline-prompt
              :active-icon="Check"
              :inactive-icon="Close"
              class="status-switch"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                :icon="Edit" 
                @click="handleEdit(row)"
                plain
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                @click="handleDelete(row)"
                plain
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editForm.id ? '编辑用户' : '新建用户'"
      width="460px"
      destroy-on-close
    >
      <el-form 
        :model="editForm" 
        :rules="rules" 
        ref="formRef"
        label-width="60px"
        class="py-4"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
            <el-radio :label="2">未知</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 状态修改对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="getStatusDialogTitle"
      width="360px"
      :show-close="false"
      class="status-dialog"
    >
      <div class="flex flex-col items-center py-6">
        <div class="mb-4">
          <el-icon :class="[
            'text-4xl',
            selectedUser?.status === 1 ? 'text-emerald-500' : 'text-amber-500'
          ]">
            <Check v-if="selectedUser?.status === 1" />
            <Close v-else />
          </el-icon>
        </div>
        <p class="text-gray-600 text-center mb-2">
          {{ getStatusDialogContent }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-3 pb-2">
          <el-button 
            plain
            @click="statusDialogVisible = false"
          >
            取消
          </el-button>
          <el-button 
            :type="selectedUser?.status === 1 ? 'success' : 'warning'"
            @click="handleStatusConfirm"
          >
            确定{{ selectedUser?.status === 1 ? '激活' : '禁用' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, toRefs } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user'
import { 
  DataAnalysis, Plus, Edit, Delete, 
  Search, Refresh, User, Message, Check, Close 
} from '@element-plus/icons-vue'

// 表单默认值
const defaultForm = {
  id: null,
  name: '',
  email: '',
  gender: 2,
  status: 0
}

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 状态管理
const state = reactive({
  loading: false,
  users: [],
  searchText: '',
  dialogVisible: false,
  editForm: { ...defaultForm },
  statusDialogVisible: false,
  selectedUser: null
})

// 计算属性
const filteredUsers = computed(() => {
  if (!state.searchText) return state.users
  const search = state.searchText.toLowerCase()
  return state.users.filter(user => {
    const name = (user.name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    return name.includes(search) || email.includes(search)
  })
})

// 方法
const fetchUsers = async () => {
  state.loading = true
  try {
    const response = await userApi.getUsers()
    state.users = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    state.users = []
  } finally {
    state.loading = false
  }
}

const handleCreate = () => {
  state.editForm = { ...defaultForm }
  state.dialogVisible = true
}

const handleEdit = (row) => {
  state.editForm = { ...row }
  state.dialogVisible = true
}

const formRef = ref(null)

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    // 等待表单验证
    await formRef.value.validate()
    
    // 解构表单数据，只保留需要的字段
    const { id, name, email, gender, status } = state.editForm
    const data = { name, email, gender, status }
    
    console.log('Saving user:', { id, data }) // 添加日志
    
    if (id) {
      // 编辑现有用户
      await userApi.updateUser(id, data)
      ElMessage.success('更新成功')
    } else {
      // 创建新用户
      await userApi.createUser(data)
      ElMessage.success('创建成功')
    }
    
    state.dialogVisible = false
    fetchUsers()
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response?.data?.message) {
      // 如果是数组，将所有错误信息连接起来
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join('; ')
        : error.response.data.message
      ElMessage.error(errorMessage)
    } else if (error.message) {
      ElMessage.error(error.message)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该用户，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'delete-confirm-dialog',
        draggable: false,
        center: true,
        showClose: false
      }
    )
    
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 修改用户状态枚举的值
const UserStatusEnum = {
  Activated: 1,    // 1 表示激活状态
  Inactivated: 0   // 0 表示停用状态
}

// 修改状态处理函数
const handleStatusChange = async (row, value) => {
  try {
    const isActivating = value === UserStatusEnum.Activated  // 1 表示激活
    await ElMessageBox.confirm(
      `确定要${isActivating ? '激活' : '禁用'}用户 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: isActivating ? 'success' : 'warning',
        customClass: 'status-confirm-dialog',
        draggable: false,
        center: true,
        showClose: false
      }
    )

    row.statusLoading = true
    if (isActivating) {
      await userApi.activateUser(row.id)
      ElMessage.success('用户已激活')
    } else {
      await userApi.deactivateUser(row.id)
      ElMessage.success('用户已禁用')
    }
    await fetchUsers()
  } catch (error) {
    row.status = value === UserStatusEnum.Activated ? UserStatusEnum.Inactivated : UserStatusEnum.Activated
    if (error !== 'cancel') {
      console.error('状态修改失败:', error)
    }
  } finally {
    row.statusLoading = false
  }
}

// 工具函数
const getGenderLabel = (gender) => ({ 0: '男', 1: '女', 2: '未知' }[gender] || '未知')
const getGenderType = (gender) => ({ 0: 'primary', 1: 'danger', 2: 'info' }[gender] || 'info')
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期钩子
onMounted(() => {
  fetchUsers()
})

// 导出到模板
const { 
  loading, 
  users, 
  searchText, 
  dialogVisible, 
  editForm,
  statusDialogVisible,
  selectedUser 
} = toRefs(state)
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  border-radius: 8px;
  
  .el-table__header {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
}

.el-button-group {
  .el-button {
    padding: 5px 12px;
  }
}

:deep(.status-dialog) {
  .el-dialog__header {
    margin: 0;
    padding: 20px 20px 10px;
    text-align: center;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }
  
  .el-dialog__footer {
    padding-top: 10px;
    padding-bottom: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.delete-confirm-dialog) {
  border-radius: 8px;
  
  .el-message-box__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .el-message-box__content {
    padding: 24px;
    
    .el-message-box__message {
      font-size: 14px;
    }
  }
  
  .el-message-box__btns {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    
    button {
      min-width: 80px;
      
      &.el-button--primary {
        margin-left: 12px;
      }
    }
  }
}

:deep(.status-switch) {
  --el-switch-on-color: var(--el-color-success);
  --el-switch-off-color: var(--el-color-warning);
  
  .el-switch__core {
    .el-switch__inner {
      .is-icon {
        font-size: 12px;
      }
    }
  }
}

:deep(.status-confirm-dialog) {
  border-radius: 8px;
  
  .el-message-box__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .el-message-box__content {
    padding: 24px;
    
    .el-message-box__message {
      font-size: 14px;
    }
  }
  
  .el-message-box__btns {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    
    button {
      min-width: 80px;
      
      &.el-button--primary {
        margin-left: 12px;
      }
    }
  }
}
</style> 
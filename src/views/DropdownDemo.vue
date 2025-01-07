<template>
  <div class="flex flex-col gap-6">
    <el-card>
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2"><OfficeBuilding /></el-icon>
          下拉菜单示例
        </div>
      </template>
      
      <!-- Command 模式 -->
      <div class="flex flex-col gap-4">
        <div class="text-lg font-medium mb-2">Command 模式</div>
        <el-dropdown 
          v-loading="loading"
          trigger="click"
          @command="handleCommand"
        >
          <el-button type="primary">
            {{ currentOrg || '请选择机构' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="org in organizations" 
                :key="org.id"
                :command="org.id"
              >
                {{ org.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Click 模式 -->
      <div class="flex flex-col gap-4 mt-8">
        <div class="text-lg font-medium mb-2">Click 模式</div>
        <el-dropdown 
          v-loading="loading"
          trigger="click"
        >
          <el-button type="primary">
            {{ currentOrg || '请选择机构' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="org in organizations" 
                :key="org.id"
                @click="handleClick(org)"
              >
                {{ org.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- Select 模式 -->
      <div class="flex flex-col gap-4 mt-8">
        <div class="text-lg font-medium mb-2">Select 模式</div>
        <el-select
          v-model="selectedOrg"
          v-loading="loading"
          placeholder="请选择机构"
          style="width: 240px"
          @change="handleSelect"
        >
          <el-option
            v-for="org in organizations"
            :key="org.id"
            :label="org.name"
            :value="org.id"
          />
        </el-select>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { OfficeBuilding, ArrowDown } from '@element-plus/icons-vue'

// 模拟接口数据
const mockOrganizations = [
  { id: 1, name: '总公司' },
  { id: 2, name: '北京分公司' },
  { id: 3, name: '上海分公司' },
  { id: 4, name: '广州分公司' },
  { id: 5, name: '深圳分公司' }
]

// 状态管理
const organizations = ref([])
const loading = ref(true)
const selectedOrg = ref('')
const currentOrg = ref('')

// 模拟 API 调用
const fetchOrganizations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockOrganizations)
    }, 3000)
  })
}

// 初始化数据
onMounted(async () => {
  try {
    const data = await fetchOrganizations()
    organizations.value = data
    selectedOrg.value = data[0].id
    currentOrg.value = data[0].name
    loading.value = false
  } catch (error) {
    console.error('获取机构列表失败:', error)
  }
})

// 处理命令模式选择
const handleCommand = (command) => {
  const org = organizations.value.find(org => org.id === command)
  if (org) {
    currentOrg.value = org.name
  }
}

// 处理点击模式选择
const handleClick = (org) => {
  currentOrg.value = org.name
}

// 处理 Select 选择
const handleSelect = (value) => {
  const org = organizations.value.find(org => org.id === value)
  if (org) {
    currentOrg.value = org.name
  }
}
</script> 
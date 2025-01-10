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
          <span class="flex items-center cursor-pointer text-primary hover:text-primary-light">
            {{ currentOrg || '请选择机构' }}
            <el-icon class="ml-1"><ArrowDown /></el-icon>
          </span>
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
          <span class="flex items-center cursor-pointer text-primary hover:text-primary-light">
            {{ currentOrg || '请选择机构' }}
            <el-icon class="ml-1"><ArrowDown /></el-icon>
          </span>
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
  { id: 1, name: '模拟医院1' },
  { id: 2, name: '模拟医院2' },
  { id: 3, name: '模拟医院3' },
  { id: 4, name: '模拟医院4' },
  { id: 5, name: '模拟医院5' }
]

// 状态管理
const organizations = ref([])
const loading = ref(true)
const selectedOrg = ref('')
const currentOrg = ref('')
const detailLoading = ref(false)

// 模拟 API 调用
const fetchOrganizations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockOrganizations)
    },500)
  })
}

// 添加模拟的接口请求方法
const fetchOrgDetail = async (orgId) => {
  console.log('正在请求机构详情...')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: orgId,
        detail: `这是机构 ${orgId} 的详细信息`
      })
    }, 1000)
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
const handleCommand = async (command) => {
  const org = organizations.value.find(org => org.id === command)
  if (org) {
    currentOrg.value = org.name
    detailLoading.value = true
    try {
      const detail = await fetchOrgDetail(command)
      console.log('获取到的机构详情:', detail)
    } catch (error) {
      console.error('获取机构详情失败:', error)
    } finally {
      detailLoading.value = false
    }
  }
}

// 处理点击模式选择
const handleClick = (org) => {
  currentOrg.value = org.name
}

// 处理 Select 选择
const handleSelect = async (value) => {
  const org = organizations.value.find(org => org.id === value)
  if (org) {
    currentOrg.value = org.name
    // 如果需要请求详情
    detailLoading.value = true
    try {
      const detail = await fetchOrgDetail(value)
      console.log('获取到的机构详情:', detail)
    } catch (error) {
      console.error('获取机构详情失败:', error)
    } finally {
      detailLoading.value = false
    }
  }
}
</script> 
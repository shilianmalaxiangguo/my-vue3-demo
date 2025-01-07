<template>
  <el-container class="h-full">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="bg-[#304156]">
      <div class="h-[60px] flex items-center justify-center text-white text-xl">
        后台管理系统
      </div>
      <el-menu
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        :default-active="route.path"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/tab">
          <el-icon><Menu /></el-icon>
          <span>Tab 示例</span>
        </el-menu-item>
        <el-menu-item index="/flex">
          <el-icon><Grid /></el-icon>
          <span>Flex 布局</span>
        </el-menu-item>
        <el-menu-item index="/nested">
          <el-icon><Connection /></el-icon>
          <span>嵌套路由</span>
        </el-menu-item>
        <el-menu-item index="/table">
          <el-icon><List /></el-icon>
          <span>表格示例</span>
        </el-menu-item>
        <el-menu-item index="/tab-dialog">
          <el-icon><Operation /></el-icon>
          <span>Tab Dialog</span>
        </el-menu-item>
        <el-menu-item index="/psql-demo">
          <el-icon><DataAnalysis /></el-icon>
          <span>PSQL Demo</span>
        </el-menu-item>
        <el-menu-item index="/json-editor">
          <el-icon><Edit /></el-icon>
          <span>JSON 编辑器</span>
        </el-menu-item>
        <el-menu-item index="/audio-visualizer">
          <el-icon><Headset /></el-icon>
          <span>音频可视化</span>
        </el-menu-item>
        <el-menu-item index="/dropdown-demo">
          <el-icon><OfficeBuilding /></el-icon>
          <span>下拉菜单示例</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header height="60px" class="border-b flex items-center justify-between">
        <div class="flex items-center">
          <el-icon class="text-xl cursor-pointer"><Fold /></el-icon>
        </div>
        <el-dropdown>
          <span class="flex items-center cursor-pointer">
            <el-avatar :size="32" class="mr-2" />
            管理员
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="p-4">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  DataLine,
  Menu,
  Grid,
  Fold,
  List,
  Connection,
  Operation,
  DataAnalysis,
  Edit,
  Headset,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'

defineOptions({
  name: 'MyRouterView'
})

const route = useRoute()

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

<style lang="scss" scoped>
.el-aside {
  .el-menu {
    border-right: none;
  }
}

.el-header {
  background: #fff;
}
</style>


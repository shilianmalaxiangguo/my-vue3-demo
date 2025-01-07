<template>
  <el-container class="h-full">
    <!-- 侧边栏 -->
    <el-aside 
      :width="asideWidth"
      :class="[
        theme === 'dark' ? 'bg-[#304156]' : 'bg-white border-r',
      ]"
    >
      <div 
        class="h-[60px] flex items-center justify-between px-4"
        :class="[
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        ]"
      >
        <span class="text-xl truncate" v-show="!collapsed">后台管理系统</span>
        <!-- 主题切换按钮 -->
        <el-button
          v-show="!collapsed"
          :icon="theme === 'dark' ? Sunny : Moon"
          @click="toggleTheme"
          :class="[
            theme === 'dark' ? 'text-white' : 'text-gray-600'
          ]"
          class="!border-none !bg-transparent hover:!bg-opacity-10 hover:!bg-white"
        />
      </div>

      <el-menu
        v-bind="menuProps"
        :default-active="route.path"
        router
        :collapse="collapsed"
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
          <el-button
            :icon="collapsed ? Expand : Fold"
            @click="toggleCollapse"
            class="!border-none hover:bg-gray-100"
          />
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
import { computed, ref, onMounted } from 'vue'
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
  OfficeBuilding,
  Moon,
  Sunny,
  Expand
} from '@element-plus/icons-vue'
import { useSidebar } from '../store/sidebarStore'

defineOptions({
  name: 'MyRouterView'
})

const route = useRoute()
// 使用 sidebar store，添加 collapsed 和 toggleCollapse
const { theme, setTheme, collapsed, toggleCollapse, sidebarWidth } = useSidebar()

// 切换主题
const toggleTheme = () => {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

// 计算菜单的主题相关属性
const menuProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#304156' : '#ffffff',
  textColor: theme.value === 'dark' ? '#fff' : '#303133',
  activeTextColor: '#409EFF'
}))

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

// 计算侧边栏宽度
const asideWidth = computed(() => 
  collapsed.value ? '64px' : `${sidebarWidth.value}px`
)
</script>

<style lang="scss" scoped>
.el-aside {
  transition: all 0.3s ease;
  
  .el-menu {
    border-right: none;
  }

  // 添加折叠时的样式
  &.collapsed {
    .el-menu--collapse {
      border: none;
    }
  }
}

.el-header {
  background: #fff;
}

// 添加菜单折叠动画
:deep(.el-menu) {
  transition: width 0.3s ease;
}

// 优化折叠时的图标显示
:deep(.el-menu--collapse) {
  .el-menu-item {
    .el-icon {
      margin: 0;
    }
  }
}
</style>


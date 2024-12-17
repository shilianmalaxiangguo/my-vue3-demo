<template>
  <div class="nested-view">
    <el-card class="mb-4">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2"><Connection /></el-icon>
          嵌套路由示例
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane 
          v-for="route in nestedRoutes" 
          :key="route.path"
          :label="route.label"
          :name="route.path"
        />
      </el-tabs>
    </el-card>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Connection } from '@element-plus/icons-vue'

defineOptions({
  name: 'Nested'
})

const router = useRouter()
const route = useRoute()

const nestedRoutes = [
  { path: 'page1', label: '页面1' },
  { path: 'page2', label: '页面2' },
  { path: 'page3', label: '页面3' }
]

const activeTab = ref(route.path.split('/').pop())

const handleClick = (tab) => {
  router.push(`/nested/${tab.props.name}`)
}
</script> 
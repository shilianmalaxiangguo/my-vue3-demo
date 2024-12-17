<template>
  <el-card>
    <template #header>
      <div class="flex items-center">
        <el-icon class="mr-2"><Document /></el-icon>
        页面2
      </div>
    </template>
    <div>
      这是嵌套路由的页面2内容
    </div>
  </el-card>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'

defineOptions({
  name: 'NestedPage2'
})
</script> 
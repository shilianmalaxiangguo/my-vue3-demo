<template>
  <div>
    <h1 class="text-2xl mb-4">仪表盘</h1>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              用户总数
            </div>
          </template>
          <div class="text-2xl">1,234</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><View /></el-icon>
              访问量
            </div>
          </template>
          <div class="text-2xl">45,678</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { User, View } from '@element-plus/icons-vue'

defineOptions({
  name: 'Dashboard'
})
</script> 
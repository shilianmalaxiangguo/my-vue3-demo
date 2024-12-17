<template>
  <div class="flex flex-col h-full">
    <!-- 搜索区域 -->
    <div class="p-4 bg-white">
      <el-row :gutter="20">
        <el-col :span="6" v-for="field in searchFields" :key="field.key">
          <el-form-item :label="field.label">
            <el-input v-model="searchForm[field.key]" :placeholder="'请输入' + field.label" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="flex justify-end mt-4">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="flex-1 min-h-0">
      <el-table
        :data="tableData"
        height="100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="h-[40px] bg-gray-100">
    我是占位空间
  </div>
  </div>

</template>

<script setup>
import { ref } from 'vue'

// 搜索表单字段配置
const searchFields = [
  { key: 'name', label: '姓名' },
  { key: 'email', label: '邮箱' },
  { key: 'address', label: '地址' },
  { key: 'date', label: '日期' }
]

// 搜索表单数据
const searchForm = ref({})
const tableData = ref([])
const loading = ref(false)

// 生成模拟数据
const generateData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用户${i + 1}`,
    age: Math.floor(Math.random() * 50) + 18,
    email: `user${i + 1}@example.com`,
    address: `城市${Math.floor(i / 100) + 1}，街道${i % 100 + 1}号`
  }))
}

// 模拟请求数据
const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    tableData.value = generateData(1000)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchData()
const handleReset = () => {
  searchForm.value = {}
  fetchData()
}
const handleEdit = (row) => console.log('编辑', row)
const handleDelete = (row) => console.log('删除', row)

// 初始化数据
fetchData()
</script>

<style scoped>

</style> 
<template>
  <div class="flex flex-col gap-4 h-full">
    <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-2">
        <el-icon class="text-xl text-primary"><Edit /></el-icon>
        <h2 class="text-lg font-medium">JSON 编辑器</h2>
      </div>
      <el-radio-group v-model="editorType" size="small">
        <el-radio-button label="monaco">Monaco Editor</el-radio-button>
        <el-radio-button label="json">JSON Editor</el-radio-button>
      </el-radio-group>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 flex-1">
      <component 
        :is="currentEditor"
        v-if="isReady"
        v-model="jsonText" 
        class="h-full"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import MonacoJsonEditor from '../components/MonacoJsonEditor.vue'
import JsonTreeEditor from '../components/JsonTreeEditor.vue'

const defaultJson = {
  "title": {
    "text": "Stacked Line"
  },
  "tooltip": {
    "trigger": "axis"
  },
  "legend": {
    "data": [
      "Email",
      "Union Ads",
      "Video Ads",
      "Direct",
      "Search Engine"
    ]
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "3%",
    "containLabel": true
  },
  "toolbox": {
    "feature": {
      "saveAsImage": {}
    }
  },
  "xAxis": {
    "type": "category",
    "boundaryGap": false,
    "data": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "Email",
      "type": "line",
      "stack": "Total",
      "data": [
        120,
        132,
        101,
        134,
        90,
        230,
        210
      ]
    },
    {
      "name": "Union Ads",
      "type": "line",
      "stack": "Total",
      "data": [
        220,
        182,
        191,
        234,
        290,
        330,
        310
      ]
    },
    {
      "name": "Video Ads",
      "type": "line",
      "stack": "Total",
      "data": [
        150,
        232,
        201,
        154,
        190,
        330,
        410
      ]
    },
    {
      "name": "Direct",
      "type": "line",
      "stack": "Total",
      "data": [
        320,
        332,
        301,
        334,
        390,
        330,
        320
      ]
    },
    {
      "name": "Search Engine",
      "type": "line",
      "stack": "Total",
      "data": [
        820,
        932,
        901,
        934,
        1290,
        1330,
        1320
      ]
    }
  ]
}

const jsonText = ref('')
const isReady = ref(false)
const editorType = ref('monaco')

const currentEditor = computed(() => {
  return editorType.value === 'monaco' ? MonacoJsonEditor : JsonTreeEditor
})

onMounted(() => {
  nextTick(() => {
    jsonText.value = JSON.stringify(defaultJson, null, 2)
    isReady.value = true
  })
})
</script>

<style scoped>
.el-radio-group {
  margin-left: auto;
}
</style> 
<template>
  <div class="relative h-full">
    <div class="flex justify-end gap-2 relative">
      <el-button 
        size="small" 
        @click="formatJson"
        :icon="Refresh"
      >
        格式化
      </el-button>
      <el-button 
        size="small" 
        @click="toggleFullscreen"
        :icon="FullScreen"
      >
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
    </div>
    <div 
      ref="jsoneditor" 
      class="h-full"
    ></div>

    <!-- 全屏模式 -->
    <teleport to="body" :disabled="!isFullscreen">
      <div v-if="isFullscreen" class="fixed inset-0 bg-white z-50">
        <div class="absolute top-4 right-4 flex gap-2 z-[60]">
          <el-button 
            size="small" 
            @click="formatJson"
            :icon="Refresh"
          >
            格式化
          </el-button>
          <el-button 
            size="small" 
            @click="toggleFullscreen"
            :icon="FullScreen"
          >
            退出全屏
          </el-button>
        </div>
        <div 
          ref="fullscreenJsoneditor" 
          class="w-full h-full"
        ></div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'
import { ElMessage } from 'element-plus'
import { Refresh, FullScreen } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const jsoneditor = ref(null)
const editor = ref(null)
const isFullscreen = ref(false)
const fullscreenJsoneditor = ref(null)

onMounted(() => {
  const options = {
    mode: 'code',
    onChangeText: (jsonString) => {
      try {
        // 验证 JSON 格式
        JSON.parse(jsonString)
        emit('update:modelValue', jsonString)
      } catch (error) {
        console.error('Invalid JSON:', error)
      }
    }
  }
  
  editor.value = new JSONEditor(jsoneditor.value, options)
  try {
    editor.value.setText(props.modelValue)
  } catch (error) {
    console.error('Initial JSON error:', error)
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getText()) {
    try {
      editor.value.setText(newVal)
    } catch (error) {
      console.error('Watch JSON error:', error)
    }
  }
})

const formatJson = () => {
  if (editor.value) {
    try {
      editor.value.format()
      ElMessage.success('JSON 格式化成功')
    } catch (error) {
      ElMessage.error('JSON 格式错误')
    }
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  nextTick(async () => {
    // 保存当前内容
    const currentContent = editor.value?.getText() || ''
    
    // 销毁当前编辑器
    if (editor.value) {
      editor.value.destroy()
    }

    // 根据全屏状态选择容器并初始化新编辑器
    const container = isFullscreen.value ? fullscreenJsoneditor.value : jsoneditor.value
    editor.value = new JSONEditor(container, {
      mode: 'code',
      onChangeText: (jsonString) => {
        try {
          JSON.parse(jsonString)
          emit('update:modelValue', jsonString)
        } catch (error) {
          console.error('Invalid JSON:', error)
        }
      }
    })

    // 恢复内容
    try {
      editor.value.setText(currentContent)
    } catch (error) {
      console.error('Restore content error:', error)
    }
  })
}

onBeforeUnmount(() => {
  // 确保在组件销毁时清理
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
:deep(.jsoneditor) {
  border: 1px solid #eee;
  height: 100%;
}

:deep(.ace-jsoneditor) {
  min-height: 400px;
}

.el-button {
  background-color: white;
  opacity: 0.9;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-button:hover {
  opacity: 1;
}
</style> 
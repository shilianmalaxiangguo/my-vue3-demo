<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-end gap-2 mb-2">
      <el-button 
        size="small" 
        @click="repairJson"
        :icon="Tools"
      >
        修复JSON
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
      ref="editorContainer" 
      class="flex-1 min-h-0"
    ></div>

    <!-- 全屏模式 -->
    <teleport to="body" :disabled="!isFullscreen">
      <div v-if="isFullscreen" class="fixed inset-0 bg-white z-50 flex flex-col">
        <div class="absolute top-4 right-4 flex gap-2 z-[60]">
          <el-button 
            size="small" 
            @click="repairJson"
            :icon="Tools"
          >
            修复JSON
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
          ref="fullscreenEditorContainer" 
          class="flex-1 min-h-0"
        ></div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'
import { jsonrepair } from 'jsonrepair'
import { ElMessage } from 'element-plus'
import { Tools, FullScreen } from '@element-plus/icons-vue'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// 配置 Monaco Editor 的 worker
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    return new editorWorker()
  }
}

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const editorContainer = shallowRef(null)
const fullscreenEditorContainer = shallowRef(null)
const editor = shallowRef(null)
const isFullscreen = ref(false)
let contentChangeTimeout = null

// 创建编辑器实例
const initMonaco = async (container) => {
  if (!container) return

  // 确保先销毁旧的编辑器实例
  if (editor.value) {
    editor.value.dispose()
  }

  // 等待 DOM 更新完成
  await nextTick()

  // 创建编辑器
  editor.value = monaco.editor.create(container, {
    value: props.modelValue || '',
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    wordWrap: 'on',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
  })

  // 内容变化处理
  editor.value.onDidChangeModelContent(() => {
    if (contentChangeTimeout) {
      clearTimeout(contentChangeTimeout)
    }
    contentChangeTimeout = setTimeout(() => {
      const value = editor.value?.getValue()
      if (value !== undefined && value !== props.modelValue) {
        emit('update:modelValue', value)
      }
    }, 300)
  })
}

// 修复 JSON
const repairJson = () => {
  if (!editor.value) return
  
  try {
    const currentValue = editor.value.getValue()
    const repairedJson = jsonrepair(currentValue)
    const formattedJson = JSON.stringify(JSON.parse(repairedJson), null, 2)
    
    const scrollPosition = editor.value.getScrollTop()
    editor.value.setValue(formattedJson)
    editor.value.setScrollTop(scrollPosition)
    
    ElMessage.success('JSON 修复成功')
    emit('update:modelValue', formattedJson)
  } catch (error) {
    ElMessage.error('JSON 修复失败：' + error.message)
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    // 根据全屏状态选择容器
    const container = isFullscreen.value ? fullscreenEditorContainer.value : editorContainer.value
    initMonaco(container)
  })
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (!editor.value) return
  if (newVal !== editor.value.getValue()) {
    const scrollPosition = editor.value.getScrollTop()
    editor.value.setValue(newVal)
    editor.value.setScrollTop(scrollPosition)
  }
})

// 监听全屏变化
watch(isFullscreen, () => {
  nextTick(() => {
    editor.value?.layout()
  })
})

onMounted(() => {
  // 初始化非全屏编辑器
  setTimeout(() => {
    initMonaco(editorContainer.value)
  }, 0)
})

onBeforeUnmount(() => {
  // 确保在组件销毁时清理
  document.body.classList.remove('fullscreen-mode')
  document.body.style.overflow = ''
  if (contentChangeTimeout) {
    clearTimeout(contentChangeTimeout)
  }
  if (editor.value) {
    editor.value.dispose()
  }
})
</script>

<style scoped>
:deep(.monaco-editor) {
  height: 100% !important;
  min-height: 0 !important;
}

:deep(.monaco-editor .overflow-guard) {
  height: 100% !important;
  min-height: 0 !important;
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
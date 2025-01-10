<template>
  <div :id="editorId" class="monaco-editor"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  editorId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
let editor = null

onMounted(() => {
  // 创建编辑器实例
  editor = monaco.editor.create(document.getElementById(props.editorId), {
    value: props.modelValue,
    language: props.language,
    automaticLayout: true,
    theme: 'vs',
    minimap: {
      enabled: false
    },
    scrollBeyondLastLine: false
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// 监听值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue)
    }
  }
)

// 监听语言变化
watch(
  () => props.language,
  (newValue) => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel(), newValue)
    }
  }
)
</script>

<style scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
}
</style> 
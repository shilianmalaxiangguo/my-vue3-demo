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
  // 为每个编辑器创建独立的 model
  const uri = monaco.Uri.parse(`file:///workspace/${props.editorId}.${props.language}`)
  
  // 如果已存在相同 URI 的 model，先销毁它
  const existingModel = monaco.editor.getModel(uri)
  if (existingModel) {
    existingModel.dispose()
  }

  // 创建新的 model
  const model = monaco.editor.createModel(props.modelValue, props.language, uri)

  // 如果是 TypeScript，为每个编辑器创建独立的语言服务实例
  if (props.language === 'typescript') {
    // 创建独立的 TypeScript Worker
    const workerFactory = () => {
      const worker = monaco.editor.createWebWorker({
        moduleId: 'vs/language/typescript/tsWorker',
        label: `typescript-${props.editorId}`,
        keepIdleModels: true,
      })
      
      // 为这个 worker 配置独立的编译器选项
      worker.withSyncedResources([model.uri])
      return worker
    }

    // 注册独立的 TypeScript Worker
    monaco.languages.typescript.getTypeScriptWorker = () => workerFactory()
    monaco.languages.typescript.getJavaScriptWorker = () => workerFactory()

    // 为这个实例配置 TypeScript 编译器选项
    monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
      customWorkerPath: undefined
    })

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    })
  }

  editor = monaco.editor.create(document.getElementById(props.editorId), {
    model: model,
    automaticLayout: true,
    theme: 'vs',
    minimap: {
      enabled: false
    }
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue)
    }
  }
)

watch(
  () => props.language,
  (newValue) => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel(), newValue)
    }
  }
)

onBeforeUnmount(() => {
  if (editor) {
    editor.getModel()?.dispose()
    editor.dispose()
  }
})
</script>

<style scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
}
</style> 
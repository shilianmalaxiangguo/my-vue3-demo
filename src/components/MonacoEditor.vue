<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-end gap-2 mb-2">
      <div class="nextui-tag">
        <div class="tag-content">
          <span class="tag-dot"></span>
          {{ languageDisplay }}
        </div>
      </div>
      
      <div 
        class="nextui-switch"
        :class="{ 'is-active': showLineNumbers }"
        @click="toggleLineNumbers"
      >
        <span class="switch-label">行号</span>
        <div class="switch-track">
          <div class="switch-thumb"></div>
        </div>
      </div>
      
      <button 
        class="nextui-button"
        @click="toggleFullscreen"
      >
        <span class="button-content">
          <i class="button-icon" :class="isFullscreen ? 'i-compress' : 'i-expand'"></i>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </span>
      </button>
    </div>
    
    <div 
      ref="editorContainer" 
      class="flex-1 min-h-0"
    ></div>

    <!-- 全屏模式 -->
    <teleport to="body" :disabled="!isFullscreen">
      <div v-if="isFullscreen" class="fixed inset-0 bg-white z-50 flex flex-col">
        <div class="absolute top-4 right-4 flex gap-2 z-[60]">
          <div class="nextui-tag">
            <div class="tag-content">
              <span class="tag-dot"></span>
              {{ languageDisplay }}
            </div>
          </div>
          
          <div 
            class="nextui-switch"
            :class="{ 'is-active': showLineNumbers }"
            @click="toggleLineNumbers"
          >
            <span class="switch-label">行号</span>
            <div class="switch-track">
              <div class="switch-thumb"></div>
            </div>
          </div>
          
          <button 
            class="nextui-button"
            @click="toggleFullscreen"
          >
            <span class="button-content">
              <i class="button-icon i-compress"></i>
              退出全屏
            </span>
          </button>
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
import { ref, onMounted, watch, onBeforeUnmount, nextTick, shallowRef, computed } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'
import * as monacoEditor from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
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

const emit = defineEmits(['update:modelValue', 'update:language'])
const editorContainer = shallowRef(null)
const fullscreenEditorContainer = shallowRef(null)
const editor = shallowRef(null)
const isFullscreen = ref(false)
const showLineNumbers = ref(true)
const currentLanguage = ref(props.language)

let contentChangeTimeout = null
let editorModel = null
let monacoLoadPromise = null

// 配置 Monaco Editor 的全局环境
window.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'typescript':
      case 'javascript':
        return new TsWorker()
      case 'json':
        return new JsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker()
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker()
      default:
        return new EditorWorker()
    }
  }
}

// 加载 Monaco Editor
const loadMonaco = () => {
  if (monacoLoadPromise) {
    return monacoLoadPromise
  }

  if (window.monaco) {
    monaco.value = window.monaco
    return Promise.resolve(window.monaco)
  }

  monacoLoadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = '/monaco-editor/vs/loader.js'
    
    script.onload = () => {
      window.require.config({
        paths: {
          vs: '/monaco-editor/vs'
        }
      })
      
      window.require(['vs/editor/editor.main'], function(m) {
        monaco.value = m
        window.monaco = m
        resolve(m)
      })
    }
    
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script)
    }
  })

  return monacoLoadPromise
}

const getEditorOptions = () => ({
  theme: 'vs',
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: showLineNumbers.value ? 'on' : 'off',
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

// 创建编辑器实例
const initMonaco = async (container) => {
  if (!container) return

  try {
    // 先清理旧的编辑器和模型
    if (editor.value) {
      editor.value.dispose()
      editor.value = null
    }

    // 只清理当前编辑器的模型
    const existingModels = monacoEditor.editor.getModels()
    existingModels.forEach(model => {
      if (model.uri.toString().includes(props.editorId)) {
        model.dispose()
      }
    })

    // 配置 TypeScript
    monacoEditor.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monacoEditor.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monacoEditor.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monacoEditor.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monacoEditor.languages.typescript.JsxEmit.React,
      allowJs: true,
      typeRoots: ["node_modules/@types"],
      strict: true
    })

    // 配置 JavaScript
    monacoEditor.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    monacoEditor.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monacoEditor.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      strict: true
    })

    // 根据语言类型创建新的模型
    let uri
    if (currentLanguage.value === 'typescript') {
      uri = monacoEditor.Uri.parse(`file:///${props.editorId}/main.ts`)
    } else if (currentLanguage.value === 'javascript') {
      uri = monacoEditor.Uri.parse(`file:///${props.editorId}/main.js`)
    } else {
      uri = monacoEditor.Uri.parse(`file:///${props.editorId}/main.${currentLanguage.value}`)
    }

    // 创建新的模型
    editorModel = monacoEditor.editor.createModel(props.modelValue || '', currentLanguage.value, uri)

    // 创建编辑器
    editor.value = monacoEditor.editor.create(container, {
      ...getEditorOptions(),
      model: editorModel,
    })

    // 监听内容变化
    const disposable = editorModel.onDidChangeContent(() => {
      if (contentChangeTimeout) {
        clearTimeout(contentChangeTimeout)
      }
      contentChangeTimeout = setTimeout(() => {
        const value = editorModel.getValue()
        if (value !== undefined && value !== props.modelValue) {
          emit('update:modelValue', value)
        }
      }, 300)
    })

    // 添加到清理列表
    cleanupFns.push(() => {
      disposable.dispose()
      if (editorModel) {
        editorModel.dispose()
      }
    })

  } catch (error) {
    console.error('Monaco editor initialization error:', error)
  }
}

// 清理函数列表
const cleanupFns = []

const updateEditorOptions = () => {
  if (editor.value) {
    editor.value.updateOptions({
      lineNumbers: showLineNumbers.value ? 'on' : 'off'
    })
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  nextTick(async () => {
    const container = isFullscreen.value ? fullscreenEditorContainer.value : editorContainer.value
    
    // 保存当前编辑器的内容
    const currentContent = editor.value?.getValue() || props.modelValue

    await initMonaco(container)

    // 确保新的编辑器内容与之前一致
    if (editor.value && currentContent !== undefined) {
      editor.value.setValue(currentContent)
    }
  })
}

watch(() => props.modelValue, (newVal) => {
  if (!editor.value) return
  if (newVal !== editor.value.getValue()) {
    const scrollPosition = editor.value.getScrollTop()
    editor.value.setValue(newVal)
    editor.value.setScrollTop(scrollPosition)
  }
}, { immediate: true })

watch(isFullscreen, () => {
  nextTick(() => {
    editor.value?.layout()
  })
})

watch(() => props.language, async (newLang) => {
  currentLanguage.value = newLang
  if (editor.value) {
    await initMonaco(isFullscreen.value ? fullscreenEditorContainer.value : editorContainer.value)
  }
})

// 语言显示名称映射
const languageMap = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  html: 'HTML',
  css: 'CSS',
  vue: 'Vue'
}

// 计算当前语言的显示名称
const languageDisplay = computed(() => {
  return languageMap[currentLanguage.value] || currentLanguage.value
})

// 添加行号切换方法
const toggleLineNumbers = () => {
  showLineNumbers.value = !showLineNumbers.value
  updateEditorOptions()
}

onMounted(() => {
  setTimeout(() => {
    initMonaco(editorContainer.value)
  }, 0)
})

onBeforeUnmount(() => {
  // 清理所有资源
  if (contentChangeTimeout) {
    clearTimeout(contentChangeTimeout)
  }
  if (editor.value) {
    editor.value.dispose()
  }
  if (editorModel) {
    editorModel.dispose()
  }
  // 执行所有清理函数
  cleanupFns.forEach(fn => fn())
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

/* NextUI 风格的标签 */
.nextui-tag {
  display: inline-flex;
  height: 32px;
  padding: 0 12px;
  background: #f1f3f5;
  border-radius: 14px;
  align-items: center;
  transition: all 0.15s ease;
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #11181c;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0072f5;
}

/* NextUI 风格的开关 */
.nextui-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;
}

.switch-label {
  font-size: 13px;
  color: #11181c;
}

.switch-track {
  position: relative;
  width: 36px;
  height: 20px;
  background: #e4e7eb;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nextui-switch.is-active .switch-track {
  background: #0072f5;
}

.nextui-switch.is-active .switch-thumb {
  transform: translateX(16px);
}

/* NextUI 风格的按钮 */
.nextui-button {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  background: white;
  border: 1px solid #e4e7eb;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  color: #11181c;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.button-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.i-expand::before {
  content: "⤢";
}

.i-compress::before {
  content: "⤡";
}

.nextui-button:hover {
  background: #f8f9fa;
  border-color: #dfe3e6;
}

.nextui-button:active {
  background: #f1f3f5;
}

/* 全屏模式下的样式调整 */
.fixed .nextui-tag,
.fixed .nextui-button,
.fixed .nextui-switch {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}
</style> 
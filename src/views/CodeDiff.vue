<template>
  <div class="container">
    <el-card class="diff-card">
      <template #header>
        <div class="card-header">
          <h2>代码对比</h2>
          <div class="header-controls">
            <el-select 
              v-model="language" 
              placeholder="选择语言" 
              style="width: 150px; margin-right: 10px"
              @change="handleLanguageChange"
            >
              <el-option label="JavaScript" value="javascript" />
              <el-option label="TypeScript" value="typescript" />
              <el-option label="Python" value="python" />
              <el-option label="Java" value="java" />
              <el-option label="HTML" value="html" />
              <el-option label="CSS" value="css" />
              <el-option label="Vue" value="vue" />
            </el-select>
            <el-select 
              v-model="outputFormat" 
              placeholder="展示方式" 
              style="width: 150px"
            >
              <el-option label="对比视图" value="side-by-side" />
              <el-option label="内联视图" value="line-by-line" />
            </el-select>
          </div>
        </div>
      </template>
      
      <div class="editor-container">
        <div class="code-input">
          <h3>旧代码</h3>
          <div class="editor-wrapper">
            <monaco-editor
              v-model="oldCode"
              :language="language"
              class="editor"
              :key="`old-${language}`"
              editor-id="old-editor"
              @update:modelValue="updateOldCode"
            />
          </div>
        </div>
        <div class="code-input">
          <h3>新代码</h3>
          <div class="editor-wrapper">
            <monaco-editor
              v-model="newCode"
              :language="language"
              class="editor"
              :key="`new-${language}`"
              editor-id="new-editor"
              @update:modelValue="updateNewCode"
            />
          </div>
        </div>
      </div>

      <div class="diff-container">
        <h3>对比结果</h3>
        <code-diff
          :old-string="oldCode"
          :new-string="newCode"
          :language="diffLanguage"
          :output-format="outputFormat"
          :show-line-numbers="true"
          highlight-line
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import MonacoEditor from '../components/MonacoEditor.vue'

const languageMap = {
  javascript: 'javascript',
  typescript: 'javascript',
  python: 'python',
  java: 'java',
  html: 'xml',
  css: 'css',
  vue: 'xml'
}

const language = ref('javascript')
const outputFormat = ref('line-by-line')
const oldCode = ref('')
const newCode = ref('')

const examples = {
  javascript: {
    old: 'function example() {\n  console.log("旧代码");\n  return true;\n}',
    new: 'function example() {\n  console.log("新代码");\n  return false;\n}'
  },
  python: {
    old: 'def example():\n    print("旧代码")\n    return True',
    new: 'def example():\n    print("新代码")\n    return False'
  },
  java: {
    old: 'public class Example {\n    public void test() {\n        System.out.println("旧代码");\n    }\n}',
    new: 'public class Example {\n    public void test() {\n        System.out.println("新代码");\n    }\n}'
  },
  html: {
    old: '<div class="old">\n    <h1>旧标题</h1>\n</div>',
    new: '<div class="new">\n    <h1>新标题</h1>\n</div>'
  },
  css: {
    old: '.example {\n    color: red;\n    font-size: 14px;\n}',
    new: '.example {\n    color: blue;\n    font-size: 16px;\n}'
  },
  vue: {
    old: '<template>\n  <div>旧组件</div>\n</template>',
    new: '<template>\n  <div>新组件</div>\n</template>'
  },
  typescript: {
    old: `// @ts-check

interface Person {
  name: string;
  age: number;
}

function greet(person: Person): void {
  console.log(\`旧代码: Hello, \${person.name}!\`);
}

const oldUser: Person = {
  name: "John",
  age: 30
};

greet(oldUser);`,
    new: `// @ts-check

interface Person {
  name: string;
  age: number;
  email?: string;  // 可选属性
}

function greet(person: Person): void {
  console.log(\`新代码: Hello, \${person.name}!\`);
  if (person.email) {
    console.log(\`Email: \${person.email}\`);
  }
}

const newUser: Person = {
  name: "John",
  age: 30,
  email: "john@example.com"
};

greet(newUser);`
  }
}

const updateOldCode = (value) => {
  oldCode.value = value
}

const updateNewCode = (value) => {
  newCode.value = value
}

const handleLanguageChange = async (newLang) => {
  if (examples[newLang]) {
    language.value = newLang
    await nextTick()
    setTimeout(() => {
      oldCode.value = examples[newLang].old
      newCode.value = examples[newLang].new
    }, 0)
  }
}

const diffLanguage = computed(() => {
  return languageMap[language.value] || 'javascript'
})

onMounted(async () => {
  await nextTick()
  await handleLanguageChange('javascript')
})
</script>

<style scoped>
.container {
  padding: 20px;
}

.diff-card {
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.editor-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.code-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.code-input h3 {
  margin-bottom: 10px;
  color: #606266;
}

.editor-wrapper {
  flex: 1;
  min-height: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor {
  width: 100%;
  height: 100%;
}

.diff-container {
  margin-top: 20px;
}

.diff-container h3 {
  margin-bottom: 10px;
  color: #606266;
}

:deep(.v-code-diff) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: auto;
  background: #fff;
}
</style> 
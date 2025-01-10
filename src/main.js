import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './style.css'
import CodeDiff from 'v-code-diff'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(CodeDiff)

app.mount('#app')

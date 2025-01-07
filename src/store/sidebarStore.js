/**
 * 侧边栏状态管理模块
 * 
 * 设计思路：
 * 1. 使用 VueUse 的 createInjectionState 代替 Vuex/Pinia
 *    - 更轻量，适合管理局部或中小型状态
 *    - 基于 Vue 的依赖注入，无需额外配置
 * 
 * 2. 分离 consumer hooks
 *    - 基础 hook (useSidebar) 用于必需的场景，提供明确的错误提示
 *    - 默认值 hook (useSidebarWithDefault) 用于可选的场景，提供优雅降级
 * 
 * 3. 状态设计
 *    - theme: 主题切换（深色/浅色）
 *    - sidebarWidth: 侧边栏宽度
 *    - collapsed: 折叠状态
 */

import { ref } from 'vue'
import { createInjectionState } from '@vueuse/core'

// 创建注入状态
// useProvideSidebar: 用于在根组件提供状态
// _useSidebar: 内部使用的获取状态钩子（下划线表示内部使用）
const [useProvideSidebar, _useSidebar] = createInjectionState((initialState) => {
  // 创建响应式状态
  const theme = ref(initialState.theme)
  const sidebarWidth = ref(initialState.sidebarWidth)
  const collapsed = ref(initialState.collapsed)

  // 切换折叠状态的方法
  // 好处：将状态修改逻辑��装在 store 中，组件只需调用方法
  const toggleCollapse = () => {
    collapsed.value = !collapsed.value
  }

  // 设置主题的方法
  // 好处：统一管理主题切换逻辑，方便后续扩展（如添加主题切换动画）
  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  // 返回状态和方法
  return {
    theme,
    sidebarWidth,
    collapsed,
    toggleCollapse,
    setTheme
  }
})

/**
 * 基础 consumer hook
 * 
 * 使用场景：
 * - 在必须依赖侧边栏状态的组件中使用（如 MyRouterView）
 * - 当状态未提供时，立即抛出错误，避免运行时错误
 * 
 * 好处：
 * 1. 提供清晰的错误提示，帮助开发者快速定位问题
 * 2. 确保关键组件的状态依赖正确配置
 */
export function useSidebar() {
  const store = _useSidebar()
  if (store == null) {
    throw new Error('请确保在父组件中调用了 useProvideSidebar')
  }
  return store
}

/**
 * 带默认值的 consumer hook
 * 
 * 使用场景：
 * - 在可选使用侧边栏状态的组件中使用
 * - 当状态未提供时，使用默认值
 * 
 * 好处：
 * 1. 提供优雅的降级方案
 * 2. 便于组件测试（不需要包装 provider）
 * 3. 集中管理默认值，便于维护
 * 
 * 使用示例：
 * - 在 App.vue 中用于获取���始状态
 * - 在独立开发的组件中使用
 */
export function useSidebarWithDefault() {
  return _useSidebar() ?? {
    theme: ref('dark'),
    sidebarWidth: ref(200),
    collapsed: ref(false),
    toggleCollapse: () => {},
    setTheme: () => {}
  }
}

// 导出 provider hook
export { useProvideSidebar } 
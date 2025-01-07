<script setup>
import MyRouterView from './components/MyRouterView.vue'
import { useProvideSidebar } from './store/sidebarStore'

useProvideSidebar({
  theme: 'dark',
  sidebarWidth: 200,
  collapsed: false
})
</script>

<template>
    <MyRouterView />
</template>

<style scoped>

</style>

<template>
<div class="h-0 flex-auto overflow-y-auto">
  <div v-for="item in list" :key="item" class="h-[30px] p-3 border border-solid">
    {{ item + 1 }}
  </div>
</div>
</template>

<script setup>
defineOptions({
  name: 'Scroll',
})
const list = Array.from({ length: 1000 }, (_, i) => i)
</script>

<style scoped>

</style>
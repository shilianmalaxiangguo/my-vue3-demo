<template>
<div class="flex w-full h-full">
  <div class="flex-grow bg-red-500">1</div>
  <div class="flex-grow bg-green-500 flex flex-col">
    <div class="shrink-0 bg-pink-500">
      1
    </div>
    <Scroll />
  </div>
  <div class="flex-grow bg-blue-500">3</div>
</div>
</template>

<script setup>
import Scroll from "./Scroll.vue";

defineOptions({
  name: 'Flex',
})
</script>

<style scoped>

</style>
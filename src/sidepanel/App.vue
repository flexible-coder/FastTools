<template>
  <main class="fast-tools-sidepanel">
    <PathConverter />
  </main>
</template>

<script setup lang="ts">
import PathConverter from '@/components/PathConverter.vue'
</script>

<style scoped>
.fast-tools-sidepanel {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(180deg, #eef7fb 0%, #ffffff 100%);
}
</style>

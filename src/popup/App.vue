<template>
  <main class="fast-tools-popup">
    <PathConverter />
  </main>
</template>

<script setup lang="ts">
import PathConverter from '@/components/PathConverter.vue'
</script>

<style scoped>
.fast-tools-popup {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 14px;
  background: linear-gradient(180deg, #eef7fb 0%, #f8fbfd 100%);
}
</style>

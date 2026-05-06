<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider to="#app" placement="top">
            <main class="fast-tools-sidepanel">
              <PathConverter />
            </main>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import PathConverter from '@/components/PathConverter.vue'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1677ff',
    primaryColorHover: '#4096ff',
    primaryColorPressed: '#0958d9',
    borderRadius: '8px',
  },
}
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

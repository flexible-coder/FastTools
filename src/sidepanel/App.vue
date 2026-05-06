<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider to="#app" placement="top">
            <main class="fast-tools-sidepanel">
              <PathConverter v-if="selectedToolKey === 'path-converter'" ref="pathConverterRef" />
              <VueImportConverter v-if="selectedToolKey === 'vue-import-converter'" ref="vueImportConverterRef" />
            </main>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { GlobalThemeOverrides } from 'naive-ui'
import PathConverter from '@/components/PathConverter.vue'
import VueImportConverter from '@/components/VueImportConverter.vue'
import {
  DEFAULT_TOOL_KEY,
  SELECTED_TOOL_STORAGE_KEY,
  getSelectedToolKey,
  isToolKey,
  type ToolKey,
} from '@/utils/tools'

const selectedToolKey = ref<ToolKey>(DEFAULT_TOOL_KEY)
const pathConverterRef = ref<InstanceType<typeof PathConverter> | null>(null)
const vueImportConverterRef = ref<InstanceType<typeof VueImportConverter> | null>(null)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1677ff',
    primaryColorHover: '#4096ff',
    primaryColorPressed: '#0958d9',
    borderRadius: '8px',
  },
}

async function syncSelectedTool(): Promise<void> {
  selectedToolKey.value = await getSelectedToolKey()
}

function focusSelectedTool(): void {
  if (selectedToolKey.value === 'path-converter') {
    pathConverterRef.value?.focus()
    return
  }

  if (selectedToolKey.value === 'vue-import-converter') {
    vueImportConverterRef.value?.focus()
  }
}

function handleStorageChange(
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: chrome.storage.AreaName,
): void {
  if (areaName !== 'local') {
    return
  }

  const changedToolKey = changes[SELECTED_TOOL_STORAGE_KEY]?.newValue

  if (!isToolKey(changedToolKey)) {
    return
  }

  selectedToolKey.value = changedToolKey
}

watch(selectedToolKey, async () => {
  await nextTick()
  focusSelectedTool()
})

onMounted(async () => {
  await syncSelectedTool()
  await nextTick()
  focusSelectedTool()

  if (typeof chrome !== 'undefined') {
    chrome.storage?.onChanged?.addListener(handleStorageChange)
  }
})

onUnmounted(() => {
  if (typeof chrome !== 'undefined') {
    chrome.storage?.onChanged?.removeListener(handleStorageChange)
  }
})
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

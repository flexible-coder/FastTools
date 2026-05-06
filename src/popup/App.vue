<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider to="#app" placement="top">
            <main class="fast-tools-popup">
              <section v-if="!activeToolKey" class="fast-tools-popup__home" aria-label="FastTools 工具列表">
                <header class="fast-tools-popup__header">
                  <div>
                    <h1 class="fast-tools-popup__title">FastTools</h1>
                    <p class="fast-tools-popup__subtitle">选择一个工具开始使用</p>
                  </div>
                </header>

                <div class="fast-tools-popup__grid">
                  <button
                    v-for="tool in FAST_TOOLS"
                    :key="tool.key"
                    class="fast-tools-tool-card"
                    :class="{ 'fast-tools-tool-card--selected': selectedToolKey === tool.key }"
                    type="button"
                    @click="openTool(tool.key)"
                  >
                    <span class="fast-tools-tool-card__icon" aria-hidden="true">{{ tool.icon }}</span>
                    <span class="fast-tools-tool-card__content">
                      <span class="fast-tools-tool-card__head">
                        <span class="fast-tools-tool-card__title">{{ tool.title }}</span>
                        <span v-if="selectedToolKey === tool.key" class="fast-tools-tool-card__status">当前选中</span>
                      </span>
                      <span class="fast-tools-tool-card__description">{{ tool.description }}</span>
                    </span>
                  </button>
                </div>
              </section>

              <section v-else class="fast-tools-popup__tool" aria-label="FastTools 工具操作页">
                <n-button class="fast-tools-popup__back" size="small" quaternary @click="backToToolList">
                  <template #icon>
                    <span class="fast-tools-popup__back-icon" aria-hidden="true">‹</span>
                  </template>
                  返回
                </n-button>
                <PathConverter v-if="activeToolKey === 'path-converter'" ref="pathConverterRef" />
              </section>
            </main>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import type { GlobalThemeOverrides } from "naive-ui";
import PathConverter from "@/components/PathConverter.vue";
import {
  DEFAULT_TOOL_KEY,
  FAST_TOOLS,
  SELECTED_TOOL_STORAGE_KEY,
  getSelectedToolKey,
  isToolKey,
  setSelectedToolKey,
  type ToolKey,
} from "@/utils/tools";

const selectedToolKey = ref<ToolKey>(DEFAULT_TOOL_KEY);
const activeToolKey = ref<ToolKey | null>(null);
const pathConverterRef = ref<InstanceType<typeof PathConverter> | null>(null);
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#1677ff",
    primaryColorHover: "#4096ff",
    primaryColorPressed: "#0958d9",
    borderRadius: "8px",
  },
};

async function openTool(toolKey: ToolKey): Promise<void> {
  selectedToolKey.value = toolKey;
  activeToolKey.value = toolKey;
  await setSelectedToolKey(toolKey);
  await nextTick();
  focusActiveTool();
}

function backToToolList(): void {
  activeToolKey.value = null;
}

function focusActiveTool(): void {
  if (activeToolKey.value === "path-converter") {
    pathConverterRef.value?.focus();
  }
}

function handleStorageChange(
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: chrome.storage.AreaName,
): void {
  if (areaName !== "local") {
    return;
  }

  const changedToolKey = changes[SELECTED_TOOL_STORAGE_KEY]?.newValue;

  if (isToolKey(changedToolKey)) {
    selectedToolKey.value = changedToolKey;
  }
}

onMounted(async () => {
  selectedToolKey.value = await getSelectedToolKey();
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.addListener(handleStorageChange);
  }
});

onUnmounted(() => {
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.removeListener(handleStorageChange);
  }
});
</script>

<style scoped>
.fast-tools-popup {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  background: linear-gradient(180deg, #eef7fb 0%, #f8fbfd 100%);
}

.fast-tools-popup,
.fast-tools-popup * {
  box-sizing: border-box;
}

.fast-tools-popup__home,
.fast-tools-popup__tool {
  width: 100%;
}

.fast-tools-popup__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.fast-tools-popup__title {
  margin: 0;
  color: #17212b;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.fast-tools-popup__subtitle {
  margin: 5px 0 0;
  color: #5a6b76;
  font-size: 13px;
  line-height: 1.5;
}

.fast-tools-popup__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.fast-tools-tool-card {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 108px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #dbe4ea;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgb(20 36 48 / 10%);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.fast-tools-tool-card:hover {
  border-color: #9fc7ff;
  box-shadow: 0 16px 34px rgb(20 36 48 / 14%);
  transform: translateY(-1px);
}

.fast-tools-tool-card--selected {
  border-color: #1677ff;
  box-shadow: 0 16px 34px rgb(22 119 255 / 18%);
}

.fast-tools-tool-card__icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-right: 12px;
  font-size: 22px;
  background: #edf7ff;
  border-radius: 8px;
}

.fast-tools-tool-card__content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.fast-tools-tool-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.fast-tools-tool-card__title {
  color: #17212b;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
}

.fast-tools-tool-card__status {
  flex: 0 0 auto;
  padding: 2px 8px;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  background: #eaf4ff;
  border-radius: 999px;
}

.fast-tools-tool-card__description {
  margin-top: 8px;
  color: #4b5d6a;
  font-size: 13px;
  line-height: 1.55;
}

.fast-tools-popup__back {
  margin-bottom: 12px;
  color: #40525f;
}

.fast-tools-popup__back-icon {
  display: inline-block;
  font-size: 20px;
  line-height: 1;
  transform: translateY(-1px);
}

</style>

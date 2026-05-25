<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider to="#app" placement="top">
            <main class="fast-tools-popup">
              <section class="fast-tools-popup__shell" aria-label="FastTools">
                <header class="fast-tools-popup__header">
                  <div class="fast-tools-popup__title-wrap">
                    <div class="fast-tools-popup__icon" aria-hidden="true">
                      {{ activeToolKey === "vue-import-converter" ? "V" : "/" }}
                    </div>
                    <div>
                      <h1 class="fast-tools-popup__title">
                        {{ activeTool?.title ?? "FastTools" }}
                      </h1>
                      <p class="fast-tools-popup__subtitle">
                        {{ activeTool?.description ?? "选择一个常用工具，快速处理路径和代码片段" }}
                      </p>
                    </div>
                  </div>

                  <n-button
                    v-if="activeToolKey"
                    class="fast-tools-popup__back"
                    size="small"
                    quaternary
                    @click="backToToolList"
                  >
                    返回
                  </n-button>
                </header>

                <div class="fast-tools-popup__body">
                  <section
                    v-if="!activeToolKey"
                    class="fast-tools-popup__home"
                    aria-label="FastTools 工具列表"
                  >
                    <div class="fast-tools-popup__grid">
                      <article
                        v-for="tool in FAST_TOOLS"
                        :key="tool.key"
                        class="fast-tools-tool-card"
                        :class="{ 'fast-tools-tool-card--selected': selectedToolKey === tool.key }"
                        role="button"
                        tabindex="0"
                        @click="selectTool(tool.key)"
                        @keydown.enter.prevent="selectTool(tool.key)"
                        @keydown.space.prevent="selectTool(tool.key)"
                      >
                        <span class="fast-tools-tool-card__icon" aria-hidden="true">
                          {{ tool.icon }}
                        </span>
                        <span class="fast-tools-tool-card__content">
                          <span class="fast-tools-tool-card__head">
                            <span class="fast-tools-tool-card__title">{{ tool.title }}</span>
                            <span
                              v-if="selectedToolKey === tool.key"
                              class="fast-tools-tool-card__status"
                            >
                              当前使用
                            </span>
                          </span>
                          <span class="fast-tools-tool-card__description">
                            {{ tool.description }}
                          </span>
                        </span>
                        <n-button
                          class="fast-tools-tool-card__open"
                          size="small"
                          type="primary"
                          @click.stop="openTool(tool.key)"
                        >
                          打开
                        </n-button>
                      </article>
                    </div>
                  </section>

                  <section v-else class="fast-tools-popup__tool" aria-label="FastTools 工具操作页">
                    <PathConverter
                      v-if="activeToolKey === 'path-converter'"
                      ref="pathConverterRef"
                    />
                    <VueImportConverter
                      v-if="activeToolKey === 'vue-import-converter'"
                      ref="vueImportConverterRef"
                    />
                  </section>
                </div>
              </section>
            </main>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import type { GlobalThemeOverrides } from "naive-ui";
import PathConverter from "@/components/PathConverter.vue";
import VueImportConverter from "@/components/VueImportConverter.vue";
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
const vueImportConverterRef = ref<InstanceType<typeof VueImportConverter> | null>(null);
const activeTool = computed(() => FAST_TOOLS.find((tool) => tool.key === activeToolKey.value));
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#1677ff",
    primaryColorHover: "#4096ff",
    primaryColorPressed: "#0958d9",
    borderRadius: "10px",
  },
};

async function selectTool(toolKey: ToolKey): Promise<void> {
  selectedToolKey.value = toolKey;
  await setSelectedToolKey(toolKey);
}

async function openTool(toolKey: ToolKey): Promise<void> {
  await selectTool(toolKey);
  activeToolKey.value = toolKey;
  await nextTick();
  focusActiveTool();
}

function backToToolList(): void {
  activeToolKey.value = null;
}

function focusActiveTool(): void {
  if (activeToolKey.value === "path-converter") {
    pathConverterRef.value?.focus();
    return;
  }

  if (activeToolKey.value === "vue-import-converter") {
    vueImportConverterRef.value?.focus();
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
  padding: 18px;
  color: #1f2937;
  background:
    radial-gradient(circle at 14% 8%, rgb(22 119 255 / 12%), transparent 32%),
    linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
}

.fast-tools-popup,
.fast-tools-popup * {
  box-sizing: border-box;
}

.fast-tools-popup__shell {
  width: 100%;
  min-height: calc(100vh - 36px);
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 18%);
  animation: fast-tools-popup-in 0.24s ease;
}

.fast-tools-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
  border-bottom: 1px solid #eef2f7;
}

.fast-tools-popup__title-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.fast-tools-popup__icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  border-radius: 14px;
  box-shadow: 0 12px 22px rgb(22 119 255 / 24%);
}

.fast-tools-popup__title {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
}

.fast-tools-popup__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.fast-tools-popup__back {
  flex: 0 0 auto;
  color: #64748b;
  background: #f8fafc;
  border-radius: 10px;
}

.fast-tools-popup__body {
  padding: 22px;
}

.fast-tools-popup__home,
.fast-tools-popup__tool {
  width: 100%;
}

.fast-tools-popup__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.fast-tools-tool-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 116px;
  padding: 16px 16px 54px;
  text-align: left;
  cursor: pointer;
  background: #fbfdff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.fast-tools-tool-card:hover {
  background: #ffffff;
  border-color: #9cc7ff;
  box-shadow: 0 16px 34px rgb(15 23 42 / 12%);
  transform: translateY(-1px);
}

.fast-tools-tool-card:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.fast-tools-tool-card--selected {
  background: #ffffff;
  border-color: #1677ff;
  box-shadow: 0 14px 30px rgb(22 119 255 / 16%);
}

.fast-tools-tool-card__icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-right: 12px;
  color: #1677ff;
  font-size: 18px;
  font-weight: 800;
  background: #edf5ff;
  border-radius: 14px;
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
  color: #1f2937;
  font-size: 15px;
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
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.fast-tools-tool-card__open {
  position: absolute;
  right: 16px;
  bottom: 14px;
  min-width: 72px;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgb(22 119 255 / 22%);
}

@keyframes fast-tools-popup-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

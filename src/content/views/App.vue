<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider to="#fast-tools-app" placement="top">
            <div class="fast-tools-content">
              <button
                class="fast-tools-sprite"
                type="button"
                :aria-expanded="isPanelOpen"
                aria-label="打开 FastTools 工具面板"
                @click="togglePanel"
              >
                <span class="fast-tools-sprite__halo" aria-hidden="true"></span>
                <span class="fast-tools-sprite__bot" aria-hidden="true">
                  <span class="fast-tools-sprite__antenna"></span>
                  <span class="fast-tools-sprite__screen">
                    <span class="fast-tools-sprite__eye"></span>
                    <span class="fast-tools-sprite__eye"></span>
                    <span class="fast-tools-sprite__mouth"></span>
                  </span>
                </span>
                <span class="fast-tools-sprite__shadow" aria-hidden="true"></span>
              </button>

              <Transition name="fast-tools-panel-slide">
                <section v-if="isPanelOpen" class="fast-tools-panel" aria-label="FastTools 工具面板">
                  <button class="fast-tools-panel__close" type="button" aria-label="关闭 FastTools" @click="closePanel">
                    ×
                  </button>
                  <PathConverter v-if="selectedToolKey === 'path-converter'" ref="pathConverterRef" />
                  <VueImportConverter
                    v-if="selectedToolKey === 'vue-import-converter'"
                    ref="vueImportConverterRef"
                  />
                </section>
              </Transition>
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import type { GlobalThemeOverrides } from "naive-ui";
import PathConverter from "@/components/PathConverter.vue";
import VueImportConverter from "@/components/VueImportConverter.vue";
import {
  DEFAULT_TOOL_KEY,
  SELECTED_TOOL_STORAGE_KEY,
  getSelectedToolKey,
  isToolKey,
  type ToolKey,
} from "@/utils/tools";

const isPanelOpen = ref(false);
const selectedToolKey = ref<ToolKey>(DEFAULT_TOOL_KEY);
const pathConverterRef = ref<InstanceType<typeof PathConverter> | null>(null);
const vueImportConverterRef = ref<InstanceType<typeof VueImportConverter> | null>(null);
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#1677ff",
    primaryColorHover: "#4096ff",
    primaryColorPressed: "#0958d9",
    borderRadius: "8px",
  },
};

function togglePanel(): void {
  isPanelOpen.value = !isPanelOpen.value;
}

function closePanel(): void {
  isPanelOpen.value = false;
}
interface FastToolsMessage {
  action?: string;
  type?: string;
}

// 定义处理消息的函数
const handleMessage = (
  message: FastToolsMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => {
  console.log("[FastTools] received message:", message, sender);

  if (message.action === "toggle_panel" || message.type === "open_panel") {
    togglePanel();
    // 可选：发送响应给 background
    sendResponse({ status: "toggled", isOpen: isPanelOpen.value });
  }
};

function handleKeydown(event: KeyboardEvent): void {
  const isTogglePanelCommand =
    (event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyZ";

  if (isTogglePanelCommand && !event.isComposing) {
    event.preventDefault();
    event.stopPropagation();
    togglePanel();
    return;
  }
  if (event.key === "Escape" && isPanelOpen.value) {
    event.preventDefault();
    event.stopPropagation();
    closePanel();
  }
}
async function syncSelectedTool(): Promise<void> {
  selectedToolKey.value = await getSelectedToolKey();
}

function focusSelectedTool(): void {
  if (selectedToolKey.value === "path-converter") {
    pathConverterRef.value?.focus();
    return;
  }

  if (selectedToolKey.value === "vue-import-converter") {
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

  if (!isToolKey(changedToolKey)) {
    return;
  }

  selectedToolKey.value = changedToolKey;

  if (isPanelOpen.value) {
    nextTick(() => {
      focusSelectedTool();
    });
  }
}

watch(isPanelOpen, async (newVal) => {
  if (newVal) {
    await syncSelectedTool();
    await nextTick();
    focusSelectedTool();
  }
});
onMounted(() => {
  syncSelectedTool();
  // 添加监听器
  chrome.runtime.onMessage.addListener(handleMessage);
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.addListener(handleStorageChange);
  }
  window.addEventListener("keydown", handleKeydown, true);
});

onUnmounted(() => {
  // 移除监听器，防止内存泄漏（虽然 content script 通常随页面销毁，但好习惯很重要）
  chrome.runtime.onMessage.removeListener(handleMessage);
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.removeListener(handleStorageChange);
  }
  window.removeEventListener("keydown", handleKeydown, true);
});
</script>

<style scoped>
.fast-tools-content,
.fast-tools-content * {
  box-sizing: border-box;
}

.fast-tools-sprite {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 70px;
  padding: 0;
  cursor: pointer;
  background: linear-gradient(160deg, #ffffff 0%, #dff0ff 100%);
  border: 0;
  border-radius: 24px 0 0 24px;
  box-shadow: 0 14px 32px rgb(18 47 88 / 26%);
  transform: translateY(-50%);
  transition:
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.fast-tools-sprite:hover {
  background: linear-gradient(160deg, #ffffff 0%, #cfe7ff 100%);
  box-shadow: 0 18px 38px rgb(18 47 88 / 34%);
}

.fast-tools-sprite:active {
  transform: translateY(-50%) scale(0.98);
}

.fast-tools-sprite__halo {
  position: absolute;
  width: 48px;
  height: 48px;
  background:
    radial-gradient(circle at 34% 24%, rgb(255 255 255 / 90%) 0 9%, transparent 10%),
    radial-gradient(circle, rgb(87 181 255 / 28%) 0 48%, transparent 50%);
  border-radius: 50%;
  animation: fast-tools-sprite-pulse 1.8s ease-in-out infinite;
}

.fast-tools-sprite__bot {
  position: relative;
  display: block;
  width: 36px;
  height: 38px;
  background: linear-gradient(180deg, #eff8ff 0%, #94d4ff 100%);
  border: 2px solid #ffffff;
  border-radius: 14px 14px 13px 13px;
  box-shadow:
    inset 0 -5px 10px rgb(15 91 166 / 18%),
    0 9px 16px rgb(22 119 255 / 25%);
  animation: fast-tools-sprite-float 1.7s ease-in-out infinite;
}

.fast-tools-sprite__antenna {
  position: absolute;
  top: -11px;
  left: 50%;
  width: 3px;
  height: 10px;
  background: #1677ff;
  border-radius: 999px;
  transform: translateX(-50%);
}

.fast-tools-sprite__antenna::after {
  position: absolute;
  top: -5px;
  left: 50%;
  width: 8px;
  height: 8px;
  content: "";
  background: #ffc53d;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(255 197 61 / 70%);
  transform: translateX(-50%);
}

.fast-tools-sprite__screen {
  position: absolute;
  top: 9px;
  left: 50%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 7px;
  justify-items: center;
  width: 25px;
  height: 18px;
  padding: 4px 5px 3px;
  background: linear-gradient(180deg, #1464e8 0%, #0e3c9c 100%);
  border-radius: 9px;
  transform: translateX(-50%);
}

.fast-tools-sprite__eye {
  width: 4px;
  height: 6px;
  background: #8ff7ff;
  border-radius: 999px;
  box-shadow: 0 0 7px rgb(143 247 255 / 85%);
  animation: fast-tools-sprite-blink 3s ease-in-out infinite;
}

.fast-tools-sprite__mouth {
  grid-column: 1 / -1;
  width: 11px;
  height: 4px;
  border-bottom: 2px solid #8ff7ff;
  border-radius: 0 0 999px 999px;
}

.fast-tools-sprite__shadow {
  position: absolute;
  bottom: 13px;
  width: 28px;
  height: 7px;
  background: rgb(36 72 120 / 16%);
  border-radius: 50%;
  filter: blur(1px);
  animation: fast-tools-sprite-shadow 1.7s ease-in-out infinite;
}

.fast-tools-sprite:hover .fast-tools-sprite__bot {
  animation-duration: 0.9s;
}

.fast-tools-sprite:hover .fast-tools-sprite__halo {
  animation-duration: 1s;
}

.fast-tools-panel {
  position: fixed;
  top: 50%;
  right: 66px;
  z-index: 2147483645;
  width: 360px;
  max-width: calc(100vw - 86px);
  transform: translateY(-50%);
  filter: drop-shadow(0 18px 44px rgb(15 38 55 / 22%));
}

.fast-tools-panel__close {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #3b4a54;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #dbe4ea;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgb(15 38 55 / 16%);
}

.fast-tools-panel__close:hover {
  color: #1677ff;
  border-color: #9fc7ff;
}

.fast-tools-panel-slide-enter-active,
.fast-tools-panel-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.fast-tools-panel-slide-enter-from,
.fast-tools-panel-slide-leave-to {
  opacity: 0;
  filter: drop-shadow(0 8px 20px rgb(15 38 55 / 10%));
  transform: translateY(-50%) translateX(18px) scale(0.98);
}

.fast-tools-panel-slide-enter-to,
.fast-tools-panel-slide-leave-from {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}

@keyframes fast-tools-sprite-bob {
  from {
    transform: translateY(-3px) rotate(-2deg);
  }

  to {
    transform: translateY(1px) rotate(2deg);
  }
}

@keyframes fast-tools-sprite-float {
  0%,
  100% {
    transform: translateY(-3px) rotate(-2deg);
  }

  50% {
    transform: translateY(2px) rotate(2deg);
  }
}

@keyframes fast-tools-sprite-shadow {
  0%,
  100% {
    opacity: 0.55;
    transform: scaleX(0.82);
  }

  50% {
    opacity: 0.9;
    transform: scaleX(1);
  }
}

@keyframes fast-tools-sprite-pulse {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes fast-tools-sprite-blink {
  0%,
  88%,
  100% {
    transform: scaleY(1);
  }

  92% {
    transform: scaleY(0.12);
  }
}
</style>

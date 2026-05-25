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
                :style="spriteStyle"
                :data-edge="dockedEdge"
                :data-dragging="isDragging ? 'true' : undefined"
                :aria-expanded="isPanelOpen"
                aria-label="打开 FastTools 工具面板"
                @pointerdown="handleSpritePointerDown"
                @click="handleSpriteClick"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { CSSProperties } from "vue";
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

type DockedEdge = "left" | "right" | "top" | "bottom";

const SPRITE_WIDTH = 62;
const SPRITE_HEIGHT = 70;
const DRAG_CLICK_THRESHOLD = 6;

const isPanelOpen = ref(false);
const selectedToolKey = ref<ToolKey>(DEFAULT_TOOL_KEY);
const pathConverterRef = ref<InstanceType<typeof PathConverter> | null>(null);
const vueImportConverterRef = ref<InstanceType<typeof VueImportConverter> | null>(null);
const dockedEdge = ref<DockedEdge>("right");
const isDragging = ref(false);
const spriteX = ref(0);
const spriteY = ref(0);

let pointerOffsetX = 0;
let pointerOffsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
let activePointerId: number | null = null;
let shouldSuppressClick = false;
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#1677ff",
    primaryColorHover: "#4096ff",
    primaryColorPressed: "#0958d9",
    borderRadius: "8px",
  },
};

const spriteStyle = computed<CSSProperties>(() => ({
  left: `${spriteX.value}px`,
  top: `${spriteY.value}px`,
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

function togglePanel(): void {
  isPanelOpen.value = !isPanelOpen.value;
}

function closePanel(): void {
  isPanelOpen.value = false;
}

function initializeSpritePosition(): void {
  const viewport = getViewportSize();

  spriteX.value = Math.max(0, viewport.width - SPRITE_WIDTH);
  spriteY.value = clamp((viewport.height - SPRITE_HEIGHT) / 2, 0, Math.max(0, viewport.height - SPRITE_HEIGHT));
  dockedEdge.value = "right";
}

function dockSpriteToEdge(edge: DockedEdge): void {
  const viewport = getViewportSize();
  const maxX = Math.max(0, viewport.width - SPRITE_WIDTH);
  const maxY = Math.max(0, viewport.height - SPRITE_HEIGHT);

  dockedEdge.value = edge;

  if (edge === "left") {
    spriteX.value = 0;
    spriteY.value = clamp(spriteY.value, 0, maxY);
    return;
  }

  if (edge === "right") {
    spriteX.value = maxX;
    spriteY.value = clamp(spriteY.value, 0, maxY);
    return;
  }

  if (edge === "top") {
    spriteX.value = clamp(spriteX.value, 0, maxX);
    spriteY.value = 0;
    return;
  }

  spriteX.value = clamp(spriteX.value, 0, maxX);
  spriteY.value = maxY;
}

function dockSpriteToNearestEdge(): void {
  const viewport = getViewportSize();
  const centerX = spriteX.value + SPRITE_WIDTH / 2;
  const centerY = spriteY.value + SPRITE_HEIGHT / 2;
  const distances: Record<DockedEdge, number> = {
    left: centerX,
    right: viewport.width - centerX,
    top: centerY,
    bottom: viewport.height - centerY,
  };
  const nearestEdge = (Object.keys(distances) as DockedEdge[]).reduce((nearest, edge) => (
    distances[edge] < distances[nearest] ? edge : nearest
  ), "right");

  dockSpriteToEdge(nearestEdge);
}

function handleSpritePointerDown(event: PointerEvent): void {
  if (event.button !== 0) {
    return;
  }

  activePointerId = event.pointerId;
  isDragging.value = true;
  shouldSuppressClick = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  pointerOffsetX = event.clientX - spriteX.value;
  pointerOffsetY = event.clientY - spriteY.value;

  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  window.addEventListener("pointermove", handleSpritePointerMove);
  window.addEventListener("pointerup", handleSpritePointerUp);
  window.addEventListener("pointercancel", handleSpritePointerUp);
}

function handleSpritePointerMove(event: PointerEvent): void {
  if (!isDragging.value || event.pointerId !== activePointerId) {
    return;
  }

  const viewport = getViewportSize();
  const maxX = Math.max(0, viewport.width - SPRITE_WIDTH);
  const maxY = Math.max(0, viewport.height - SPRITE_HEIGHT);
  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;

  if (Math.hypot(deltaX, deltaY) > DRAG_CLICK_THRESHOLD) {
    shouldSuppressClick = true;
  }

  spriteX.value = clamp(event.clientX - pointerOffsetX, 0, maxX);
  spriteY.value = clamp(event.clientY - pointerOffsetY, 0, maxY);
}

function handleSpritePointerUp(event: PointerEvent): void {
  if (event.pointerId !== activePointerId) {
    return;
  }

  isDragging.value = false;
  activePointerId = null;
  window.removeEventListener("pointermove", handleSpritePointerMove);
  window.removeEventListener("pointerup", handleSpritePointerUp);
  window.removeEventListener("pointercancel", handleSpritePointerUp);
  dockSpriteToNearestEdge();
}

function handleSpriteClick(event: MouseEvent): void {
  if (shouldSuppressClick) {
    event.preventDefault();
    event.stopPropagation();
    shouldSuppressClick = false;
    return;
  }

  togglePanel();
}

function handleResize(): void {
  dockSpriteToEdge(dockedEdge.value);
}

interface FastToolsMessage {
  action?: string;
  type?: string;
}

/*
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
*/

const handleMessage = (
  message: FastToolsMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): void => {
  console.log("[FastTools] received message:", message, sender);

  if (message.action === "toggle_panel" || message.type === "open_panel") {
    togglePanel();
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
  initializeSpritePosition();
  syncSelectedTool();
  // 添加监听器
  chrome.runtime.onMessage.addListener(handleMessage);
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.addListener(handleStorageChange);
  }
  chrome.runtime.onMessage.addListener(handleMessage);
  window.addEventListener("keydown", handleKeydown, true);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // 移除监听器，防止内存泄漏（虽然 content script 通常随页面销毁，但好习惯很重要）
  chrome.runtime.onMessage.removeListener(handleMessage);
  if (typeof chrome !== "undefined") {
    chrome.storage?.onChanged?.removeListener(handleStorageChange);
  }
  window.removeEventListener("keydown", handleKeydown, true);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("pointermove", handleSpritePointerMove);
  window.removeEventListener("pointerup", handleSpritePointerUp);
  window.removeEventListener("pointercancel", handleSpritePointerUp);
});
</script>

<style scoped>
.fast-tools-content,
.fast-tools-content * {
  box-sizing: border-box;
}

.fast-tools-sprite {
  position: fixed;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 70px;
  padding: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
  background: linear-gradient(160deg, #ffffff 0%, #dff0ff 100%);
  border: 0;
  border-radius: 24px 0 0 24px;
  box-shadow: 0 14px 32px rgb(18 47 88 / 26%);
  transition:
    top 0.22s ease,
    left 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  will-change: top, left, transform;
}

.fast-tools-sprite:hover {
  background: linear-gradient(160deg, #ffffff 0%, #cfe7ff 100%);
  box-shadow: 0 18px 38px rgb(18 47 88 / 34%);
  transform: translate(0, 0);
}

.fast-tools-sprite[data-dragging="true"] {
  cursor: grabbing;
  transition: none;
  transform: translate(0, 0);
}

.fast-tools-sprite[data-edge="left"] {
  border-radius: 0 24px 24px 0;
}

.fast-tools-sprite[data-edge="right"] {
  border-radius: 24px 0 0 24px;
}

.fast-tools-sprite[data-edge="top"] {
  border-radius: 0 0 24px 24px;
}

.fast-tools-sprite[data-edge="bottom"] {
  border-radius: 24px 24px 0 0;
}

.fast-tools-sprite[data-edge="left"]:not(:hover):not([data-dragging="true"]) {
  transform: translateX(-50%);
}

.fast-tools-sprite[data-edge="right"]:not(:hover):not([data-dragging="true"]) {
  transform: translateX(50%);
}

.fast-tools-sprite[data-edge="top"]:not(:hover):not([data-dragging="true"]) {
  transform: translateY(-50%);
}

.fast-tools-sprite[data-edge="bottom"]:not(:hover):not([data-dragging="true"]) {
  transform: translateY(50%);
}

.fast-tools-sprite:active {
  transform: scale(0.98);
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
  left: 50%;
  z-index: 2147483645;
  width: 520px;
  max-width: calc(100vw - 48px);
  transform: translate(-50%, -50%);
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
  transform: translate(-50%, -50%) scale(0.96);
}

.fast-tools-panel-slide-enter-to,
.fast-tools-panel-slide-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
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

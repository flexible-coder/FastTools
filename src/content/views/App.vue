<template>
  <div class="fast-tools-content">
    <button
      class="fast-tools-sprite"
      type="button"
      :aria-expanded="isPanelOpen"
      aria-label="打开 FastTools 工具面板"
      @click="togglePanel"
    >
      <span class="fast-tools-sprite__face" aria-hidden="true">
        <span class="fast-tools-sprite__eye"></span>
        <span class="fast-tools-sprite__eye"></span>
      </span>
      <span class="fast-tools-sprite__spark" aria-hidden="true"></span>
    </button>

    <Transition name="fast-tools-panel-slide">
      <section
        v-if="isPanelOpen"
        class="fast-tools-panel"
        aria-label="FastTools 工具面板"
      >
        <button
          class="fast-tools-panel__close"
          type="button"
          aria-label="关闭 FastTools"
          @click="closePanel"
        >
          ×
        </button>
        <PathConverter />
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {  onMounted, onUnmounted, ref } from 'vue'
import PathConverter from '@/components/PathConverter.vue'

const isPanelOpen = ref(false)

function togglePanel(): void {
  isPanelOpen.value = !isPanelOpen.value
}

function closePanel(): void {
  isPanelOpen.value = false
}
interface FastToolsMessage {
  action?: string
  type?: string
}

// 定义处理消息的函数
const handleMessage = (
  message: FastToolsMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => {
  console.log('[FastTools] received message:', message, sender)

  if (message.action === 'toggle_panel' || message.type === 'open_panel') {
    togglePanel()
    // 可选：发送响应给 background
    sendResponse({ status: 'toggled', isOpen: isPanelOpen.value })
  }
}

onMounted(() => {
  // 添加监听器
  chrome.runtime.onMessage.addListener(handleMessage)
})

onUnmounted(() => {
  // 移除监听器，防止内存泄漏（虽然 content script 通常随页面销毁，但好习惯很重要）
  chrome.runtime.onMessage.removeListener(handleMessage)
})
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

.fast-tools-sprite__face {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(180deg, #1677ff 0%, #145bd7 100%);
  border-radius: 50% 50% 46% 46%;
  box-shadow:
    inset 0 -4px 8px rgb(8 40 116 / 20%),
    0 8px 16px rgb(22 119 255 / 24%);
  transition: transform 0.22s ease;
}

.fast-tools-sprite:hover .fast-tools-sprite__face {
  transform: translateY(-3px);
  animation: fast-tools-sprite-bob 0.7s ease-in-out infinite alternate;
}

.fast-tools-sprite__face::before,
.fast-tools-sprite__face::after {
  position: absolute;
  top: -7px;
  width: 7px;
  height: 12px;
  content: "";
  background: #1677ff;
  border-radius: 999px;
}

.fast-tools-sprite__face::before {
  left: 7px;
  transform: rotate(-24deg);
}

.fast-tools-sprite__face::after {
  right: 7px;
  transform: rotate(24deg);
}

.fast-tools-sprite__eye {
  width: 5px;
  height: 8px;
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 18%);
}

.fast-tools-sprite__spark {
  position: absolute;
  top: 13px;
  left: 10px;
  width: 7px;
  height: 7px;
  pointer-events: none;
  background: #ffc53d;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.4);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fast-tools-sprite:hover .fast-tools-sprite__spark {
  opacity: 1;
  transform: scale(1) translateY(-3px);
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
</style>

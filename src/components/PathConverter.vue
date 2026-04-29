<template>
  <a-card class="fast-tools-path-converter" :bordered="false" size="small">
    <template #title>
      <div class="fast-tools-path-converter__title">
        Windows 路径转换工具
      </div>
    </template>

    <a-space
      class="fast-tools-path-converter__body"
      direction="vertical"
      :size="12"
    >
      <a-textarea
        v-model:value="inputValue"
        class="fast-tools-path-converter__textarea"
        placeholder="请输入 Windows 路径，例如：src\content\views\App.vue"
        :auto-size="{ minRows: 2, maxRows: 8 }"
        @keydown.enter.exact.prevent="handleConvertAndCopy"
      />

      <a-space wrap>
        <a-button type="primary" @click="handleConvert">
          转换
        </a-button>
        <a-button @click="handleClear">
          清空
        </a-button>
      </a-space>

      <div class="fast-tools-path-converter__output-head">
        <span>转换结果</span>
        <a-button
          type="primary"
          ghost
          size="small"
          :disabled="!outputValue"
          @click="handleCopy()"
        >
          复制
        </a-button>
      </div>

      <a-textarea
        v-model:value="outputValue"
        class="fast-tools-path-converter__textarea fast-tools-path-converter__textarea--output"
        readonly
        placeholder="转换后的路径会显示在这里"
        :auto-size="{ minRows: 2, maxRows: 8 }"
      />
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { normalizeWindowsPath } from '@/utils/path'

const inputValue = ref('')
const outputValue = ref('')

function convertInput(): string | null {
  if (!inputValue.value.trim()) {
    message.warning('请输入路径')
    return null
  }

  const convertedValue = normalizeWindowsPath(inputValue.value)
  outputValue.value = convertedValue
  return convertedValue
}

function handleConvert(): void {
  convertInput()
}

function handleClear(): void {
  inputValue.value = ''
  outputValue.value = ''
}

async function handleConvertAndCopy(): Promise<void> {
  const convertedValue = convertInput()

  if (!convertedValue) {
    return
  }

  await handleCopy(convertedValue)
}

async function handleCopy(value = outputValue.value): Promise<void> {
  if (!value) {
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    message.success('复制成功')
  } catch {
    message.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.fast-tools-path-converter {
  width: 100%;
  color: #1b2328;
  background: #ffffff;
  border: 1px solid #dbe4ea;
  border-radius: 8px;
  box-shadow: 0 16px 36px rgb(20 36 48 / 12%);
}

.fast-tools-path-converter__title {
  color: #17212b;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
}

.fast-tools-path-converter__body {
  width: 100%;
}

.fast-tools-path-converter__textarea {
  color: #1b2328;
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
}

.fast-tools-path-converter__textarea--output {
  background: #f7fafc;
}

.fast-tools-path-converter__output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  color: #4b5d6a;
  font-size: 13px;
  font-weight: 600;
}

:deep(.ant-card-head) {
  min-height: 42px;
  padding: 0 16px;
  border-bottom-color: #e5edf2;
}

:deep(.ant-card-body) {
  padding: 14px 16px 16px;
}

:deep(.ant-btn) {
  border-radius: 6px;
}
</style>

<template>
  <n-card class="fast-tools-path-converter" :bordered="false" size="small">
    <template #title>
      <div class="fast-tools-path-converter__title">Windows 路径转换工具</div>
    </template>

    <n-space class="fast-tools-path-converter__body" vertical :size="12">
      <n-input
        ref="inputRef"
        v-model:value="inputValue"
        type="textarea"
        class="fast-tools-path-converter__textarea"
        placeholder="请输入 Windows 路径，例如：src\content\views\App.vue"
        :autosize="{ minRows: 2, maxRows: 8 }"
        autofocus
        @keydown.enter.exact.prevent="handleConvertAndCopy"
      />

      <n-space wrap :size="8">
        <n-button type="primary" @click="handleConvert">转换</n-button>
        <n-button @click="handleClear">清空</n-button>
      </n-space>

      <div class="fast-tools-path-converter__output-head">
        <span>转换结果</span>
        <n-button type="primary" secondary size="small" :disabled="!outputValue" @click="handleCopy()">复制</n-button>
      </div>

      <n-input
        v-model:value="outputValue"
        type="textarea"
        class="fast-tools-path-converter__textarea fast-tools-path-converter__textarea--output"
        readonly
        placeholder="转换后的路径会显示在这里"
        :autosize="{ minRows: 2, maxRows: 8 }"
      />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useMessage } from "naive-ui";
import { normalizeWindowsPath } from "@/utils/path";

const inputValue = ref("");
const outputValue = ref("");
const inputRef = ref<{ focus: () => void } | null>(null);
const message = useMessage();

function convertInput(): string | null {
  if (!inputValue.value.trim()) {
    message.warning("请输入路径");
    return null;
  }

  const convertedValue = normalizeWindowsPath(inputValue.value);
  outputValue.value = convertedValue;
  return convertedValue;
}

function handleConvert(): void {
  convertInput();
}

function handleClear(): void {
  inputValue.value = "";
  outputValue.value = "";
  inputRef.value?.focus();
}

async function handleConvertAndCopy(): Promise<void> {
  const convertedValue = convertInput();

  if (!convertedValue) {
    return;
  }

  await handleCopy(convertedValue);
}

async function handleCopy(value = outputValue.value): Promise<void> {
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    message.success("复制成功");
  } catch {
    message.error("复制失败，请手动复制");
  }
}
defineExpose({
  focus: () => {
    // 使用 nextTick 确保 DOM 更新后再聚焦（虽然通常直接调用也可以，但更稳健）
    nextTick(() => {
      inputRef.value?.focus();
    });
  },
});
</script>

<style scoped>
.fast-tools-path-converter {
  width: 100%;
  color: #1b2328;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #dbe4ea;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgb(20 36 48 / 10%);
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
}

.fast-tools-path-converter__textarea :deep(textarea) {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
}

.fast-tools-path-converter__textarea--output :deep(.n-input-wrapper) {
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

:deep(.n-card-header) {
  min-height: 42px;
  padding: 0 16px;
  border-bottom: 1px solid #e5edf2;
}

:deep(.n-card__content) {
  padding: 14px 16px 16px;
}

:deep(.n-button) {
  border-radius: 6px;
}
</style>

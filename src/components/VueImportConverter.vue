<template>
  <section class="fast-tools-converter fast-tools-converter--vue">
    <header class="fast-tools-converter__hero">
      <div class="fast-tools-converter__mark" aria-hidden="true">V</div>
      <div class="fast-tools-converter__heading">
        <h2>Vue Import 转换</h2>
        <p>把 Vue 文件路径转换成可直接复制的 import 语句</p>
      </div>
      <span class="fast-tools-converter__shortcut">Enter 转换并复制</span>
    </header>

    <div class="fast-tools-converter__workspace">
      <label class="fast-tools-converter__field">
        <span class="fast-tools-converter__field-head">
          <span>输入</span>
          <span>支持多行，Shift+Enter 换行</span>
        </span>
        <textarea
          ref="inputRef"
          v-model="inputValue"
          class="fast-tools-converter__textarea"
          placeholder="src\views\business\warehouse\components\export-modal\index.vue"
          autofocus
          @keydown.enter.exact.prevent="handleConvertAndCopy"
        ></textarea>
      </label>

      <div class="fast-tools-converter__actions">
        <button class="fast-tools-converter__btn fast-tools-converter__btn--ghost" type="button" @click="handleClear">
          清空
        </button>
        <button class="fast-tools-converter__btn fast-tools-converter__btn--primary" type="button" @click="handleConvert">
          转换
        </button>
      </div>

      <label class="fast-tools-converter__field">
        <span class="fast-tools-converter__field-head">
          <span>结果</span>
          <span>自动生成 import 语句</span>
        </span>
        <textarea
          v-model="outputValue"
          class="fast-tools-converter__textarea fast-tools-converter__textarea--result"
          readonly
          placeholder="import 语句会显示在这里"
        ></textarea>
      </label>
    </div>

    <footer class="fast-tools-converter__footer">
      <button
        class="fast-tools-converter__btn fast-tools-converter__btn--copy"
        type="button"
        :disabled="!outputValue"
        @click="handleCopy()"
      >
        复制结果
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useMessage } from "naive-ui";
import { convertVuePathToImport } from "@/utils/path";

const inputValue = ref("");
const outputValue = ref("");
const inputRef = ref<HTMLTextAreaElement | null>(null);
const message = useMessage();

function convertInput(): string | null {
  if (!inputValue.value.trim()) {
    message.warning("请输入 Vue 文件路径");
    return null;
  }

  const convertedValue = convertVuePathToImport(inputValue.value);
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
    nextTick(() => {
      inputRef.value?.focus();
    });
  },
});
</script>

<style scoped>
.fast-tools-converter {
  width: 100%;
  overflow: hidden;
  color: #172033;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(248 251 255 / 98%)),
    radial-gradient(circle at 22% 0%, rgb(22 119 255 / 18%), transparent 34%);
  border: 1px solid rgb(212 224 239 / 86%);
  border-radius: 18px;
  box-shadow:
    0 24px 70px rgb(15 23 42 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 95%);
}

.fast-tools-converter__hero {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 18px 18px 16px;
  background:
    radial-gradient(circle at 0% 0%, rgb(22 119 255 / 13%), transparent 36%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-bottom: 1px solid #edf2f8;
}

.fast-tools-converter__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 900;
  background: linear-gradient(135deg, #1677ff, #62b4ff);
  border-radius: 14px;
  box-shadow: 0 12px 22px rgb(22 119 255 / 26%);
}

.fast-tools-converter__heading {
  min-width: 0;
}

.fast-tools-converter__heading h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
}

.fast-tools-converter__heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.fast-tools-converter__shortcut {
  padding: 5px 9px;
  color: #2f68b4;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  background: #eaf4ff;
  border: 1px solid #cfe3ff;
  border-radius: 999px;
}

.fast-tools-converter__workspace {
  display: grid;
  gap: 14px;
  padding: 16px 18px 14px;
}

.fast-tools-converter__field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.fast-tools-converter__field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #243247;
  font-size: 13px;
  font-weight: 800;
}

.fast-tools-converter__field-head span:last-child {
  color: #8a9ab1;
  font-size: 11px;
  font-weight: 600;
}

.fast-tools-converter__textarea {
  width: 100%;
  min-height: 92px;
  padding: 13px 14px;
  color: #172033;
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.58;
  resize: vertical;
  background: #ffffff;
  border: 1px solid #d9e3f0;
  border-radius: 14px;
  outline: none;
  box-shadow: inset 0 1px 0 rgb(15 23 42 / 3%);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.fast-tools-converter__textarea::placeholder {
  color: #a8b3c3;
}

.fast-tools-converter__textarea:focus {
  background: #ffffff;
  border-color: #1677ff;
  box-shadow: 0 0 0 4px rgb(22 119 255 / 12%);
}

.fast-tools-converter__textarea--result {
  min-height: 86px;
  background:
    linear-gradient(#f8fbff, #f8fbff) padding-box,
    repeating-linear-gradient(90deg, #b8c7da 0 8px, transparent 8px 14px) border-box;
  border: 1px dashed #b8c7da;
}

.fast-tools-converter__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.fast-tools-converter__footer {
  display: flex;
  justify-content: flex-end;
  padding: 13px 18px 16px;
  background: #fbfdff;
  border-top: 1px solid #edf2f8;
}

.fast-tools-converter__btn {
  height: 36px;
  min-width: 78px;
  padding: 0 15px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  background: #eef3f8;
  border: 1px solid transparent;
  border-radius: 11px;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease;
}

.fast-tools-converter__btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.fast-tools-converter__btn--ghost {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.fast-tools-converter__btn--primary,
.fast-tools-converter__btn--copy {
  color: #ffffff;
  background: linear-gradient(135deg, #1677ff, #3aa0ff);
  box-shadow: 0 10px 20px rgb(22 119 255 / 24%);
}

.fast-tools-converter__btn:disabled {
  color: #ffffff;
  cursor: not-allowed;
  background: linear-gradient(135deg, #b6d7ff, #89bdff);
  box-shadow: none;
  opacity: 0.74;
}

@media (max-width: 430px) {
  .fast-tools-converter__hero {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .fast-tools-converter__shortcut {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>

export type ToolKey = "path-converter" | "vue-import-converter";

export interface FastTool {
  key: ToolKey;
  title: string;
  description: string;
  icon: string;
}

export const FAST_TOOLS: FastTool[] = [
  {
    key: "path-converter",
    title: "路径转换",
    description: "将 Windows 反斜杠路径转换为通用斜杠路径",
    icon: "/",
  },
  {
    key: "vue-import-converter",
    title: "Vue Import 转换",
    description: "将 Vue 文件路径转换为 import 语句",
    icon: "V",
  },
];

export const DEFAULT_TOOL_KEY: ToolKey = "path-converter";
export const SELECTED_TOOL_STORAGE_KEY = "fast-tools:selected-tool";

export function isToolKey(value: unknown): value is ToolKey {
  return FAST_TOOLS.some((tool) => tool.key === value);
}

function getStorageArea(): chrome.storage.StorageArea | null {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return null;
  }

  return chrome.storage.local;
}

export async function getSelectedToolKey(): Promise<ToolKey> {
  const storage = getStorageArea();

  if (!storage) {
    return DEFAULT_TOOL_KEY;
  }

  const result = await storage.get<{ [SELECTED_TOOL_STORAGE_KEY]?: unknown }>(SELECTED_TOOL_STORAGE_KEY);
  const storedToolKey = result[SELECTED_TOOL_STORAGE_KEY];

  return isToolKey(storedToolKey) ? storedToolKey : DEFAULT_TOOL_KEY;
}

export async function setSelectedToolKey(toolKey: ToolKey): Promise<void> {
  const storage = getStorageArea();

  if (!storage) {
    return;
  }

  await storage.set({ [SELECTED_TOOL_STORAGE_KEY]: toolKey });
}

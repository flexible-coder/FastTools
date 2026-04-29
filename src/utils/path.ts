export function normalizeWindowsPath(input: string): string {
  return input.replace(/\\/g, '/')
}

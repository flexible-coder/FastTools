export function normalizeWindowsPath(input: string): string {
  return input.replace(/\\/g, '/')
}

function toPascalCase(input: string): string {
  const normalizedInput = input.trim()
  const parts = normalizedInput.split(/[^a-zA-Z0-9]+/).filter(Boolean)

  if (parts.length === 0) {
    return 'VueComponent'
  }

  const componentName = parts.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join('')

  return /^[A-Za-z_$]/.test(componentName) ? componentName : `Vue${componentName}`
}

function normalizeVueImportPath(input: string): string {
  const normalizedPath = normalizeWindowsPath(input.trim())
    .replace(/^["'`]+|["'`;]+$/g, '')
    .replace(/\/+/g, '/')
  const srcIndex = normalizedPath.indexOf('src/')

  if (normalizedPath.startsWith('/@/')) {
    return normalizedPath
  }

  if (normalizedPath.startsWith('@/')) {
    return `/@/${normalizedPath.slice(2)}`
  }

  if (srcIndex >= 0) {
    return `/@/${normalizedPath.slice(srcIndex + 4)}`
  }

  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
}

export function convertVuePathToImport(input: string): string {
  const importPath = normalizeVueImportPath(input)
  const pathParts = importPath.split('/').filter(Boolean)
  const fileName = pathParts[pathParts.length - 1] ?? ''
  const fileBaseName = fileName.replace(/\.[^.]+$/, '')
  const componentNameSource = fileBaseName.toLowerCase() === 'index' ? pathParts[pathParts.length - 2] : fileBaseName
  const componentName = toPascalCase(componentNameSource ?? fileBaseName)

  return `import ${componentName} from '${importPath}';`
}

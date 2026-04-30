import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [{
    js: ['src/content/main.ts'],
    matches: ['http://*/*','https://*/*','http://127.0.0.1/*'],
  }],
  permissions: [
    'sidePanel',
    'contentSettings',
    'storage',
  ],
  host_permissions: [
    'http://push2.eastmoney.com/*',
    'https://push2.eastmoney.com/*',
    'https://searchapi.eastmoney.com/*',
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
   commands: {
    // 你可以添加自定义命令，例如：
    open_panel: {
      suggested_key: {
        default: 'Ctrl+Shift+Z',
        mac: 'Command+Shift+Z',
      },
      description: '切换特定功能状态',
    },
  },
})

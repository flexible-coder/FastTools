import { createApp } from 'vue'
import naive from 'naive-ui'
import App from './views/App.vue'

console.log('[CRXJS] Hello world from content script!')

/**
 * Mount the Vue app to the DOM.
 */
function mountApp() {
  const container = document.createElement('div')
  container.id = 'fast-tools-app'
  document.body.appendChild(container)
  const app = createApp(App)
  app.use(naive)
  app.mount(container)
}

mountApp()

import { createApp } from 'vue'
import Antd, { message } from 'ant-design-vue'
import App from './views/App.vue'

console.log('[CRXJS] Hello world from content script!')

/**
 * Mount the Vue app to the DOM.
 */
function mountApp() {
  const container = document.createElement('div')
  container.id = 'fast-tools-app'
  document.body.appendChild(container)
  message.config({
    getContainer: () => container,
  })
  const app = createApp(App)
  app.use(Antd)
  app.mount(container)
}

mountApp()

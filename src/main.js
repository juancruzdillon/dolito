import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/index.js'
import App from './App.vue'
import './style.css'
import { inject } from '@vercel/analytics'

inject()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

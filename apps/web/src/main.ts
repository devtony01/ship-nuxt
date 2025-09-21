import { createApp } from 'vue'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import queryClient from './query-client'
import router from './router'
import { socketService } from './services'

import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, {
  queryClient,
})

// Initialize WebSocket connection
socketService.connect()

app.mount('#app')

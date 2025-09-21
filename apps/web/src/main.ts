import { createApp } from 'vue'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import queryClient from './query-client'
import router from './router'

import './assets/main.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, {
  queryClient
})

app.mount('#app')
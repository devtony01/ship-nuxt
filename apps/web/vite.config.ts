/// <reference types="vite/client" />

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vueDevTools from 'vite-plugin-vue-devtools'

import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      components: '/src/components',
      layouts: '/src/layouts',
      views: '/src/views',
      utils: '/src/utils',
      services: '/src/services',
      resources: '/src/resources',
      config: '/src/config',
      types: '/src/types',
      'query-client': '/src/query-client',
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from all interfaces
    strictPort: true,
    open: false,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
})

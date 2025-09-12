import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Mailer',
      fileName: 'index',
      formats: ['cjs']
    },
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'cjs',
        exports: 'named'
      }
    },
    ssr: true
  }
})
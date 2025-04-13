import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@keysako/core': resolve(__dirname, '../../packages/core/src'),
      '@keysako/vue': resolve(__dirname, '../../packages/vue/src')
    }
  }
})

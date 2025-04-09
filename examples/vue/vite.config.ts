import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@keysako-identity/core': resolve(__dirname, '../../packages/core/src'),
      '@keysako-identity/vue': resolve(__dirname, '../../packages/vue/src')
    }
  }
})

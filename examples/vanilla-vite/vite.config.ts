import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@keysako-identity/core': resolve(__dirname, '../../packages/core/src')
    }
  }
})

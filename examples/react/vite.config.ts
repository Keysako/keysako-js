import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@keysako/core': path.resolve(__dirname, '../../packages/core/src'),
      '@keysako/react': path.resolve(__dirname, '../../packages/react/src')
    }
  }
})

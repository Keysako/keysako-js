import { resolve } from 'path';

import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@keysako/core': resolve(__dirname, '../../packages/core/src'),
    },
  },
});

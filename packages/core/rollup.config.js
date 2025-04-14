import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import terser from '@rollup/plugin-terser';

// Pour obtenir __dirname dans un module ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: resolve(__dirname, 'dist/index.js'),
  output: [
    {
      file: resolve(__dirname, 'dist/index.cjs.js'),
      format: 'cjs',
      exports: 'auto',
      sourcemap: true,
    },
    {
      file: resolve(__dirname, 'dist/index.esm.js'),
      format: 'esm',
      exports: 'auto',
      sourcemap: true,
    },
    {
      file: resolve(__dirname, 'dist/index.min.js'),
      format: 'iife',
      name: 'KeysakoIdentity',
      exports: 'auto',
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: resolve(__dirname, 'dist/keysako-connect.min.js'),
      format: 'umd',
      name: 'keysako-connect',
      exports: 'auto',
      plugins: [terser()],
      sourcemap: true,
      globals: {},
    },
    {
      file: resolve(__dirname, 'dist/keysako-connect.js'),
      format: 'umd',
      name: 'keysako-connect',
      exports: 'auto',
      sourcemap: true,
      globals: {},
    },
  ],
};

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import terser from '@rollup/plugin-terser';

// Pour obtenir __dirname dans un module ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: resolve(__dirname, 'dist/index.js'),
  external: ['react', 'react-dom', '@keysako/core'],
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
      format: 'umd',
      name: 'KeysakoReact',
      exports: 'auto',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@keysako/core': 'KeysakoCore',
      },
      plugins: [terser()],
      sourcemap: true,
    },
  ],
};

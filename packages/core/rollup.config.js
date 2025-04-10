import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/index.min.js',
      format: 'iife',
      name: 'KeysakoIdentity',
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: 'dist/keysako-connect.min.js',
      format: 'umd',
      name: 'keysako-connect',
      plugins: [terser()],
      sourcemap: true,
      globals: {},
    },
    {
      file: 'dist/keysako-connect.js',
      format: 'umd',
      name: 'keysako-connect',
      sourcemap: true,
      globals: {},
    },
  ],
};

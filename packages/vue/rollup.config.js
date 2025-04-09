import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/index.js',
  external: ['vue', '@keysako-identity/core'],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'KeysakoVue',
      globals: {
        vue: 'Vue',
        '@keysako-identity/core': 'KeysakoCore'
      },
      plugins: [terser()],
      sourcemap: true
    }
  ]
};

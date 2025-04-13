import terser from '@rollup/plugin-terser';

export default {
  input: 'dist/index.js',
  external: ['react', 'react-dom', '@keysako-identity/core'],
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
      format: 'umd',
      name: 'KeysakoReact',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@keysako-identity/core': 'KeysakoCore',
      },
      plugins: [terser()],
      sourcemap: true,
    },
  ],
};

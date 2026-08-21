import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/theme.css'],
  format: ['esm'],
  dts: true,
  clean: false,
  exports: true,
  target: 'es2022',
  unbundle: true,
  // css: {

  //   splitting: true
  // }
});

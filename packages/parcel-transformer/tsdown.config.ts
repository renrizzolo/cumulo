import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: false,
  exports: true,
  outputOptions: {
    exports: 'named',
  },
});

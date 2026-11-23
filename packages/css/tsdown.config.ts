import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/runtime.ts'],
  format: ['esm'],
  dts: true,
  clean: !process.argv.includes('--watch'),
  exports: false,
});

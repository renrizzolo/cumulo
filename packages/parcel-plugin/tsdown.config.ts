import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/worker.ts'],
  format: ['esm'],
  dts: {
    entry: ['src/index.ts'],
  },
  clean: !process.argv.includes('--watch'),
});

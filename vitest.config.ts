import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    environmentMatchGlobs: [['packages/core/**', 'jsdom']],
  },
  resolve: {
    alias: {
      '@cumulo/css': path.resolve(__dirname, './packages/css/src/index.ts'),
      '@cumulo/core': path.resolve(__dirname, './packages/core/src/index.ts'),
    },
  },
});

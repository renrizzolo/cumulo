import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'fixtures',
          include: ['packages/fixtures/test/bundlers/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
          benchmark: { include: [] },
        },
      },
      {
        test: {
          name: 'core',
          include: ['packages/core/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          globals: true,
          benchmark: { include: [] },
        },
      },
      {
        test: {
          name: 'css',
          include: ['packages/css/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
          benchmark: { include: [] },
        },
      },
      {
        test: {
          name: 'unplugin',
          include: ['packages/unplugin/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
          benchmark: { include: [] },
        },
      },
      {
        test: {
          name: 'benchmarks',
          include: [],
          environment: 'node',
          benchmark: {
            include: ['packages/**/*.bench.{ts,tsx}'],
            suppressExportGetterWarnings: true,
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@cumulo/css': path.resolve(__dirname, './packages/css/src/index.ts'),
      '@cumulo/core': path.resolve(__dirname, './packages/core/src/index.ts'),
    },
  },
});

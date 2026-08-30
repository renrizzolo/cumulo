import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'core',
          include: ['packages/core/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        test: {
          name: 'css',
          include: ['packages/css/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'unplugin',
          include: ['packages/unplugin/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'fixtures',
          include: ['packages/fixtures/test/bundlers/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
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

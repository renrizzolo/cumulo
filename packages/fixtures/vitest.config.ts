import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { vitePlugin } from '@cumulo/unplugin/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  buildWithVite,
  buildWithRollup,
  buildWithEsbuild,
  buildWithWebpack,
} from './src/helpers/bundler-builders.js';

export default defineConfig({
  plugins: [react(), vitePlugin()],
  resolve: {
    alias: {
      '@cumulo/css': path.resolve(__dirname, '../css/src/index.ts'),
      '@cumulo/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@cumulo/unplugin': path.resolve(__dirname, '../unplugin/src/index.ts'),
      '@cumulo/unplugin/vite': path.resolve(__dirname, '../unplugin/src/vite.ts'),
      '@cumulo/unplugin/rollup': path.resolve(__dirname, '../unplugin/src/rollup.ts'),
      '@cumulo/unplugin/esbuild': path.resolve(__dirname, '../unplugin/src/esbuild.ts'),
      '@cumulo/unplugin/webpack': path.resolve(__dirname, '../unplugin/src/webpack.ts'),
      '@cumulo/parcel-transformer': path.resolve(__dirname, '../parcel-transformer/src/index.ts'),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: 'bundlers',
          include: ['test/bundlers/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
        },
      },
      {
        plugins: [react(), vitePlugin()],
        test: {
          name: 'browser',
          include: ['test/browser/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
            expect: {
              toMatchScreenshot: {
                comparatorOptions: {
                  threshold: 0.1,
                },
              },
            },
            commands: {
              getBundlerBuild: async (ctx, bundler: string) => {
                const outDir = path.resolve(__dirname, `test/.temp/${bundler}-browser`);
                if (bundler === 'vite') return await buildWithVite(outDir);
                if (bundler === 'rollup') return await buildWithRollup(outDir);
                if (bundler === 'esbuild') return await buildWithEsbuild(outDir);
                if (bundler === 'webpack') return await buildWithWebpack(outDir);
                throw new Error(`Unknown bundler: ${bundler}`);
              },
            },
          },
        },
      },
    ],
  },
});

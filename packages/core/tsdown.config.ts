import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/*.tsx',
    '!src/**/*.test.*',
    'src/theme.css',
    'src/intents.ts',
    'src/layout.ts',
    'src/transitions.ts',
    'src/typography.ts',
    'src/cli/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: !process.argv.includes('--watch'),
  exports: false,
  target: 'es2022',
  unbundle: true,
  deps: {
    neverBundle: ['oxfmt'],
  },
});

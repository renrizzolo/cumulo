import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/theme.css', 'src/intents.ts', 'src/layout.ts', 'src/typography.ts'],
  format: ['esm'],
  dts: true,
  clean: false,
  exports: false,
  target: 'es2022',
  unbundle: true,
});
